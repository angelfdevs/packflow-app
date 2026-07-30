import { apiClient } from '../../shared/infrastructure/http/httpClient'
import { createIdempotencyKey } from '../../shared/infrastructure/http/idempotency'

export const identityAccountApi = {
  csrf() {
    return apiClient.get('/auth/csrf')
  },
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },
  refresh() {
    return apiClient.post('/auth/refresh')
  },
  me() {
    return apiClient.get('/auth/me')
  },
  logout() {
    return apiClient.post('/auth/logout')
  },
  changePassword(payload) {
    return apiClient.post('/auth/password/change', payload)
  },
  forgotPassword(email) {
    return apiClient.post('/auth/password/forgot', { email })
  },
  resetPassword(payload) {
    return apiClient.post('/auth/password/reset', payload)
  },
  getAccount() {
    return apiClient.get('/account')
  },
  updateAccount(payload, etag) {
    return apiClient.patch('/account', payload, {
      headers: { 'Idempotency-Key': createIdempotencyKey(), 'If-Match': etag },
    })
  },
}
