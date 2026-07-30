import { apiClient } from '../../shared/infrastructure/http/httpClient'
import { createIdempotencyKey } from '../../shared/infrastructure/http/idempotency'

export const commercialApi = {
  preview(payload) {
    return apiClient.post('/quotes/preview', payload)
  },
  createSale(payload) {
    return apiClient.post('/sales', payload, { headers: { 'Idempotency-Key': createIdempotencyKey() } })
  },
  listSales(params = {}) {
    return apiClient.get('/sales', { params })
  },
  getSale(saleId) {
    return apiClient.get('/sales/' + saleId)
  },
}
