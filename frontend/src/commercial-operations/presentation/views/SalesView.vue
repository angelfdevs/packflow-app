<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../../../shared/presentation/components/PageHeader.vue'
import OperationWorkbench from '../components/OperationWorkbench.vue'
import LoadingState from '../../../shared/presentation/components/LoadingState.vue'
import EmptyState from '../../../shared/presentation/components/EmptyState.vue'
import { commercialOperationService } from '../../application/commercialOperationService'
import { formatDate, formatMoney } from '../../../shared/application/formatters'
import { getFriendlyError } from '../../../shared/application/useApiError'

const sales = ref([])
const loading = ref(true)
const errorMessage = ref('')
const route = useRoute()
const showHistory = computed(() => route.path === '/sales/history')
const page = ref(1)
const pageSize = 20
const totalItems = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)))

async function loadSales() {
  loading.value = true
  try {
    const response = await commercialOperationService.listSales({ page: page.value, pageSize })
    sales.value = response.data.items
    totalItems.value = response.data.totalItems
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loading.value = false
  }
}

function changePage(nextPage) {
  page.value = Math.min(Math.max(1, nextPage), totalPages.value)
  loadSales()
}

onMounted(loadSales)
</script>

<template>
  <OperationWorkbench v-if="!showHistory" mode="sale" />
  <section class="pf-card" style="margin-top: 28px">
    <PageHeader eyebrow="Historial" title="Ventas confirmadas" description="Consulta las operaciones conservadas para el control del negocio.">
      <template #actions>
        <RouterLink v-if="showHistory" class="pf-button pf-button-primary" to="/sales"><CIcon icon="cil-cart" width="17" /> Nueva venta</RouterLink>
      </template>
    </PageHeader>
    <div v-if="errorMessage" class="pf-alert">{{ errorMessage }}</div>
    <LoadingState v-else-if="loading" />
    <EmptyState v-else-if="!sales.length" message="Todavía no hay ventas confirmadas." />
    <div v-else class="pf-table-wrap">
      <table class="pf-table">
        <thead><tr><th>Venta</th><th>Descripción</th><th>Fecha</th><th>Subtotal</th><th>IGV</th><th>Total</th><th>Estado</th><th><span class="visually-hidden">Acciones</span></th></tr></thead>
        <tbody>
          <tr v-for="sale in sales" :key="sale.saleId">
            <td><RouterLink class="pf-link" :to="'/sales/' + sale.saleId">{{ sale.saleId.slice(0, 8) }}</RouterLink></td>
            <td class="pf-description-cell" :title="sale.description || ''">{{ sale.description || '—' }}</td>
            <td>{{ formatDate(sale.createdAt) }}</td>
            <td class="pf-number">{{ formatMoney(sale.subtotal) }}</td>
            <td class="pf-number">{{ formatMoney(sale.igv) }}</td>
            <td class="pf-number">{{ formatMoney(sale.total) }}</td>
            <td><span class="pf-badge pf-badge-success">Confirmada</span></td>
            <td>
              <RouterLink class="pf-button pf-button-ghost" :to="'/sales/' + sale.saleId" title="Ver venta completa" :aria-label="'Ver venta completa ' + sale.saleId.slice(0, 8)">
                <svg class="pf-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!loading && totalItems" class="pf-inline" style="justify-content: flex-end; margin-top: 18px">
      <button class="pf-button pf-button-secondary" type="button" aria-label="Página anterior de ventas" title="Página anterior" :disabled="page <= 1" @click="changePage(page - 1)"><CIcon icon="cil-chevron-left" width="17" /><span class="visually-hidden">Anterior</span></button>
      <span class="pf-number">Página {{ page }} de {{ totalPages }}</span>
      <button class="pf-button pf-button-secondary" type="button" aria-label="Página siguiente de ventas" title="Página siguiente" :disabled="page >= totalPages" @click="changePage(page + 1)"><CIcon icon="cil-chevron-right" width="17" /><span class="visually-hidden">Siguiente</span></button>
    </div>
  </section>
</template>
