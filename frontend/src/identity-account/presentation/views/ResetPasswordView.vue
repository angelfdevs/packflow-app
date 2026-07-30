<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { identityAccountApi } from '../../infrastructure/identityAccountApi'
import { identityRules } from '../../domain/identityRules'
import { getFriendlyError } from '../../../shared/application/useApiError'

const router = useRouter()
const token = ref(new URLSearchParams(window.location.search).get('token') || '')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function submit() {
  message.value = ''
  errorMessage.value = ''
  if (!identityRules.isValidPassword(newPassword.value) || newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'La contraseña debe tener entre 12 y 128 caracteres y coincidir con su confirmación.'
    return
  }
  loading.value = true
  try {
    await identityAccountApi.resetPassword({
      token: token.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    })
    message.value = 'Contraseña actualizada. Ya puedes iniciar sesión.'
    window.setTimeout(() => router.push('/login'), 900)
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
      <h1 class="pf-login-title">Nueva contraseña</h1>
      <p class="pf-page-description">Usa una contraseña de al menos 12 caracteres.</p>
      <div v-if="message" class="pf-alert pf-alert-info" style="margin-top: 18px">{{ message }}</div>
      <div v-if="errorMessage" class="pf-alert" style="margin-top: 18px">{{ errorMessage }}</div>
      <form class="pf-form-grid" style="margin-top: 24px" @submit.prevent="submit">
        <div class="pf-field">
          <label for="reset-token">Token de recuperación</label>
          <input id="reset-token" v-model="token" class="pf-input" type="text" required />
        </div>
        <div class="pf-field">
          <label for="reset-password">Nueva contraseña</label>
          <input id="reset-password" v-model="newPassword" class="pf-input" type="password" minlength="12" required />
        </div>
        <div class="pf-field">
          <label for="reset-confirm">Confirmar contraseña</label>
          <input id="reset-confirm" v-model="confirmPassword" class="pf-input" type="password" minlength="12" required />
        </div>
        <button class="pf-button pf-button-primary" type="submit" :disabled="loading">
          {{ loading ? 'Guardando…' : 'Actualizar contraseña' }}
        </button>
      </form>
    </section>
  </main>
</template>
