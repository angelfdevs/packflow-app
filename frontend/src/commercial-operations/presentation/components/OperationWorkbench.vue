<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import PageHeader from '../../../shared/presentation/components/PageHeader.vue'
import ConfirmDialog from '../../../shared/presentation/components/ConfirmDialog.vue'
import { catalogService } from '../../../catalog/application/catalogService'
import { commercialOperationService } from '../../application/commercialOperationService'
import { operationRules } from '../../domain/operationRules'
import { formatMoney, formatDimensions } from '../../../shared/application/formatters'
import { getFriendlyError } from '../../../shared/application/useApiError'
import { useToastStore } from '../../../shared/application/stores/toastStore'
import { useOperationDraftStore } from '../../application/stores/operationDraftStore'

const props = defineProps({
  mode: { type: String, default: 'quote' },
})

const toast = useToastStore()
const draftStore = useOperationDraftStore()
const products = ref([])
const searchResults = ref([])
const selectedProductId = ref('')
const productQuery = ref('')
const productPickerOpen = ref(false)
const items = ref([])
const calculation = ref(null)
const errorMessage = ref('')
const loading = ref(false)
const loadingProducts = ref(true)
const confirmSale = ref(false)
const discount = reactive({ type: '', value: '' })
const saleDescription = ref('')
let productSearchTimer = null

const isSale = computed(() => props.mode === 'sale')
const title = computed(() => (isSale.value ? 'Registrar venta' : 'Cotizador'))
const description = computed(() => (isSale.value ? 'Confirma operaciones y actualiza el stock dentro de una transacción.' : 'Simula el importe para responder rápidamente a tu cliente.'))

function mergeProducts(newProducts) {
  const merged = new Map(products.value.map((product) => [product.productId, product]))
  newProducts.forEach((product) => merged.set(product.productId, product))
  products.value = [...merged.values()]
}

async function loadProducts(searchTerm = '') {
  loadingProducts.value = true
  try {
    const response = await catalogService.listProducts({
      active: 'true',
      search: searchTerm.trim() || undefined,
      page: 1,
      pageSize: 20,
    })
    searchResults.value = response.data.items
    mergeProducts(response.data.items)
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loadingProducts.value = false
  }
}

function handleProductSearch() {
  selectedProductId.value = ''
  productPickerOpen.value = true
  invalidateCalculation()
  if (productSearchTimer) window.clearTimeout(productSearchTimer)
  productSearchTimer = window.setTimeout(() => loadProducts(productQuery.value), 250)
}

function selectProduct(product) {
  selectedProductId.value = product.productId
  productQuery.value = product.name + ' · ' + formatDimensions(product.dimensions)
  productPickerOpen.value = false
}

function getProduct(productId) {
  return products.value.find((product) => product.productId === productId)
}

function addProduct() {
  const product = getProduct(selectedProductId.value)
  if (!product) return
  if (items.value.some((item) => item.productId === product.productId)) {
    toast.add('Ese producto ya está agregado a la operación.', 'error')
    return
  }
  if (items.value.length >= operationRules.maxItems) {
    toast.add('Una operación puede contener como máximo 20 productos diferentes.', 'error')
    return
  }
  items.value.push({
    product,
    productId: product.productId,
    quantity: 1,
    screenPrinting: { enabled: false, colors: 0 },
  })
  selectedProductId.value = ''
  productQuery.value = ''
  productPickerOpen.value = false
  calculation.value = null
}

function removeItem(productId) {
  items.value = items.value.filter((item) => item.productId !== productId)
  calculation.value = null
}

function clearOperation() {
  items.value = []
  calculation.value = null
  selectedProductId.value = ''
  productQuery.value = ''
  productPickerOpen.value = false
  Object.assign(discount, { type: '', value: '' })
  saleDescription.value = ''
  errorMessage.value = ''
  confirmSale.value = false
  draftStore.clear(props.mode)
}

function invalidateCalculation() {
  calculation.value = null
}

