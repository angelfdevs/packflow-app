<script setup>
defineProps({
  message: { type: String, default: 'No se pudo cargar la información.' },
})

defineEmits(['retry'])
</script>

<template>
  <div class="pf-state">
    <p>{{ message }}</p>
    <button class="pf-button pf-button-secondary" type="button" @click="$emit('retry')">Reintentar</button>
  </div>
</template>
