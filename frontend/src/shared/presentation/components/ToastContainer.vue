<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '../../application/stores/toastStore'

const store = useToastStore()
const { items } = storeToRefs(store)
</script>

<template>
  <div class="pf-toast-container" aria-live="polite">
    <div v-for="item in items" :key="item.id" class="pf-toast" :class="'pf-toast-' + item.type">
      {{ item.message }}
    </div>
  </div>
</template>
