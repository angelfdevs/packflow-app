import { describe, expect, it } from 'vitest'
import { formatDate, formatMoney } from './formatters'

describe('formatters', () => {
  it('formats Peruvian currency', () => {
    expect(formatMoney('45.00')).toContain('45.00')
    expect(formatMoney('45.00')).toContain('S/')
  })

  it('formats dates using the Lima timezone', () => {
    expect(formatDate('2026-07-25T15:00:00Z')).toMatch(/25.*2026/)
  })
})