function handleQuantityInput(item) {
  if (!operationRules.isSerigraphyAvailable(item.quantity) && item.screenPrinting.enabled) {
    item.screenPrinting.enabled = false
    item.screenPrinting.colors = 0
    toast.add('La serigrafía se desactivó porque requiere al menos 20 unidades.', 'info')
  }
  invalidateCalculation()
}

function buildPayload() {
  const payload = {
    items: items.value.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      screenPrinting: {
        enabled: item.screenPrinting.enabled,
        colors: item.screenPrinting.enabled ? Number(item.screenPrinting.colors) : 0,
      },
    })),
  }
  if (discount.type && discount.value !== '') {
    payload.discount = { type: discount.type, value: String(Number(discount.value).toFixed(2)) }
  }
  if (isSale.value && saleDescription.value.trim()) payload.description = saleDescription.value.trim()
  return payload
}

function validate() {
  if (!items.value.length) return 'Agrega al menos un producto.'
  for (const item of items.value) {
    if (!operationRules.isValidQuantity(item.quantity)) return 'Cada cantidad debe ser un entero entre 1 y 1 000 000.'
    if (item.screenPrinting.enabled) {
      if (!operationRules.isSerigraphyAvailable(item.quantity)) return 'La serigrafía requiere al menos 20 unidades por línea.'
      if (!operationRules.isValidColors(item.screenPrinting.colors)) return 'Los colores deben estar entre 1 y 10.'
    }
  }
  if (discount.type && (!discount.value || Number(discount.value) < 0)) return 'Ingresa un descuento válido.'
  if (discount.type === 'PERCENTAGE' && Number(discount.value) > 100) return 'El descuento porcentual no puede superar 100 %.'
  return ''
}

async function calculate() {
  errorMessage.value = validate()
  if (errorMessage.value) return
  loading.value = true
  try {
    const response = await commercialOperationService.preview(buildPayload())
    calculation.value = response.data
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loading.value = false
  }
}

async function saveSale() {
  errorMessage.value = validate()
  if (errorMessage.value) return
  loading.value = true
  try {
    await commercialOperationService.createSale(buildPayload())
    toast.add('Venta registrada y stock actualizado.', 'success')
    clearOperation()
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loading.value = false
  }
}

async function restoreDraft() {
  const saved = draftStore.restore(props.mode)
  if (!saved) return
  const missingProductIds = saved.items.filter((item) => !getProduct(item.productId)).map((item) => item.productId)
  if (missingProductIds.length) {
    const responses = await Promise.allSettled(missingProductIds.map((productId) => catalogService.getProduct(productId)))
    mergeProducts(responses.filter((response) => response.status === 'fulfilled').map((response) => response.value.data))
  }
  items.value = saved.items
    .map((item) => ({ ...item, product: getProduct(item.productId) }))
    .filter((item) => item.product)
  Object.assign(discount, saved.discount)
  saleDescription.value = saved.description || ''
}

watch(
  [items, discount, saleDescription],
  () => {
    if (items.value.length || discount.type || saleDescription.value.trim()) {
      draftStore.save(props.mode, { items: items.value, discount, description: saleDescription.value })
    } else {
      draftStore.clear(props.mode)
    }
  },
  { deep: true },
)

onMounted(async () => {
  await loadProducts()
  await restoreDraft()
})

onBeforeUnmount(() => {
  if (productSearchTimer) window.clearTimeout(productSearchTimer)
})
</script>

