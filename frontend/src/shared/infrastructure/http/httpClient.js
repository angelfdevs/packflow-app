import axios from 'axios'
import { env } from '../config/env'
import { sessionMemory } from '../../../identity-account/infrastructure/session/sessionMemory'
import { refreshSessionOnce } from '../../../identity-account/infrastructure/session/sessionCoordinator'
import { normalizeApiError } from './apiError'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 12_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (sessionMemory.accessToken) {
    config.headers.Authorization = 'Bearer ' + sessionMemory.accessToken
  }

  if (sessionMemory.csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRF-TOKEN'] = sessionMemory.csrfToken
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {}
    const route = String(config.url || '')
    const isAuthRoute = route.includes('/auth/login') || route.includes('/auth/csrf') || route.includes('/auth/refresh') || route.includes('/auth/logout')

    if (error.response?.status === 401 && !config._sessionRetry && !isAuthRoute) {
      config._sessionRetry = true
      try {
        await refreshSessionOnce()
        return apiClient.request(config)
      } catch {
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('packflow:session-expired'))
      }
    }

    return Promise.reject(normalizeApiError(error))
  },
)
