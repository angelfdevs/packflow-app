<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../identity-account/application/stores/authStore'
import { useSettingsStore } from '../../shared/application/stores/settingsStore'
import { useToastStore } from '../../shared/application/stores/toastStore'
import { useOperationDraftStore } from '../../commercial-operations/application/stores/operationDraftStore'

const router = useRouter()
const auth = useAuthStore()
const settings = useSettingsStore()
const toast = useToastStore()
const operationDraft = useOperationDraftStore()
const sidebarOpen = ref(false)

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: 'cil-speedometer' },
  { to: '/products', label: 'Productos', icon: 'cil-inbox' },
  { to: '/inventory', label: 'Inventario', icon: 'cil-storage' },
  { to: '/quotes', label: 'Cotizador', icon: 'cil-calculator' },
  { to: '/sales', label: 'Ventas', icon: 'cil-cart' },
]

const initials = computed(() => auth.account?.businessName?.slice(0, 1).toUpperCase() || 'P')

onMounted(async () => {
  const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'focus']
  activityEvents.forEach((eventName) => window.addEventListener(eventName, auth.touchActivity, { passive: true }))
  window.addEventListener('packflow:session-expired', handleSessionExpired)
  if (auth.isAuthenticated) auth.startInactivityGuard()
  settings.applyVisualPreferences()
  try {
    await settings.load()
  } catch {
    toast.add('No se pudo cargar la configuración visual del negocio.', 'error')
  }
})

onBeforeUnmount(() => {
  const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'focus']
  activityEvents.forEach((eventName) => window.removeEventListener(eventName, auth.touchActivity))
  window.removeEventListener('packflow:session-expired', handleSessionExpired)
})

function handleSessionExpired() {
  if (!auth.isAuthenticated) return
  auth.markExpired()
  toast.add('Tu sesión expiró. Vuelve a iniciar sesión para continuar.', 'error')
  router.push('/login')
}

async function logout() {
  await auth.logout()
  operationDraft.clearAll()
  router.push('/login')
}

async function toggleTheme() {
  try {
    await settings.setTheme(settings.theme === 'DARK' ? 'LIGHT' : 'DARK')
  } catch {
    toast.add('No se pudo guardar el tema seleccionado.', 'error')
  }
}

</script>

<template>
  <div class="pf-shell">
    <aside class="pf-sidebar" :class="{ 'is-open': sidebarOpen }">
      <RouterLink class="pf-brand" to="/dashboard" @click="sidebarOpen = false">
        <span class="pf-brand-mark">PF</span>
        <span>PackFlow</span>
      </RouterLink>

      <nav class="pf-nav" aria-label="Navegación principal">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          class="pf-nav-link"
          :to="item.to"
          @click="sidebarOpen = false"
        >
          <CIcon :icon="item.icon" width="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="pf-sidebar-footer">
        <RouterLink class="pf-nav-link" to="/settings" @click="sidebarOpen = false">
          <CIcon icon="cil-settings" width="18" />
          <span>Configuración</span>
        </RouterLink>
        <button class="pf-nav-link pf-button-ghost" type="button" @click="logout">
          <CIcon icon="cil-account-logout" width="18" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <main class="pf-main">
      <header class="pf-topbar">
        <div class="pf-inline">
          <button class="pf-button pf-button-ghost d-lg-none" type="button" aria-label="Abrir menú" @click="sidebarOpen = !sidebarOpen">
            <CIcon icon="cil-menu" width="20" />
          </button>
          <div>
            <strong>{{ auth.account?.businessName || 'PackFlow' }}</strong>
          </div>
        </div>
        <div class="pf-topbar-actions">
          <button class="pf-button pf-button-ghost" type="button" :aria-label="settings.theme === 'DARK' ? 'Usar tema claro' : 'Usar tema oscuro'" @click="toggleTheme">
            <CIcon :icon="settings.theme === 'DARK' ? 'cil-sun' : 'cil-moon'" width="18" />
          </button>
          <span class="pf-brand-mark" aria-label="Cuenta administradora">{{ initials }}</span>
        </div>
      </header>

      <div class="pf-main-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>
