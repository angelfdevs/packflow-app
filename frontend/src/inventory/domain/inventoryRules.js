export const inventoryRules = {
  lowStockThreshold: 15,
  isLowStock(stock) {
    return Number(stock) <= this.lowStockThreshold
  },
  isValidQuantity(quantity) {
    return Number.isInteger(Number(quantity)) && Number(quantity) > 0 && Number(quantity) <= 1_000_000
  },
}
