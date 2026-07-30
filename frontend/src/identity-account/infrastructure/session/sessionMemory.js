let accessToken = null
let csrfToken = null
let inactivityTimer = null

const SESSION_INACTIVITY_MS = 15 * 60 * 1000

export const sessionMemory = {
  get accessToken() {
    return accessToken
  },
  set accessToken(value) {
    accessToken = value
  },
  get csrfToken() {
    return csrfToken
  },
  set csrfToken(value) {
    csrfToken = value
  },
  clear() {
    accessToken = null
    csrfToken = null
    this.stopInactivityGuard()
  },
  startInactivityGuard(onExpired) {
    this.stopInactivityGuard()
    const schedule = () => {
      inactivityTimer = window.setTimeout(() => {
        this.stopInactivityGuard()
        onExpired()
      }, SESSION_INACTIVITY_MS)
    }
    this.touchActivity = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer)
      schedule()
    }
    schedule()
  },
  touchActivity() {
    if (!inactivityTimer) return
    window.clearTimeout(inactivityTimer)
    inactivityTimer = window.setTimeout(() => {
      this.stopInactivityGuard()
    }, SESSION_INACTIVITY_MS)
  },
  stopInactivityGuard() {
    if (inactivityTimer) window.clearTimeout(inactivityTimer)
    inactivityTimer = null
    this.touchActivity = () => {}
  },
}

export { SESSION_INACTIVITY_MS }
