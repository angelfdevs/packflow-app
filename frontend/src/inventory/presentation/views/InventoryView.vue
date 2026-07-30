<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import PageHeader from '../../../shared/presentation/components/PageHeader.vue'
import LoadingState from '../../../shared/presentation/components/LoadingState.vue'
import EmptyState from '../../../shared/presentation/components/EmptyState.vue'
import ErrorState from '../../../shared/presentation/components/ErrorState.vue'
import StatusBadge from '../../../shared/presentation/components/StatusBadge.vue'
import { inventoryService } from '../../application/inventoryService'
import { catalogService } from '../../../catalog/application/catalogService'
import { inventoryRules } from '../../domain/inventoryRules'
import { formatDate, formatDimensions } from '../../../shared/application/formatters'
import { getFriendlyError } from '../../../shared/application/useApiError'
import { useToastStore } from '../../../shared/application/stores/toastStore'

const toast = useToastStore()
const stockItems = ref([])
const movements = ref([])
const products = ref([])
const movementProductResults = ref([])
const loading = ref(true)
const loadingMovements = ref(false)
const errorMessage = ref('')
const search = ref('')
const page = ref(1)
const totalItems = ref(0)
const showMovementForm = ref(false)
const showAllMovements = ref(false)
const movementPage = ref(1)
const movementPageSize = ref(10)
const totalMovements = ref(0)
const saving = ref(false)
const movementProductQuery = ref('')
const movementProductPickerOpen = ref(false)
let movementProductSearchTimer = null
const stockPageSize = 6
const recentMovementPageSize = 10
const allMovementPageSize = 15
const form = reactive({
  productId: '',
  quantity: 1,
  adjustmentType: 'CORRECTION',
  direction: 'INCREASE',
  reason: '',
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / stockPageSize)))
const totalMovementPages = computed(() => Math.max(1, Math.ceil(totalMovements.value / movementPageSize.value)))

async function loadStock() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await inventoryService.listStock({ search: search.value || undefined, page: page.value, pageSize: stockPageSize, active: true })
    stockItems.value = response.data.items
    totalItems.value = response.data.totalItems
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loading.value = false
  }
}

async function loadMovements() {
  loadingMovements.value = true
  try {
    const response = await inventoryService.listMovements({ page: movementPage.value, pageSize: movementPageSize.value })
    movements.value = response.data.items
    totalMovements.value = response.data.totalItems
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  } finally {
    loadingMovements.value = false
  }
}

function mergeProducts(newProducts) {
  const merged = new Map(products.value.map((product) => [product.productId, product]))
  newProducts.forEach((product) => merged.set(product.productId, product))
  products.value = [...merged.values()]
}

async function loadProducts(searchTerm = '') {
  const response = await catalogService.listProducts({ active: 'true', search: searchTerm.trim() || undefined, page: 1, pageSize: 20 })
  movementProductResults.value = response.data.items
  mergeProducts(response.data.items)
}

function handleMovementProductSearch() {
  form.productId = ''
  movementProductPickerOpen.value = true
  if (movementProductSearchTimer) window.clearTimeout(movementProductSearchTimer)
  movementProductSearchTimer = window.setTimeout(() => loadProducts(movementProductQuery.value).catch((error) => toast.add(getFriendlyError(error), 'error')), 250)
}

function selectMovementProduct(product) {
  form.productId = product.productId
  movementProductQuery.value = product.name + ' · ' + formatDimensions(product.dimensions)
  movementProductPickerOpen.value = false
}

function openMovement() {
  form.productId = ''
  form.quantity = 1
  form.adjustmentType = 'CORRECTION'
  form.direction = 'INCREASE'
  form.reason = ''
  movementProductQuery.value = ''
  movementProductPickerOpen.value = false
  showMovementForm.value = true
}

async function saveMovement() {
  if (!form.productId || !inventoryRules.isValidQuantity(form.quantity)) {
    toast.add('Selecciona un producto y una cantidad válida.', 'error')
    return
  }
  if (form.direction === 'DECREASE' && !form.reason.trim()) {
    toast.add('Para disminuir stock debes indicar el motivo.', 'error')
    return
  }
  saving.value = true
  try {
    if (form.direction === 'INCREASE') {
      await inventoryService.receive({ productId: form.productId, quantity: Number(form.quantity) })
      toast.add('Ingreso de stock registrado.', 'success')
    } else {
      await inventoryService.adjust({
        productId: form.productId,
        adjustmentType: form.adjustmentType,
        direction: 'DECREASE',
        quantity: Number(form.quantity),
        reason: form.reason.trim(),
      })
      toast.add('Ajuste de stock registrado.', 'success')
    }
    showMovementForm.value = false
    await Promise.all([loadStock(), loadMovements()])
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  } finally {
    saving.value = false
  }
}

