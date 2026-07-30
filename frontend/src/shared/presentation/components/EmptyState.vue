<script setup>
defineProps({
  message: { type: String, default: 'No hay información para mostrar.' },
})
</script>

<template>
  <div class="pf-empty">{{ message }}</div>
</template>
