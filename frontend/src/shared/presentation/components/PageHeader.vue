<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <header class="pf-page-header">
    <div>
      <div v-if="eyebrow" class="pf-eyebrow">{{ eyebrow }}</div>
      <h1 class="pf-page-title">{{ title }}</h1>
      <p v-if="description" class="pf-page-description">{{ description }}</p>
    </div>
    <div class="pf-inline">
      <slot name="actions" />
    </div>
  </header>
</template>
