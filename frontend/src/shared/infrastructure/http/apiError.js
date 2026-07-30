export class ApiError extends Error {
  constructor({ status, errorCode, detail, title, traceId, retryAfter }) {
    super(detail || title || 'No se pudo completar la solicitud.')
    this.name = 'ApiError'
    this.status = status
    this.errorCode = errorCode
    this.detail = detail
    this.title = title
    this.traceId = traceId
    this.retryAfter = retryAfter
  }
}

export function normalizeApiError(error) {
  if (error?.name === 'ApiError') return error
  if (!error?.response) {
    return new ApiError({
      status: 0,
      title: 'Error de conexión',
      detail: 'No se pudo conectar con PackFlow. Verifica el servicio e inténtalo nuevamente.',
    })
  }

  const data = error.response.data || {}
  return new ApiError({
    status: error.response.status,
    errorCode: data.errorCode,
    detail: data.detail,
    title: data.title,
    traceId: data.traceId,
    retryAfter: error.response.headers?.['retry-after'],
  })
}
