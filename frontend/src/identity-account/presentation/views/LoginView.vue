<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../application/stores/authStore'
import { identityRules } from '../../domain/identityRules'
import { getFriendlyError } from '../../../shared/application/useApiError'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function submit() {
  errorMessage.value = ''
  if (!identityRules.isValidEmail(email.value) || !identityRules.isValidPassword(password.value)) {
    errorMessage.value = 'Ingresa un correo válido y una contraseña de al menos 12 caracteres.'
    return
  }
  loading.value = true
  try {
    await auth.login({ email: email.value.trim(), password: password.value })
    router.push('/dashboard')
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
      <div class="pf-brand" style="margin: 0">
        <span class="pf-brand-mark">PF</span>
        <span>PackFlow</span>
      </div>
      <h1 class="pf-login-title">Tu operación, en orden.</h1>
      <p class="pf-page-description">Ingresa a la cuenta administradora de tu negocio.</p>

      <div v-if="auth.sessionExpired" class="pf-alert pf-alert-info" style="margin-top: 18px">
        Tu sesión expiró por inactividad. Vuelve a iniciar sesión para continuar.
      </div>
      <div v-if="errorMessage" class="pf-alert" style="margin-top: 18px" role="alert">{{ errorMessage }}</div>

      <form class="pf-form-grid" style="margin-top: 24px" @submit.prevent="submit">
        <div class="pf-field">
          <label for="login-email">Correo electrónico</label>
          <input id="login-email" v-model="email" class="pf-input" type="email" autocomplete="username" required />
        </div>
        <div class="pf-field">
          <label for="login-password">Contraseña</label>
          <input id="login-password" v-model="password" class="pf-input" type="password" autocomplete="current-password" required />
        </div>
        <button class="pf-button pf-button-primary" type="submit" :disabled="loading">
          {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
        </button>
      </form>

      <RouterLink class="pf-link" style="display: inline-block; margin-top: 20px" to="/forgot-password">
        ¿Olvidaste tu contraseña?
      </RouterLink>
    </section>
  </main>
</template>
