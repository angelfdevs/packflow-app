const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { URL } = require('node:url')
const jsonServer = require('json-server')

const localDb = path.join(__dirname, 'db.local.json')
const seedDb = path.join(__dirname, 'db.seed.json')

if (!fs.existsSync(localDb)) fs.copyFileSync(seedDb, localDb)

const server = jsonServer.create()
const router = jsonServer.router(localDb)
const middlewares = jsonServer.defaults()
const sessions = new Map()
const accessTokens = new Map()
const idempotencyResponses = new Map()

server.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin === 'http://localhost:5173') {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-CSRF-TOKEN, Idempotency-Key, If-Match')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

server.use(middlewares)
server.use(jsonServer.bodyParser)

function body(res, status, data, headers = {}) {
  if (res.locals?.idempotencyCacheKey) {
    idempotencyResponses.set(res.locals.idempotencyCacheKey, { status, data, headers })
    delete res.locals.idempotencyCacheKey
  }
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value))
  if (status === 204) return res.sendStatus(204)
  res.status(status).json(data)
}

function problem(res, status, errorCode, title, detail) {
  return body(res, status, {
    type: 'https://api.packflow.example/problems/' + errorCode.toLowerCase(),
    title,
    status,
    errorCode,
    detail,
    traceId: crypto.randomUUID(),
  })
}

function dbCollection(name) {
  return router.db.get(name)
}

function now() {
  return new Date().toISOString()
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex')
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=')
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())]
  }))
}

function setAuthCookies(res, refreshToken, csrfToken) {
  res.setHeader('Set-Cookie', [
    'pf_refresh=' + refreshToken + '; HttpOnly; SameSite=Lax; Path=/api/v1/auth',
    'XSRF-TOKEN=' + csrfToken + '; SameSite=Lax; Path=/api/v1/auth',
  ])
}

function clearAuthCookies(res) {
  res.setHeader('Set-Cookie', [
    'pf_refresh=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/api/v1/auth',
    'XSRF-TOKEN=; SameSite=Lax; Max-Age=0; Path=/api/v1/auth',
  ])
}

function accountForRequest(req) {
  const authorization = req.headers.authorization || ''
  const token = authorization.replace(/^Bearer\s+/i, '')
  const session = accessTokens.get(token)
  if (!session || session.expiresAt < Date.now()) return null
  return dbCollection('accounts').find({ id: session.accountId }).value()
}

function csrfIsValid(req) {
  const cookies = parseCookies(req)
  return Boolean(req.headers['x-csrf-token'] && cookies['XSRF-TOKEN'] && req.headers['x-csrf-token'] === cookies['XSRF-TOKEN'])
}

function requireAccount(req, res) {
  const account = accountForRequest(req)
  if (!account) {
    problem(res, 401, 'AUTHENTICATION_REQUIRED', 'Autenticación requerida', 'La sesión no es válida o expiró.')
    return null
  }
  return account
}

function paginate(items, query) {
  const page = Math.max(1, Number(query.page || 1))
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || 20)))
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), page, pageSize, totalItems: items.length }
}

function getSettings() {
  return dbCollection('settings').first().value()
}

