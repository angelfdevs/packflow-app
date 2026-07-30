import { createApp } from 'vue'
import { createPinia } from 'pinia'
import CIcon from '@coreui/icons-vue'
import {
  cilAccountLogout,
  cilCalculator,
  cilCart,
  cilCheck,
  cilChevronLeft,
  cilChevronRight,
  cilFilterX,
  cilHistory,
  cilInbox,
  cilListRich,
  cilLockLocked,
  cilMenu,
  cilMoon,
  cilPencil,
  cilPlus,
  cilReload,
  cilSave,
  cilSearch,
  cilSettings,
  cilSpeedometer,
  cilStorage,
  cilSun,
  cilTransfer,
} from '@coreui/icons'
import '@coreui/coreui/dist/css/coreui.min.css'
import '@coreui/icons/css/free.min.css'
import './shared/presentation/styles/tokens.css'
import './shared/presentation/styles/global.css'
import App from './app/App.vue'
import router from './app/router'
import { useAuthStore } from './identity-account/application/stores/authStore'
import { registerSessionRefresh } from './identity-account/infrastructure/session/sessionCoordinator'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
registerSessionRefresh(() => useAuthStore(pinia).refresh())
app.provide('icons', {
  cilAccountLogout,
  cilCalculator,
  cilCart,
  cilCheck,
  cilChevronLeft,
  cilChevronRight,
  cilFilterX,
  cilHistory,
  cilInbox,
  cilListRich,
  cilLockLocked,
  cilMenu,
  cilMoon,
  cilPencil,
  cilPlus,
  cilReload,
  cilSave,
  cilSearch,
  cilSettings,
  cilSpeedometer,
  cilStorage,
  cilSun,
  cilTransfer,
})
app.component('CIcon', CIcon)
app.mount('#app')
