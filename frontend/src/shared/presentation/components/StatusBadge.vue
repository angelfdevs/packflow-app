<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const labels = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  CONFIRMED: 'Confirmada',
  LOW: 'Stock bajo',
  OUT: 'Agotado',
  AVAILABLE: 'Disponible',
}

const tone = computed(() => {
  if (['INACTIVE', 'OUT'].includes(props.status)) return 'danger'
  if (props.status === 'LOW') return 'warning'
  return 'success'
})
</script>

<template>
  <span class="pf-badge" :class="'pf-badge-' + tone">{{ labels[status] || status }}</span>
</template>
