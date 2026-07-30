export const productRules = {
  maxDimension: 1000,
  maxInitialStock: 1_000_000,
  isValidDimensions(dimensions) {
    return ['lengthCm', 'widthCm', 'heightCm'].every((key) => {
      const value = Number(dimensions[key])
      return value > 0 && value <= this.maxDimension
    })
  },
  isValidPrice(value) {
    return Number(value) >= 0
  },
  isValidInitialStock(value) {
    return Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= this.maxInitialStock
  },
}
