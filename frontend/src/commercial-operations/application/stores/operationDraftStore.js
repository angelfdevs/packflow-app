import { defineStore } from 'pinia'

export const useOperationDraftStore = defineStore('operationDraft', {
  state: () => ({
    quote: null,
    sale: null,
  }),
  actions: {
    save(mode, draft) {
      this[mode] = {
        items: draft.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          screenPrinting: { ...item.screenPrinting },
        })),
        discount: { ...draft.discount },
        description: draft.description || '',
      }
    },
    restore(mode) {
      const draft = this[mode]
      if (!draft) return null
      return {
        items: draft.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          screenPrinting: { ...item.screenPrinting },
        })),
        discount: { ...draft.discount },
        description: draft.description || '',
      }
    },
    clear(mode) {
      this[mode] = null
    },
    clearAll() {
      this.quote = null
      this.sale = null
    },
  },
})
