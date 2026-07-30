import { apiClient } from '../../shared/infrastructure/http/httpClient'
import { createIdempotencyKey } from '../../shared/infrastructure/http/idempotency'

export const settingsApi = {
  get() {
    return apiClient.get('/settings')
  },
  update(patch, etag) {
    const headers = { 'Idempotency-Key': createIdempotencyKey() }
    if (etag) headers['If-Match'] = etag
    return apiClient.patch('/settings', patch, { headers })
  },
}
