<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../../../shared/presentation/components/PageHeader.vue'
import LoadingState from '../../../shared/presentation/components/LoadingState.vue'
import ErrorState from '../../../shared/presentation/components/ErrorState.vue'
import { commercialOperationService } from '../../application/commercialOperationService'
import { catalogService } from '../../../catalog/application/catalogService'
import { formatDate, formatDimensions, formatMoney } from '../../../shared/application/formatters'
import { getFriendlyError } from '../../../shared/application/useApiError'

const route = useRoute()
const sale = ref(null)
const productDetails = ref({})
const loading = ref(true)
const errorMessage = ref('')

function productInfo(item) {
  const fallback = productDetails.value[item.productId] || {}
  return {
    name: item.productName || fallback.name || 'Producto no disponible',
    dimensions: item.dimensions || fallback.dimensions,
    categoryName: item.categoryName || fallback.categoryName,
    materialName: item.materialName || fallback.materialName,
  }
}

function screenPrintingInfo(item) {
  const printing = item.screenPrinting
  if (!printing?.enabled) return 'Sin serigrafía'
  return `${printing.colors} ${printing.colors === 1 ? 'color' : 'colores'} · ${printing.lots} ${printing.lots === 1 ? 'lote' : 'lotes'} · ${formatMoney(printing.amount)}`
}

async function loadProductFallbacks(items) {
  const unresolvedItems = items.filter((item) => !item.productName || !item.dimensions)
  const responses = await Promise.allSettled(unresolvedItems.map((item) => catalogService.getProduct(item.productId)))
  responses.forEach((response, index) => {
    if (response.status === 'fulfilled') productDetails.value[unresolvedItems[index].productId] = response.value.data
  })
}

async function loadSale() {
  try {
    const response = await commercialOperationService.getSale(route.params.saleId)
    sale.value = response.data
    await loadProductFallbacks(sale.value.items || [])
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadSale)
</script>

<template>
  <PageHeader eyebrow="Ventas" title="Detalle de venta" description="Valores históricos de la operación confirmada.">
    <template #actions><RouterLink class="pf-button pf-button-secondary" to="/sales">Volver a ventas</RouterLink></template>
  </PageHeader>
  <LoadingState v-if="loading" />
  <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadSale" />
  <section v-else-if="sale" class="pf-card">
    <div class="pf-card-header"><div><h2 class="pf-card-title">Venta {{ sale.saleId }}</h2><div class="pf-kpi-label">{{ formatDate(sale.createdAt) }}</div></div><span class="pf-badge pf-badge-success">Confirmada</span></div>
    <div v-if="sale.description" class="pf-alert pf-alert-info pf-sale-description" style="margin-bottom: 18px"><strong>Descripción:</strong> {{ sale.description }}</div>
    <div class="pf-table-wrap">
      <table class="pf-table">
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Serigrafía</th><th>Importe</th></tr></thead>
        <tbody>
          <tr v-for="item in sale.items" :key="item.productId">
            <td>
              <strong>{{ productInfo(item).name }}</strong>
              <div class="pf-kpi-label">
                {{ formatDimensions(productInfo(item).dimensions) }}
                <template v-if="productInfo(item).categoryName || productInfo(item).materialName"> · {{ productInfo(item).categoryName || 'Categoría' }} · {{ productInfo(item).materialName || 'Material' }}</template>
              </div>
            </td>
            <td class="pf-number">{{ item.quantity }}</td>
            <td class="pf-number">{{ formatMoney(item.unitPrice) }}</td>
            <td>{{ screenPrintingInfo(item) }}</td>
            <td class="pf-number">{{ formatMoney(item.lineAmount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="max-width: 360px; margin: 24px 0 0 auto">
      <div v-if="sale.discount" class="pf-summary-row"><span>Descuento {{ sale.discount.type === 'PERCENTAGE' ? sale.discount.value + '%' : 'fijo' }}</span><strong class="pf-number">- {{ formatMoney(sale.discount.amount) }}</strong></div>
      <div class="pf-summary-row"><span>Subtotal</span><strong class="pf-number">{{ formatMoney(sale.subtotal) }}</strong></div>
      <div class="pf-summary-row"><span>IGV</span><strong class="pf-number">{{ formatMoney(sale.igv) }}</strong></div>
      <div class="pf-summary-row"><strong>Total</strong><strong class="pf-summary-total">{{ formatMoney(sale.total) }}</strong></div>
    </div>
  </section>
</template>
