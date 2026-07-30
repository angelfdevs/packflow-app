import { describe, expect, it } from 'vitest'
import { operationRules } from './operationRules'

describe('operationRules', () => {
  it('enforces operation and line limits', () => {
    expect(operationRules.maxItems).toBe(20)
    expect(operationRules.isValidQuantity(1_000_000)).toBe(true)
    expect(operationRules.isValidQuantity(1_000_001)).toBe(false)
  })

  it('enforces serigraphy color limits', () => {
    expect(operationRules.isValidColors(1)).toBe(true)
    expect(operationRules.isValidColors(10)).toBe(true)
    expect(operationRules.isValidColors(11)).toBe(false)
  })

  it('enforces the minimum quantity for serigraphy', () => {
    expect(operationRules.isSerigraphyAvailable(19)).toBe(false)
    expect(operationRules.isSerigraphyAvailable(20)).toBe(true)
  })
})
