const STORAGE_KEY = 'packflow.visual-preferences'

export function readVisualPreferences() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function writeVisualPreferences(preferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // La preferencia visual no debe impedir el uso de la aplicación.
  }
}
