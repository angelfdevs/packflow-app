export const operationRules = {
  maxItems: 20,
  maxQuantity: 1_000_000,
  maxColors: 10,
  minSerigraphyQuantity: 20,
  isValidQuantity(quantity) {
    return Number.isInteger(Number(quantity)) && Number(quantity) > 0 && Number(quantity) <= this.maxQuantity
  },
  isValidColors(colors) {
    return Number.isInteger(Number(colors)) && Number(colors) >= 1 && Number(colors) <= this.maxColors
  },
  isSerigraphyAvailable(quantity) {
    return Number(quantity) >= this.minSerigraphyQuantity
  },
}