function getProduct(productId) {
  return dbCollection('products').find({ productId }).value()
}

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[×*]/g, 'x')
    .replace(/\s*x\s*/g, 'x')
    .replace(/[^a-z0-9x]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function productSearchText(item) {
  const dimensions = item.dimensions || {}
  return [
    item.name,
    item.categoryName,
    item.materialName,
    dimensions.lengthCm + 'x' + dimensions.widthCm + 'x' + dimensions.heightCm,
  ].join(' ')
}

function publicAccount(account) {
  const safeAccount = { ...account }
  delete safeAccount.id
  delete safeAccount.password
  return safeAccount
}

function idempotencyKey(account, route, req) {
  const key = req.headers['idempotency-key']
  return key ? account.id + ':' + route + ':' + key : null
}

function roundMoney(value) {
  return Number(Number(value).toFixed(2))
}

function getSerigraphyRate(settings, quantity) {
  const tier = settings.screenPrintingTiers.find((item) => quantity >= item.from && (item.to === null || quantity <= item.to))
  return tier ? Number(tier.ratePerColor) : 0
}

function calculateOperation(payload) {
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    const error = new Error('Agrega al menos un producto.')
    error.status = 422
    throw error
  }
  if (payload.items.length > 20 || new Set(payload.items.map((item) => item.productId)).size !== payload.items.length) {
    const error = new Error('La operación debe contener entre 1 y 20 productos diferentes.')
    error.status = 422
    throw error
  }

  const settings = getSettings()
  const resultItems = payload.items.map((item) => {
    const product = getProduct(item.productId)
    if (!product || !product.active) {
      const error = new Error('Uno de los productos no está disponible.')
      error.status = 422
      throw error
    }
    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1_000_000) {
      const error = new Error('La cantidad de cada línea no es válida.')
      error.status = 422
      throw error
    }
    const priceType = quantity <= 100 ? 'RETAIL' : 'WHOLESALE'
    const unitPrice = Number(product[priceType === 'RETAIL' ? 'retailPrice' : 'wholesalePrice'])
    const productAmount = roundMoney(unitPrice * quantity)
    const printing = item.screenPrinting || { enabled: false, colors: 0 }
    let printingResult = { enabled: false, colors: 0, lots: 0, ratePerColor: '0.00', amount: '0.00' }

    if (printing.enabled) {
      const colors = Number(printing.colors)
      if (quantity < 20 || !Number.isInteger(colors) || colors < 1 || colors > 10) {
        const error = new Error('La serigrafía requiere entre 1 y 10 colores y al menos 20 unidades.')
        error.status = 422
        throw error
      }
      const lots = Math.ceil(quantity / 100)
      const rate = getSerigraphyRate(settings, quantity)
      printingResult = {
        enabled: true,
        colors,
        lots,
        ratePerColor: rate.toFixed(2),
        amount: roundMoney(lots * colors * rate).toFixed(2),
      }
    }

    const lineAmount = roundMoney(productAmount + Number(printingResult.amount))
    return {
      productId: product.productId,
      productName: product.name,
      categoryName: product.categoryName,
      materialName: product.materialName,
      dimensions: product.dimensions,
      quantity,
      unitPrice: unitPrice.toFixed(2),
      priceType,
      productAmount: productAmount.toFixed(2),
      screenPrinting: printingResult,
      lineAmount: lineAmount.toFixed(2),
    }
  })

  const beforeDiscount = roundMoney(resultItems.reduce((sum, item) => sum + Number(item.lineAmount), 0))
  let discount
  let discountAmount = 0
  if (payload.discount) {
    const value = Number(payload.discount.value)
    if (!['PERCENTAGE', 'FIXED'].includes(payload.discount.type) || value < 0) {
      const error = new Error('El descuento no es válido.')
      error.status = 422
      throw error
    }
    discountAmount = payload.discount.type === 'PERCENTAGE' ? roundMoney(beforeDiscount * value / 100) : roundMoney(value)
    if (discountAmount > beforeDiscount) {
      const error = new Error('El descuento no puede superar el importe de la operación.')
      error.status = 422
      throw error
    }
    discount = { type: payload.discount.type, value: value.toFixed(2), amount: discountAmount.toFixed(2) }
  }

  const subtotal = roundMoney(beforeDiscount - discountAmount)
  const igv = roundMoney(subtotal * Number(settings.igvRate))
  return {
    items: resultItems,
    ...(discount ? { discount } : {}),
    subtotal: subtotal.toFixed(2),
    igvRate: Number(settings.igvRate),
    igv: igv.toFixed(2),
    total: roundMoney(subtotal + igv).toFixed(2),
    currency: 'PEN',
  }
}