<template>
  <PageHeader eyebrow="Operaciones comerciales" :title="title" :description="description">
    <template #actions>
      <button v-if="!isSale" class="pf-button pf-button-secondary" type="button" @click="clearOperation">
        <CIcon icon="cil-filter-x" width="17" /> Limpiar cotización
      </button>
      <RouterLink v-if="isSale" class="pf-button pf-button-secondary" to="/sales/history"><CIcon icon="cil-history" width="17" /> Historial de ventas</RouterLink>
    </template>
  </PageHeader>

  <div v-if="errorMessage" class="pf-alert" role="alert" style="margin-bottom: 18px">{{ errorMessage }}</div>

  <div class="pf-grid pf-grid-2" style="align-items: start">
    <section class="pf-card">
      <div class="pf-card-header">
        <div>
          <h2 class="pf-card-title">Líneas de operación</h2>
          <div class="pf-kpi-label">{{ items.length }} de {{ operationRules.maxItems }} productos diferentes</div>
        </div>
      </div>

      <div class="pf-toolbar">
        <div class="pf-field pf-product-picker">
          <label for="operation-product">Buscar y agregar producto</label>
          <input id="operation-product" v-model="productQuery" class="pf-input" placeholder="Nombre, medida, categoría o material" autocomplete="off" @focus="productPickerOpen = true" @input="handleProductSearch" />
          <div v-if="loadingProducts" class="pf-picker-status">Buscando productos…</div>
          <div v-else-if="productPickerOpen && productQuery.trim() && !searchResults.length" class="pf-picker-status">No se encontraron productos.</div>
          <div v-else-if="productPickerOpen && searchResults.length" class="pf-product-results" role="listbox" aria-label="Productos encontrados">
            <button v-for="product in searchResults" :key="product.productId" class="pf-product-result" type="button" role="option" :aria-selected="selectedProductId === product.productId" @click="selectProduct(product)">
              <strong>{{ product.name }}</strong>
              <span>{{ formatDimensions(product.dimensions) }} · {{ product.categoryName || 'Categoría' }} · {{ product.materialName || 'Material' }}</span>
            </button>
          </div>
        </div>
        <button class="pf-button pf-button-secondary" type="button" :disabled="loadingProducts || !selectedProductId" @click="addProduct">
          <CIcon icon="cil-plus" width="17" /> Agregar
        </button>
      </div>

      <div v-if="!items.length" class="pf-empty">Agrega productos para comenzar la operación.</div>
      <div v-else class="pf-grid">
        <article v-for="item in items" :key="item.productId" class="pf-card" style="box-shadow: none; padding: 16px">
          <div class="pf-card-header">
            <div>
              <h3 class="pf-card-title">{{ item.product.name }}</h3>
              <div class="pf-kpi-label">{{ formatDimensions(item.product.dimensions) }} · Minorista hasta 100 unidades</div>
            </div>
            <button class="pf-button pf-button-ghost" type="button" aria-label="Quitar producto" @click="removeItem(item.productId)">×</button>
          </div>
          <div class="pf-grid pf-grid-2">
            <div class="pf-field">
              <label :for="'quantity-' + item.productId">Cantidad</label>
              <input :id="'quantity-' + item.productId" v-model="item.quantity" class="pf-input" type="number" min="1" max="1000000" step="1" @input="handleQuantityInput(item)" />
            </div>
            <div class="pf-field">
              <label :for="'printing-' + item.productId">Serigrafía</label>
              <select :id="'printing-' + item.productId" v-model="item.screenPrinting.enabled" class="pf-select" :disabled="!operationRules.isSerigraphyAvailable(item.quantity)" @change="invalidateCalculation">
                <option :value="false">Sin serigrafía</option>
                <option :value="true">Aplicar serigrafía</option>
              </select>
              <span v-if="!operationRules.isSerigraphyAvailable(item.quantity)" class="pf-kpi-label">Disponible desde 20 unidades.</span>
            </div>
          </div>
          <div v-if="item.screenPrinting.enabled" class="pf-field" style="margin-top: 12px">
            <label :for="'colors-' + item.productId">Colores (1 a 10)</label>
            <input :id="'colors-' + item.productId" v-model="item.screenPrinting.colors" class="pf-input" type="number" min="1" max="10" step="1" @input="invalidateCalculation" />
          </div>
        </article>
      </div>

      <div class="pf-card" style="margin-top: 18px; box-shadow: none">
        <div class="pf-card-header"><h2 class="pf-card-title">Descuento opcional</h2><span class="pf-kpi-label">Antes del IGV</span></div>
        <div class="pf-grid pf-grid-2">
          <div class="pf-field">
            <label for="discount-type">Tipo</label>
            <select id="discount-type" v-model="discount.type" class="pf-select" @change="invalidateCalculation">
              <option value="">Sin descuento</option>
              <option value="PERCENTAGE">Porcentaje</option>
              <option value="FIXED">Monto fijo</option>
            </select>
          </div>
          <div v-if="discount.type" class="pf-field">
            <label for="discount-value">{{ discount.type === 'PERCENTAGE' ? 'Porcentaje (%)' : 'Monto (S/)' }}</label>
            <input id="discount-value" v-model="discount.value" class="pf-input" type="number" min="0" :max="discount.type === 'PERCENTAGE' ? 100 : undefined" step="0.01" @input="invalidateCalculation" />
          </div>
        </div>
      </div>

      <div v-if="isSale" class="pf-card" style="margin-top: 18px; box-shadow: none">
        <div class="pf-card-header"><h2 class="pf-card-title">Descripción de la venta</h2><span class="pf-kpi-label">Opcional</span></div>
        <div class="pf-field">
          <label for="sale-description">Información relevante</label>
          <textarea id="sale-description" v-model="saleDescription" class="pf-textarea" rows="4" maxlength="1000" placeholder="Datos del cliente, DNI, teléfono, dirección u otra referencia." @input="invalidateCalculation" />
        </div>
      </div>

      <button class="pf-button pf-button-primary" style="width: 100%; margin-top: 18px" type="button" :disabled="loading" @click="calculate">
        {{ loading ? 'Calculando…' : 'Calcular operación' }}
      </button>
    </section>

    <aside class="pf-card pf-summary">
      <div class="pf-card-header">
        <h2 class="pf-card-title">Resumen</h2>
        <span v-if="calculation" class="pf-badge pf-badge-success">Calculado</span>
        <span v-else class="pf-badge pf-badge-warning">Pendiente</span>
      </div>
      <div v-if="!calculation" class="pf-empty">El backend mostrará aquí los importes después de presionar Calcular.</div>
      <template v-else>
        <div v-for="item in calculation.items" :key="item.productId" class="pf-summary-row">
          <span>{{ item.quantity }} × {{ item.priceType === 'WHOLESALE' ? 'mayorista' : 'minorista' }}</span>
          <span class="pf-number">{{ formatMoney(item.lineAmount) }}</span>
        </div>
        <div v-if="calculation.discount" class="pf-summary-row">
          <span>Descuento {{ calculation.discount.type === 'PERCENTAGE' ? calculation.discount.value + '%' : 'fijo' }}</span>
          <span class="pf-number">- {{ formatMoney(calculation.discount.amount) }}</span>
        </div>
        <div class="pf-summary-row"><span>Subtotal</span><strong class="pf-number">{{ formatMoney(calculation.subtotal) }}</strong></div>
        <div class="pf-summary-row"><span>IGV ({{ Number(calculation.igvRate) * 100 }}%)</span><span class="pf-number">{{ formatMoney(calculation.igv) }}</span></div>
        <div class="pf-summary-row"><strong>Total</strong><strong class="pf-summary-total">{{ formatMoney(calculation.total) }}</strong></div>
        <button v-if="isSale" class="pf-button pf-button-primary" style="width: 100%; margin-top: 18px" type="button" @click="confirmSale = true">Confirmar venta</button>
      </template>
    </aside>
  </div>

  <ConfirmDialog
    :open="confirmSale"
    title="Confirmar venta"
    message="La venta se guardará y disminuirá el stock de todos los productos. ¿Deseas continuar?"
    confirm-text="Registrar venta"
    @cancel="confirmSale = false"
    @confirm="saveSale"
  />
</template>
