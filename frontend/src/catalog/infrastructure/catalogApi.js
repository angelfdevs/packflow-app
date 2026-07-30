import { apiClient } from '../../shared/infrastructure/http/httpClient'
import { createIdempotencyKey } from '../../shared/infrastructure/http/idempotency'

export const catalogApi = {
  listProducts(params = {}) {
    return apiClient.get('/products', { params })
  },
  getProduct(productId) {
    return apiClient.get('/products/' + productId)
  },
  createProduct(payload) {
    return apiClient.post('/products', payload, { headers: { 'Idempotency-Key': createIdempotencyKey() } })
  },
  updateProduct(productId, payload, etag) {
    return apiClient.put('/products/' + productId, payload, {
      headers: { 'Idempotency-Key': createIdempotencyKey(), 'If-Match': etag },
    })
  },
  updateStatus(productId, active, etag) {
    return apiClient.patch('/products/' + productId + '/status', { active }, {
      headers: { 'Idempotency-Key': createIdempotencyKey(), 'If-Match': etag },
    })
  },
  listCategories(params = {}) {
    return apiClient.get('/categories', { params })
  },
  createCategory(name) {
    return apiClient.post('/categories', { name }, { headers: { 'Idempotency-Key': createIdempotencyKey() } })
  },
  listMaterials(params = {}) {
    return apiClient.get('/materials', { params })
  },
  createMaterial(name) {
    return apiClient.post('/materials', { name }, { headers: { 'Idempotency-Key': createIdempotencyKey() } })
  },
}