async function handleCustom(req, res) {
  const parsed = new URL(req.url, 'http://localhost')
  const pathName = parsed.pathname
  if (!pathName.startsWith('/api/v1')) return false
  const route = pathName.slice('/api/v1'.length) || '/'
  const method = req.method
  const query = Object.fromEntries(parsed.searchParams.entries())

  if (route === '/auth/csrf' && method === 'GET') {
    const token = randomToken()
    res.setHeader('Set-Cookie', 'XSRF-TOKEN=' + token + '; SameSite=Lax; Path=/api/v1/auth')
    return body(res, 200, { csrfToken: token })
  }

  if (route === '/auth/login' && method === 'POST') {
    const account = dbCollection('accounts').find({ email: String(req.body?.email || '').trim().toLowerCase() }).value()
    if (!account || account.password !== req.body?.password) return problem(res, 401, 'INVALID_CREDENTIALS', 'Credenciales incorrectas', 'Las credenciales de inicio de sesión son incorrectas.')
    const accessToken = randomToken()
    const refreshToken = randomToken()
    const csrfToken = randomToken()
    sessions.set(refreshToken, { accountId: account.id, csrfToken })
    accessTokens.set(accessToken, { accountId: account.id, expiresAt: Date.now() + 900_000 })
    setAuthCookies(res, refreshToken, csrfToken)
    return body(res, 200, {
      accessToken,
      expiresIn: 900,
      csrfToken,
      account: { businessAccountId: account.businessAccountId, businessName: account.businessName, email: account.email },
    })
  }

  if (route === '/auth/refresh' && method === 'POST') {
    const cookies = parseCookies(req)
    if (!csrfIsValid(req) || !cookies.pf_refresh || !sessions.has(cookies.pf_refresh)) return problem(res, 401, 'SESSION_EXPIRED', 'Sesión expirada', 'La sesión ya no es válida.')
    const session = sessions.get(cookies.pf_refresh)
    sessions.delete(cookies.pf_refresh)
    const newRefresh = randomToken()
    const newCsrf = randomToken()
    sessions.set(newRefresh, { accountId: session.accountId, csrfToken: newCsrf })
    const accessToken = randomToken()
    accessTokens.set(accessToken, { accountId: session.accountId, expiresAt: Date.now() + 900_000 })
    setAuthCookies(res, newRefresh, newCsrf)
    return body(res, 200, { accessToken, expiresIn: 900, csrfToken: newCsrf })
  }

  if (route === '/auth/logout' && method === 'POST') {
    if (!csrfIsValid(req)) return problem(res, 403, 'CSRF_INVALID', 'Solicitud no válida', 'La protección CSRF rechazó la solicitud.')
    const cookies = parseCookies(req)
    if (cookies.pf_refresh) sessions.delete(cookies.pf_refresh)
    clearAuthCookies(res)
    return body(res, 204)
  }

  if (route === '/auth/password/forgot' && method === 'POST') {
    return body(res, 202, { message: 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.' })
  }

  if (route === '/auth/password/reset' && method === 'POST') return body(res, 204)

  const account = accountForRequest(req)
  if (route !== '/auth/me' && !account) return problem(res, 401, 'AUTHENTICATION_REQUIRED', 'Autenticación requerida', 'La sesión no es válida o expiró.')

  if (account && method !== 'GET' && req.headers['idempotency-key']) {
    const cacheKey = idempotencyKey(account, route, req)
    const cached = idempotencyResponses.get(cacheKey)
    if (cached) return body(res, cached.status, cached.data, cached.headers)
    res.locals.idempotencyCacheKey = cacheKey
  }

  if (route === '/auth/me' && method === 'GET') {
    const current = requireAccount(req, res)
    if (!current) return true
    return body(res, 200, { businessAccountId: current.businessAccountId, businessName: current.businessName, email: current.email })
  }

  if (route === '/auth/password/change' && method === 'POST') {
    if (!csrfIsValid(req)) return problem(res, 403, 'CSRF_INVALID', 'Solicitud no válida', 'La protección CSRF rechazó la solicitud.')
    if (account.password !== req.body?.currentPassword) return problem(res, 422, 'PASSWORD_INVALID', 'Contraseña actual inválida', 'La contraseña actual no coincide.')
    if (!req.body?.newPassword || req.body.newPassword !== req.body.confirmPassword || req.body.newPassword.length < 12) {
      return problem(res, 422, 'PASSWORD_INVALID', 'Contraseña inválida', 'La nueva contraseña no cumple las reglas requeridas.')
    }
    dbCollection('accounts').find({ id: account.id }).assign({ password: req.body.newPassword, version: account.version + 1, updatedAt: now() }).write()
    for (const [token, session] of accessTokens) if (session.accountId === account.id) accessTokens.delete(token)
    for (const [token, session] of sessions) if (session.accountId === account.id) sessions.delete(token)
    return body(res, 204)
  }

  if (route === '/account' && method === 'GET') return body(res, 200, publicAccount(dbCollection('accounts').find({ id: account.id }).value()))
  if (route === '/account' && method === 'PATCH') {
    const current = dbCollection('accounts').find({ id: account.id }).value()
    if (req.headers['if-match'] && req.headers['if-match'] !== '"v' + current.version + '"') return problem(res, 409, 'CONCURRENCY_CONFLICT', 'Conflicto de actualización', 'Los datos cambiaron en otra sesión.')
    const next = { ...current, ...req.body, id: current.id, version: current.version + 1, updatedAt: now() }
    dbCollection('accounts').find({ id: account.id }).assign(next).write()
    return body(res, 200, publicAccount(next), { ETag: '"v' + next.version + '"' })
  }

  if (route === '/settings' && method === 'GET') return body(res, 200, getSettings(), { ETag: '"v' + getSettings().version + '"' })
  if (route === '/settings' && method === 'PATCH') {
    const current = getSettings()
    const next = { ...current, ...req.body, id: current.id, version: current.version + 1 }
    dbCollection('settings').find({ id: current.id }).assign(next).write()
    return body(res, 200, next, { ETag: '"v' + next.version + '"' })
  }

  if (route === '/categories' && method === 'GET') return body(res, 200, paginate(dbCollection('categories').value(), query))
  if (route === '/categories' && method === 'POST') {
    const value = String(req.body?.name || '').trim()
    const exists = dbCollection('categories').find((item) => item.name.toLowerCase() === value.toLowerCase()).value()
    if (exists) return problem(res, 409, 'DUPLICATE_CATEGORY', 'Categoría duplicada', 'Ya existe una categoría con ese nombre.')
    const id = crypto.randomUUID()
    const item = { id, categoryId: id, name: value }
    dbCollection('categories').push(item).write()
    return body(res, 201, item)
  }
  if (route === '/materials' && method === 'GET') return body(res, 200, paginate(dbCollection('materials').value(), query))
  if (route === '/materials' && method === 'POST') {
    const value = String(req.body?.name || '').trim()
    const exists = dbCollection('materials').find((item) => item.name.toLowerCase() === value.toLowerCase()).value()
    if (exists) return problem(res, 409, 'DUPLICATE_MATERIAL', 'Material duplicado', 'Ya existe un material con ese nombre.')
    const id = crypto.randomUUID()
    const item = { id, materialId: id, name: value }
    dbCollection('materials').push(item).write()
    return body(res, 201, item)
  }

  if (route === '/products' && method === 'GET') {
    let items = dbCollection('products').value()
    if (query.active !== undefined) items = items.filter((item) => String(item.active) === query.active)
    if (query.categoryId) items = items.filter((item) => item.categoryId === query.categoryId)
    if (query.materialId) items = items.filter((item) => item.materialId === query.materialId)
    if (query.search) {
      const needle = normalizeSearch(query.search)
      items = items.filter((item) => normalizeSearch(productSearchText(item)).includes(needle))
    }
    return body(res, 200, paginate(items, query))
  }

  const productMatch = route.match(/^\/products\/([^/]+)(?:\/status)?$/)
  if (route === '/products' && method === 'POST') {
    const payload = req.body || {}
    const category = dbCollection('categories').find({ categoryId: payload.categoryId }).value()
    const material = dbCollection('materials').find({ materialId: payload.materialId }).value()
    if (!category || !material) return problem(res, 422, 'INVALID_REFERENCE', 'Producto inválido', 'La categoría o material no existe.')
    const id = crypto.randomUUID()
    const stock = Number(payload.initialStock || 0)
    const item = { ...payload, id, productId: id, categoryName: category.name, materialName: material.name, currentStock: stock, active: true, version: 1, updatedAt: now() }
    dbCollection('products').push(item).write()
    if (stock > 0) addMovement(item.productId, 'INITIAL_RECEIPT', stock, 0, stock, 'Stock inicial')
    return body(res, 201, item, { ETag: '"v1"' })
  }
  if (productMatch && method === 'GET') {
    const product = getProduct(productMatch[1])
    if (!product) return problem(res, 404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado', 'No existe el producto solicitado.')
    return body(res, 200, product, { ETag: '"v' + product.version + '"' })
  }
  if (productMatch && method === 'PUT') {
    const product = getProduct(productMatch[1])
    if (!product) return problem(res, 404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado', 'No existe el producto solicitado.')
    if (req.headers['if-match'] && req.headers['if-match'] !== '"v' + product.version + '"') return problem(res, 409, 'CONCURRENCY_CONFLICT', 'Conflicto de actualización', 'El producto cambió en otra sesión.')
    const category = dbCollection('categories').find({ categoryId: req.body.categoryId }).value()
    const material = dbCollection('materials').find({ materialId: req.body.materialId }).value()
    const next = { ...product, ...req.body, categoryName: category?.name, materialName: material?.name, version: product.version + 1, updatedAt: now() }
    dbCollection('products').find({ productId: product.productId }).assign(next).write()
    return body(res, 200, next, { ETag: '"v' + next.version + '"' })
  }
  if (route.match(/^\/products\/([^/]+)\/status$/) && method === 'PATCH') {
    const productId = route.split('/')[2]
    const product = getProduct(productId)
    if (!product) return problem(res, 404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado', 'No existe el producto solicitado.')
    const next = { ...product, active: Boolean(req.body.active), version: product.version + 1, updatedAt: now() }
    dbCollection('products').find({ productId }).assign(next).write()
    return body(res, 200, next, { ETag: '"v' + next.version + '"' })
  }

  if (route === '/inventory/stock' && method === 'GET') {
    let items = dbCollection('products').value()
    if (query.active !== undefined) items = items.filter((item) => String(item.active) === query.active)
    if (query.search) {
      const needle = normalizeSearch(query.search)
      items = items.filter((item) => normalizeSearch(productSearchText(item)).includes(needle))
    }
    return body(res, 200, paginate(items, query))
  }
  if (route === '/inventory/receipts' && method === 'POST') {
    const product = getProduct(req.body.productId)
    const quantity = Number(req.body.quantity)
    if (!product || !Number.isInteger(quantity) || quantity < 1) return problem(res, 422, 'INVALID_RECEIPT', 'Ingreso inválido', 'El producto y la cantidad son obligatorios.')
    const result = updateStock(product, quantity, 'RECEIPT', product.currentStock, product.currentStock + quantity, req.body.reason)
    return body(res, 201, result)
  }
  if (route === '/inventory/adjustments' && method === 'POST') {
    const product = getProduct(req.body.productId)
    const quantity = Number(req.body.quantity)
    const direction = req.body.direction
    const adjustmentType = req.body.adjustmentType
    const delta = req.body.direction === 'DECREASE' ? -quantity : quantity
    if (!product || !Number.isInteger(quantity) || quantity < 1 || product.currentStock + delta < 0) return problem(res, 422, 'INVALID_ADJUSTMENT', 'Ajuste inválido', 'El ajuste no puede producir stock negativo.')
    if (!['INCREASE', 'DECREASE'].includes(direction) || !['LOSS', 'DAMAGE', 'CORRECTION'].includes(adjustmentType)) return problem(res, 422, 'INVALID_ADJUSTMENT', 'Ajuste inválido', 'El tipo y la dirección del ajuste no son válidos.')
    if (direction === 'INCREASE' && adjustmentType !== 'CORRECTION') return problem(res, 422, 'INVALID_ADJUSTMENT', 'Ajuste inválido', 'Las pérdidas y daños solo pueden disminuir stock.')
    if (direction === 'DECREASE' && !String(req.body.reason || '').trim()) return problem(res, 422, 'INVALID_ADJUSTMENT', 'Ajuste inválido', 'Toda disminución de stock requiere una justificación.')
    const result = updateStock(product, delta, adjustmentType, product.currentStock, product.currentStock + delta, req.body.reason)
    return body(res, 201, result)
  }
  if (route === '/inventory/movements' && method === 'GET') return body(res, 200, paginate(dbCollection('movements').value().slice().reverse(), query))

  if (route === '/quotes/preview' && method === 'POST') {
    try {
      return body(res, 200, calculateOperation(req.body))
    } catch (error) {
      return problem(res, error.status || 422, 'OPERATION_INVALID', 'Operación inválida', error.message)
    }
  }

  if (route === '/sales' && method === 'GET') return body(res, 200, paginate(dbCollection('sales').value().slice().reverse(), query))
  if (route === '/sales' && method === 'POST') {
    try {
      const cacheKey = idempotencyKey(account, route, req)
      const cached = cacheKey ? idempotencyResponses.get(cacheKey) : null
      if (cached) return body(res, cached.status, cached.data, cached.headers)
      const result = calculateOperation(req.body)
      for (const item of req.body.items) {
        const product = getProduct(item.productId)
        if (product.currentStock < Number(item.quantity)) return problem(res, 422, 'INSUFFICIENT_STOCK', 'Stock insuficiente', 'No hay stock suficiente para completar toda la venta.')
      }
      const saleId = crypto.randomUUID()
      for (const item of req.body.items) {
        const product = getProduct(item.productId)
        updateStock(product, -Number(item.quantity), 'SALE_OUT', product.currentStock, product.currentStock - Number(item.quantity), 'Salida por venta ' + saleId, saleId)
      }
      const description = String(req.body.description || '').trim()
      const sale = { id: saleId, saleId, status: 'CONFIRMED', ...(description ? { description } : {}), ...result, createdAt: now() }
      dbCollection('sales').push(sale).write()
      if (cacheKey) idempotencyResponses.set(cacheKey, { status: 201, data: sale, headers: {} })
      return body(res, 201, sale)
    } catch (error) {
      if (error.status) return problem(res, error.status, 'SALE_INVALID', 'Venta inválida', error.message)
      return problem(res, 422, 'SALE_INVALID', 'Venta inválida', error.message)
    }
  }
  const saleMatch = route.match(/^\/sales\/([^/]+)$/)
  if (saleMatch && method === 'GET') {
    const sale = dbCollection('sales').find({ saleId: saleMatch[1] }).value()
    if (!sale) return problem(res, 404, 'SALE_NOT_FOUND', 'Venta no encontrada', 'No existe la venta solicitada.')
    return body(res, 200, sale)
  }

  if (route === '/dashboard/summary' && method === 'GET') {
    const products = dbCollection('products').value()
    const movements = dbCollection('movements').value().slice().reverse()
    const sales = dbCollection('sales').value().slice().reverse()
    return body(res, 200, {
      activeProducts: products.filter((item) => item.active).length,
      lowStockProducts: products.filter((item) => item.active && item.currentStock <= 15).length,
      lowStockThreshold: 15,
      lowStockItems: products.filter((item) => item.active && item.currentStock <= 15).map((item) => ({ productId: item.productId, name: item.name, currentStock: item.currentStock })),
      recentSales: sales.slice(0, 10).map((item) => ({ saleId: item.saleId, total: item.total, createdAt: item.createdAt })),
      recentMovements: movements.slice(0, 10).map((item) => {
        const product = getProduct(item.productId)
        return { movementId: item.movementId, productId: item.productId, productName: product?.name, dimensions: product?.dimensions, movementType: item.movementType, quantityDelta: item.quantityDelta, createdAt: item.createdAt }
      }),
    })
  }

  return false
}

function addMovement(productId, movementType, quantityDelta, previousStock, resultingStock, reason, saleId) {
  const id = crypto.randomUUID()
  const product = getProduct(productId)
  dbCollection('movements').push({ id, movementId: id, productId, productName: product?.name, dimensions: product?.dimensions, saleId, movementType, quantityDelta, previousStock, resultingStock, reason, createdAt: now() }).write()
}

function updateStock(product, delta, movementType, previousStock, resultingStock, reason, saleId) {
  dbCollection('products').find({ productId: product.productId }).assign({ currentStock: resultingStock, version: product.version + 1, updatedAt: now() }).write()
  addMovement(product.productId, movementType, delta, previousStock, resultingStock, reason, saleId)
  return { productId: product.productId, movementType, quantityDelta: delta, previousStock, resultingStock, reason, createdAt: now() }
}

server.use(async (req, res, next) => {
  if (['/health', '/api/v1/health/live', '/api/v1/health/ready'].includes(req.url)) return body(res, 200, { status: 'ok' })
  try {
    const handled = await handleCustom(req, res)
    if (!handled && !res.headersSent) return next()
  } catch (error) {
    console.error(error)
    return problem(res, 500, 'MOCK_SERVER_ERROR', 'Error del mock', error.message)
  }
})

server.use('/api/v1', router)

const port = Number(process.env.MOCK_PORT || 3001)
server.listen(port, () => {
  console.log('PackFlow fake API disponible en http://localhost:' + port + '/api/v1')
  console.log('Usuario demo: admin@packflow.local / PackFlowDemo123!')
})
