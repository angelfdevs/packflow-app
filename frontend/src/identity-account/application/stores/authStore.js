import { defineStore } from 'pinia'
import { sessionMemory } from '../../infrastructure/session/sessionMemory'
import { identityAccountApi } from '../../infrastructure/identityAccountApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    account: null,
    status: 'unknown',
    sessionExpired: false,
    formDraft: null,
  }),
  getters: {
    isAuthenticated: (state) => state.status === 'authenticated',
  },
  actions: {
    async initialize() {
      if (this.status === 'authenticated') return true
      try {
        await this.refresh()
        const { data } = await identityAccountApi.me()
        this.account = data
        this.status = 'authenticated'
        this.sessionExpired = false
        this.startInactivityGuard()
        return true
      } catch {
        this.status = 'anonymous'
        sessionMemory.clear()
        return false
      }
    },
    async login(credentials) {
      const { data } = await identityAccountApi.login(credentials)
      sessionMemory.accessToken = data.accessToken
      sessionMemory.csrfToken = data.csrfToken
      this.account = data.account
      this.status = 'authenticated'
      this.sessionExpired = false
      this.startInactivityGuard()
      return data
    },
    async refresh() {
      await this.ensureCsrf()
      const { data } = await identityAccountApi.refresh()
      sessionMemory.accessToken = data.accessToken
      sessionMemory.csrfToken = data.csrfToken
      return data
    },
    async ensureCsrf() {
      const { data } = await identityAccountApi.csrf()
      sessionMemory.csrfToken = data.csrfToken
      return data.csrfToken
    },
    startInactivityGuard() {
      sessionMemory.startInactivityGuard(() => this.markExpired())
    },
    touchActivity() {
      sessionMemory.touchActivity()
    },
    stopInactivityGuard() {
      sessionMemory.stopInactivityGuard()
    },
    async logout() {
      try {
        await this.ensureCsrf()
        await identityAccountApi.logout()
      } finally {
        sessionMemory.clear()
        this.account = null
        this.status = 'anonymous'
        this.sessionExpired = false
        this.formDraft = null
      }
    },
    markExpired(draft = null) {
      this.formDraft = draft
      this.sessionExpired = true
      this.status = 'anonymous'
      sessionMemory.clear()
    },
    consumeDraft() {
      const draft = this.formDraft
      this.formDraft = null
      return draft
    },
  },
})