function changePage(nextPage) {
  page.value = Math.min(Math.max(1, nextPage), totalPages.value)
  loadStock()
}

function runSearch() {
  page.value = 1
  loadStock()
}

function clearFilters() {
  search.value = ''
  page.value = 1
  loadStock()
}

function toggleAllMovements() {
  showAllMovements.value = !showAllMovements.value
  movementPageSize.value = showAllMovements.value ? allMovementPageSize : recentMovementPageSize
  movementPage.value = 1
  loadMovements()
}

function changeMovementPage(nextPage) {
  movementPage.value = Math.min(Math.max(1, nextPage), totalMovementPages.value)
  loadMovements()
}

onMounted(async () => {
  try {
    await Promise.all([loadProducts(), loadStock(), loadMovements()])
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (movementProductSearchTimer) window.clearTimeout(movementProductSearchTimer)
})
</script>

<template>
  <PageHeader eyebrow="Inventario" title="Stock operativo" description="Consulta existencias y registra movimientos con trazabilidad.">
    <template #actions>
      <button class="pf-button pf-button-primary" type="button" @click="openMovement">
        <CIcon icon="cil-transfer" width="17" /> Registrar movimiento
      </button>
    </template>
  </PageHeader>

  <section class="pf-card">
    <div class="pf-toolbar">
      <div class="pf-field">
        <label for="stock-search">Buscar producto</label>
        <input id="stock-search" v-model="search" class="pf-input" placeholder="Nombre, medida o material" @keyup.enter="runSearch" />
      </div>
      <button class="pf-button pf-button-secondary" type="button" @click="runSearch"><CIcon icon="cil-search" width="17" /> Buscar</button>
      <button class="pf-button pf-button-ghost" type="button" @click="clearFilters"><CIcon icon="cil-filter-x" width="17" /> Limpiar filtros</button>
    </div>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadStock" />
    <EmptyState v-else-if="!stockItems.length" message="No hay existencias para mostrar." />
    <div v-else class="pf-table-wrap">
      <table class="pf-table">
        <thead><tr><th>Producto</th><th>Medidas</th><th>Stock actual</th><th>Estado</th></tr></thead>
        <tbody>
          <tr v-for="item in stockItems" :key="item.productId">
            <td><strong>{{ item.name }}</strong><div class="pf-kpi-label">{{ item.categoryName }} · {{ item.materialName }}</div></td>
            <td class="pf-number">{{ formatDimensions(item.dimensions) }}</td>
            <td class="pf-number">{{ item.currentStock }}</td>
            <td><StatusBadge :status="item.currentStock === 0 ? 'OUT' : inventoryRules.isLowStock(item.currentStock) ? 'LOW' : 'AVAILABLE'" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!loading && totalItems" class="pf-inline" style="justify-content: flex-end; margin-top: 18px">
      <button class="pf-button pf-button-secondary" type="button" aria-label="Página anterior" title="Página anterior" :disabled="page <= 1" @click="changePage(page - 1)"><CIcon icon="cil-chevron-left" width="17" /><span class="visually-hidden">Anterior</span></button>
      <span class="pf-number">Página {{ page }} de {{ totalPages }}</span>
      <button class="pf-button pf-button-secondary" type="button" aria-label="Página siguiente" title="Página siguiente" :disabled="page >= totalPages" @click="changePage(page + 1)"><CIcon icon="cil-chevron-right" width="17" /><span class="visually-hidden">Siguiente</span></button>
    </div>
  </section>

  <section class="pf-card" style="margin-top: 18px">
    <div class="pf-card-header">
      <div>
        <h2 class="pf-card-title">{{ showAllMovements ? 'Todos los movimientos' : 'Movimientos recientes' }}</h2>
        <span class="pf-kpi-label">{{ showAllMovements ? 'Historial completo paginado' : 'Últimos 10 registros' }}</span>
      </div>
      <button class="pf-button pf-button-secondary" type="button" @click="toggleAllMovements">
        <CIcon :icon="showAllMovements ? 'cil-history' : 'cil-list-rich'" width="17" />
        {{ showAllMovements ? 'Ver últimos 10' : 'Ver todos los movimientos' }}
      </button>
    </div>
    <LoadingState v-if="loadingMovements" />
    <EmptyState v-else-if="!movements.length" message="Todavía no hay movimientos registrados." />
    <div v-else class="pf-table-wrap">
      <table class="pf-table">
        <thead><tr><th>Producto</th><th>Medidas</th><th>Cantidad</th><th>Stock resultante</th><th>Fecha</th><th>Motivo</th></tr></thead>
        <tbody>
          <tr v-for="movement in movements" :key="movement.movementId">
            <td><strong>{{ movement.productName || products.find((product) => product.productId === movement.productId)?.name || 'Producto no disponible' }}</strong></td>
            <td class="pf-number">{{ formatDimensions(movement.dimensions || products.find((product) => product.productId === movement.productId)?.dimensions) }}</td>
            <td class="pf-number">{{ movement.quantityDelta > 0 ? '+' : '' }}{{ movement.quantityDelta }}</td>
            <td class="pf-number">{{ movement.resultingStock }}</td>
            <td>{{ formatDate(movement.createdAt) }}</td>
            <td>{{ movement.reason || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showAllMovements && !loadingMovements && totalMovements" class="pf-inline" style="justify-content: flex-end; margin-top: 18px">
      <button class="pf-button pf-button-secondary" type="button" aria-label="Página anterior de movimientos" title="Página anterior" :disabled="movementPage <= 1" @click="changeMovementPage(movementPage - 1)"><CIcon icon="cil-chevron-left" width="17" /><span class="visually-hidden">Anterior</span></button>
      <span class="pf-number">Página {{ movementPage }} de {{ totalMovementPages }}</span>
      <button class="pf-button pf-button-secondary" type="button" aria-label="Página siguiente de movimientos" title="Página siguiente" :disabled="movementPage >= totalMovementPages" @click="changeMovementPage(movementPage + 1)"><CIcon icon="cil-chevron-right" width="17" /><span class="visually-hidden">Siguiente</span></button>
    </div>
  </section>

  <div v-if="showMovementForm" class="pf-modal-backdrop">
    <section class="pf-modal" role="dialog" aria-modal="true">
      <div class="pf-card-header">
        <h2 class="pf-card-title">Registrar movimiento de stock</h2>
        <button class="pf-button pf-button-ghost" type="button" @click="showMovementForm = false">×</button>
      </div>
      <form class="pf-form-grid" @submit.prevent="saveMovement">
        <div class="pf-field pf-product-picker">
          <label for="movement-product">Producto</label>
          <input id="movement-product" v-model="movementProductQuery" class="pf-input" placeholder="Nombre, medida, categoría o material" autocomplete="off" required @focus="movementProductPickerOpen = true" @input="handleMovementProductSearch" />
          <div v-if="movementProductPickerOpen && movementProductResults.length" class="pf-product-results" role="listbox" aria-label="Productos encontrados">
            <button v-for="product in movementProductResults" :key="product.productId" class="pf-product-result" type="button" role="option" :aria-selected="form.productId === product.productId" @click="selectMovementProduct(product)">
              <strong>{{ product.name }}</strong>
              <span>{{ formatDimensions(product.dimensions) }} · {{ product.categoryName || 'Categoría' }} · {{ product.materialName || 'Material' }}</span>
            </button>
          </div>
          <span v-else-if="movementProductPickerOpen && movementProductQuery.trim()" class="pf-picker-status">No se encontraron productos.</span>
        </div>
        <div class="pf-grid pf-grid-2">
          <div class="pf-field"><label for="movement-quantity">Cantidad</label><input id="movement-quantity" v-model="form.quantity" class="pf-input" type="number" min="1" max="1000000" step="1" required /></div>
          <div class="pf-field">
            <label for="adjustment-direction">Movimiento</label>
            <select id="adjustment-direction" v-model="form.direction" class="pf-select">
              <option value="INCREASE">Aumentar stock</option>
              <option value="DECREASE">Disminuir stock</option>
            </select>
          </div>
        </div>
        <div v-if="form.direction === 'DECREASE'" class="pf-grid pf-grid-2">
          <div class="pf-field">
            <label for="adjustment-type">Motivo de disminución</label>
            <select id="adjustment-type" v-model="form.adjustmentType" class="pf-select">
              <option value="CORRECTION">Corrección</option>
              <option value="LOSS">Pérdida</option>
              <option value="DAMAGE">Daño</option>
            </select>
          </div>
          <div class="pf-field">
            <label for="movement-reason">Justificación</label>
            <textarea id="movement-reason" v-model="form.reason" class="pf-textarea" rows="3" maxlength="255" required />
          </div>
        </div>
        <p v-else class="pf-kpi-label">Los ingresos de mercadería aumentan el stock y no requieren motivo.</p>
        <div class="pf-inline" style="justify-content: flex-end">
          <button class="pf-button pf-button-secondary" type="button" @click="showMovementForm = false">Cancelar</button>
          <button class="pf-button pf-button-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Confirmar movimiento' }}</button>
        </div>
      </form>
    </section>
  </div>
</template>
