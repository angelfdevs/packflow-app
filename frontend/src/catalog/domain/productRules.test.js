import { describe, expect, it } from 'vitest'
import { productRules } from './productRules'

describe('productRules', () => {
  it('accepts dimensions within the documented limits', () => {
    expect(productRules.isValidDimensions({ lengthCm: 20, widthCm: 30, heightCm: 10 })).toBe(true)
    expect(productRules.isValidDimensions({ lengthCm: 1000, widthCm: 1000, heightCm: 1000 })).toBe(true)
  })

  it('rejects invalid dimensions', () => {
    expect(productRules.isValidDimensions({ lengthCm: 0, widthCm: 30, heightCm: 10 })).toBe(false)
    expect(productRules.isValidDimensions({ lengthCm: 1000.01, widthCm: 30, heightCm: 10 })).toBe(false)
  })

  it('validates initial stock as a non-negative integer within the limit', () => {
    expect(productRules.isValidInitialStock(0)).toBe(true)
    expect(productRules.isValidInitialStock(1_000_000)).toBe(true)
    expect(productRules.isValidInitialStock(-1)).toBe(false)
    expect(productRules.isValidInitialStock(1.5)).toBe(false)
    expect(productRules.isValidInitialStock(1_000_001)).toBe(false)
  })
})
