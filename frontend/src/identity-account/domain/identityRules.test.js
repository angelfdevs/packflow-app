import { describe, expect, it } from 'vitest'
import { identityRules } from './identityRules'

describe('identityRules', () => {
  it('validates email addresses', () => {
    expect(identityRules.isValidEmail('admin@packflow.local')).toBe(true)
    expect(identityRules.isValidEmail('correo-invalido')).toBe(false)
  })

  it('requires passwords between 12 and 128 characters', () => {
    expect(identityRules.isValidPassword('PackFlowDemo123!')).toBe(true)
    expect(identityRules.isValidPassword('corta')).toBe(false)
  })
})
