import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [],
  }),
  actions: {
    add(message, type = 'info') {
      const id = crypto.randomUUID()
      this.items.push({ id, message, type })
      window.setTimeout(() => this.remove(id), 4500)
    },
    remove(id) {
      this.items = this.items.filter((item) => item.id !== id)
    },
  },
})
