import { apiClient } from '../../shared/infrastructure/http/httpClient'
import { createIdempotencyKey } from '../../shared/infrastructure/http/idempotency'

export const inventoryApi = {
  listStock(params = {}) {
    return apiClient.get('/inventory/stock', { params })
  },
  receive(payload) {
    return apiClient.post('/inventory/receipts', payload, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    })
  },
  adjust(payload) {
    return apiClient.post('/inventory/adjustments', payload, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    })
  },
  listMovements(params = {}) {
    return apiClient.get('/inventory/movements', { params })
  },
}
