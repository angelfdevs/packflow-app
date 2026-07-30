import { defineStore } from 'pinia'
import { readVisualPreferences, writeVisualPreferences } from '../../infrastructure/storage/preferencesStorage'
import { settingsApi } from '../../../identity-account/infrastructure/settingsApi'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: readVisualPreferences().theme || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'DARK' : 'LIGHT'),
    fontSize: readVisualPreferences().fontSize || 'MEDIUM',
    igvRate: 0.18,
    minimumScreenPrintingQuantity: 20,
    screenPrintingTiers: [],
    version: null,
    loading: false,
  }),
  actions: {
    applyVisualPreferences() {
      document.documentElement.dataset.theme = this.theme.toLowerCase()
      document.documentElement.dataset.fontSize = this.fontSize.toLowerCase()
      writeVisualPreferences({ theme: this.theme, fontSize: this.fontSize })
    },
    async load() {
      this.loading = true
      try {
        const { data } = await settingsApi.get()
        Object.assign(this, data)
        this.applyVisualPreferences()
      } finally {
        this.loading = false
      }
    },
    async update(patch) {
      const etag = this.version ? '"v' + this.version + '"' : undefined
      const { data } = await settingsApi.update(patch, etag)
      Object.assign(this, data)
      this.applyVisualPreferences()
      return data
    },
    async setTheme(theme) {
      return this.update({ theme })
    },
    async setFontSize(fontSize) {
      return this.update({ fontSize })
    },
  },
})
