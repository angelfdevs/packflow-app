import { describe, expect, it } from 'vitest'
import { inventoryRules } from './inventoryRules'

describe('inventoryRules', () => {
  it('classifies 15 units or fewer as low stock', () => {
    expect(inventoryRules.isLowStock(14)).toBe(true)
    expect(inventoryRules.isLowStock(15)).toBe(true)
    expect(inventoryRules.isLowStock(16)).toBe(false)
  })

  it('accepts only positive integer quantities within the limit', () => {
    expect(inventoryRules.isValidQuantity(1)).toBe(true)
    expect(inventoryRules.isValidQuantity(1_000_000)).toBe(true)
    expect(inventoryRules.isValidQuantity(0)).toBe(false)
    expect(inventoryRules.isValidQuantity(1.5)).toBe(false)
  })
})
