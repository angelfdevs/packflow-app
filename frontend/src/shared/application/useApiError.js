export function getFriendlyError(error) {
  if (!error) return 'Ocurrió un error inesperado.'
  if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (error.status === 403) return 'No tienes permiso para realizar esta acción.'
  if (error.status === 404) return 'No se encontró el recurso solicitado.'
  if (error.status === 409) return 'El recurso cambió o ya existe un registro equivalente.'
  if (error.status === 422) return error.detail || 'Revisa los datos ingresados.'
  if (error.status === 429) return 'Se alcanzó el límite temporal. Inténtalo más tarde.'
  return error.detail || error.message || 'No se pudo completar la operación.'
}
