<script setup>
import { onMounted, ref } from 'vue'
import PageHeader from '../../../shared/presentation/components/PageHeader.vue'
import LoadingState from '../../../shared/presentation/components/LoadingState.vue'
import EmptyState from '../../../shared/presentation/components/EmptyState.vue'
import ErrorState from '../../../shared/presentation/components/ErrorState.vue'
import StatusBadge from '../../../shared/presentation/components/StatusBadge.vue'
import { dashboardService } from '../../application/dashboardService'
import { formatDate, formatDimensions, formatMoney, formatMovementType, formatNumber } from '../../../shared/application/formatters'
import { getFriendlyError } from '../../../shared/application/useApiError'

const summary = ref(null)
const loading = ref(true)
const errorMessage = ref('')

async function loadSummary() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await dashboardService.getSummary()
    summary.value = response.data
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadSummary)
</script>

<template>
  <PageHeader eyebrow="Resumen operativo" title="Dashboard" description="Una lectura rápida de lo que necesita atención en tu negocio.">
    <template #actions><button class="pf-button pf-button-primary" type="button" @click="loadSummary"><CIcon icon="cil-reload" width="17" /> Actualizar</button></template>
  </PageHeader>

  <LoadingState v-if="loading" />
  <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadSummary" />
  <template v-else-if="summary">
    <section class="pf-grid pf-grid-3">
      <article class="pf-card pf-kpi"><div class="pf-kpi-label">Productos activos</div><div class="pf-kpi-value">{{ formatNumber(summary.activeProducts) }}</div></article>
      <article class="pf-card pf-kpi"><div class="pf-kpi-label">Stock bajo</div><div class="pf-kpi-value">{{ formatNumber(summary.lowStockProducts) }}</div><div class="pf-kpi-label">Umbral: {{ summary.lowStockThreshold }} unidades</div></article>
      <article class="pf-card pf-kpi"><div class="pf-kpi-label">Ventas recientes</div><div class="pf-kpi-value">{{ formatNumber(summary.recentSales.length) }}</div></article>
    </section>

    <section class="pf-grid pf-grid-2" style="margin-top: 18px">
      <article class="pf-card">
        <div class="pf-card-header"><h2 class="pf-card-title">Atención requerida</h2><RouterLink class="pf-link" to="/inventory">Ver inventario</RouterLink></div>
        <EmptyState v-if="!summary.lowStockItems.length" message="No hay productos con stock bajo." />
        <div v-else class="pf-table-wrap">
          <table class="pf-table">
            <thead><tr><th>Producto</th><th>Stock</th><th>Estado</th></tr></thead>
            <tbody><tr v-for="item in summary.lowStockItems" :key="item.productId"><td>{{ item.name }}</td><td class="pf-number">{{ item.currentStock }}</td><td><StatusBadge :status="item.currentStock === 0 ? 'OUT' : 'LOW'" /></td></tr></tbody>
          </table>
        </div>
      </article>
      <article class="pf-card">
        <div class="pf-card-header"><h2 class="pf-card-title">Actividad reciente</h2><RouterLink class="pf-link" to="/inventory">Ver movimientos</RouterLink></div>
        <EmptyState v-if="!summary.recentMovements.length" message="No hay movimientos recientes." />
        <div v-else class="pf-grid">
          <div v-for="movement in summary.recentMovements" :key="movement.movementId" class="pf-summary-row">
            <span>
              <strong>{{ formatMovementType(movement.movementType) }}</strong>
              <br />
              <span class="pf-kpi-label">{{ movement.productName || 'Producto' }}<template v-if="movement.dimensions"> · {{ formatDimensions(movement.dimensions) }}</template></span>
              <br />
              <span class="pf-kpi-label">{{ formatDate(movement.createdAt) }}</span>
            </span>
            <span class="pf-number">{{ movement.quantityDelta > 0 ? '+' : '' }}{{ movement.quantityDelta }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="pf-card" style="margin-top: 18px">
      <div class="pf-card-header"><h2 class="pf-card-title">Ventas recientes</h2><RouterLink class="pf-link" to="/sales">Ver historial</RouterLink></div>
      <EmptyState v-if="!summary.recentSales.length" message="Todavía no hay ventas confirmadas." />
      <div v-else class="pf-table-wrap">
        <table class="pf-table">
          <thead><tr><th>Venta</th><th>Fecha</th><th>Total</th></tr></thead>
          <tbody><tr v-for="sale in summary.recentSales" :key="sale.saleId"><td><RouterLink class="pf-link" :to="'/sales/' + sale.saleId">{{ sale.saleId.slice(0, 8) }}</RouterLink></td><td>{{ formatDate(sale.createdAt) }}</td><td class="pf-number">{{ formatMoney(sale.total) }}</td></tr></tbody>
        </table>
      </div>
    </section>
  </template>
</template>
