<script setup>
import { ref } from 'vue'
import { identityAccountApi } from '../../infrastructure/identityAccountApi'
import { getFriendlyError } from '../../../shared/application/useApiError'

const email = ref('')
const message = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function submit() {
  message.value = ''
  errorMessage.value = ''
  loading.value = true
  try {
    const response = await identityAccountApi.forgotPassword(email.value.trim())
    message.value = response.data.message
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="pf-login">
    <section class="pf-login-card">
      <RouterLink class="pf-link" to="/login">← Volver al inicio de sesión</RouterLink>
      <h1 class="pf-login-title">Recuperar acceso</h1>
      <p class="pf-page-description">Te enviaremos instrucciones si el correo está asociado a una cuenta.</p>
      <div v-if="message" class="pf-alert pf-alert-info" style="margin-top: 18px">{{ message }}</div>
      <div v-if="errorMessage" class="pf-alert" style="margin-top: 18px">{{ errorMessage }}</div>
      <form class="pf-form-grid" style="margin-top: 24px" @submit.prevent="submit">
        <div class="pf-field">
          <label for="forgot-email">Correo electrónico</label>
          <input id="forgot-email" v-model="email" class="pf-input" type="email" required />
        </div>
        <button class="pf-button pf-button-primary" type="submit" :disabled="loading">
          {{ loading ? 'Enviando…' : 'Solicitar recuperación' }}
        </button>
      </form>
    </section>
  </main>
</template>
