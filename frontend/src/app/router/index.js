import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../../identity-account/application/stores/authStore'

const routes = [
  {
    path: '/login',
    component: () => import('../../identity-account/presentation/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/forgot-password',
    component: () => import('../../identity-account/presentation/views/ForgotPasswordView.vue'),
    meta: { public: true },
  },
  {
    path: '/reset-password',
    component: () => import('../../identity-account/presentation/views/ResetPasswordView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('../layouts/AppShell.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        component: () => import('../../dashboard/presentation/views/DashboardView.vue'),
      },
      {
        path: 'products',
        component: () => import('../../catalog/presentation/views/ProductsView.vue'),
      },
      {
        path: 'inventory',
        component: () => import('../../inventory/presentation/views/InventoryView.vue'),
      },
      {
        path: 'quotes',
        component: () => import('../../commercial-operations/presentation/views/QuoteView.vue'),
      },
      {
        path: 'sales',
        component: () => import('../../commercial-operations/presentation/views/SalesView.vue'),
      },
      {
        path: 'sales/history',
        component: () => import('../../commercial-operations/presentation/views/SalesView.vue'),
      },
      {
        path: 'sales/:saleId',
        component: () => import('../../commercial-operations/presentation/views/SaleDetailView.vue'),
      },
      {
        path: 'settings',
        component: () => import('../../identity-account/presentation/views/SettingsView.vue'),
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.public) {
    if (auth.isAuthenticated && to.path === '/login') return '/dashboard'
    return true
  }

  if (auth.status === 'unknown') {
    const authenticated = await auth.initialize()
    if (!authenticated) return '/login'
  }

  return auth.isAuthenticated ? true : '/login'
})

export default router
