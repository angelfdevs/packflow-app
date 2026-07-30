export const identityRules = {
  isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
  },
  isValidPassword(value) {
    return typeof value === 'string' && value.length >= 12 && value.length <= 128
  },
}
