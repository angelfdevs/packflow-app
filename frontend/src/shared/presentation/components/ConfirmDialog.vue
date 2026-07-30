<script setup>
defineProps({
  open: Boolean,
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, default: '¿Deseas continuar?' },
  confirmText: { type: String, default: 'Confirmar' },
  danger: Boolean,
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="open" class="pf-modal-backdrop" role="presentation">
    <section class="pf-modal" role="dialog" aria-modal="true" :aria-label="title">
      <div class="pf-card-header">
        <h2 class="pf-card-title">{{ title }}</h2>
        <button class="pf-button pf-button-ghost" type="button" aria-label="Cerrar" @click="$emit('cancel')">×</button>
      </div>
      <p class="pf-page-description">{{ message }}</p>
      <div class="pf-inline" style="justify-content: flex-end; margin-top: 22px">
        <button class="pf-button pf-button-secondary" type="button" @click="$emit('cancel')">Cancelar</button>
        <button
          class="pf-button"
          :class="danger ? 'pf-button-danger' : 'pf-button-primary'"
          type="button"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </section>
  </div>
</template>
