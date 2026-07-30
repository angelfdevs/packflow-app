let refreshHandler = null

export function registerSessionRefresh(handler) {
  refreshHandler = handler
}

export async function refreshSessionOnce() {
  if (!refreshHandler) throw new Error('Session refresh is not configured.')
  return refreshHandler()
}
