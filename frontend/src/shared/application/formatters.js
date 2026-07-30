const limaFormatter = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Lima',
})

const moneyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
})

export function formatMoney(value) {
  const number = Number(value || 0)
  return moneyFormatter.format(Number.isFinite(number) ? number : 0)
}

export function formatDate(value) {
  if (!value) return '—'
  return limaFormatter.format(new Date(value))
}

export function formatDimensions(dimensions) {
  if (!dimensions) return '—'
  return dimensions.lengthCm + ' × ' + dimensions.widthCm + ' × ' + dimensions.heightCm + ' cm'
}

export function formatNumber(value) {
  return new Intl.NumberFormat('es-PE').format(Number(value || 0))
}

const movementLabels = {
  INITIAL_RECEIPT: 'Ingreso inicial',
  RECEIPT: 'Ingreso de mercadería',
  SALE_OUT: 'Venta',
  LOSS: 'Pérdida',
  DAMAGE: 'Daño',
  CORRECTION: 'Corrección',
}

export function formatMovementType(value) {
  return movementLabels[value] || value || 'Movimiento'
}
