<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageHeader from '../../../shared/presentation/components/PageHeader.vue'
import LoadingState from '../../../shared/presentation/components/LoadingState.vue'
import EmptyState from '../../../shared/presentation/components/EmptyState.vue'
import ErrorState from '../../../shared/presentation/components/ErrorState.vue'
import StatusBadge from '../../../shared/presentation/components/StatusBadge.vue'
import ConfirmDialog from '../../../shared/presentation/components/ConfirmDialog.vue'
import { catalogService } from '../../application/catalogService'
import { productRules } from '../../domain/productRules'
import { formatDimensions, formatMoney } from '../../../shared/application/formatters'
import { getFriendlyError } from '../../../shared/application/useApiError'
import { useToastStore } from '../../../shared/application/stores/toastStore'

const toast = useToastStore()
const products = ref([])
const categories = ref([])
const materials = ref([])
const loading = ref(true)
const errorMessage = ref('')
const search = ref('')
const activeFilter = ref('true')
const page = ref(1)
const pageSize = ref(6)
const totalItems = ref(0)
const showForm = ref(false)
const editingProduct = ref(null)
const pendingToggle = ref(null)
const saving = ref(false)
const showReferenceForm = ref(false)
const referenceType = ref('category')
const referenceName = ref('')
const savingReference = ref(false)

const emptyForm = () => ({
  categoryId: '',
  materialId: '',
  name: '',
  dimensions: { lengthCm: '', widthCm: '', heightCm: '' },
  retailPrice: '',
  wholesalePrice: '',
  initialStock: 0,
})
const form = reactive(emptyForm())

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))

function resetForm() {
  Object.assign(form, emptyForm())
}

async function loadReferenceData() {
  const [categoryResponse, materialResponse] = await Promise.all([
    catalogService.listCategories({ page: 1, pageSize: 100 }),
    catalogService.listMaterials({ page: 1, pageSize: 100 }),
  ])
  categories.value = categoryResponse.data.items
  materials.value = materialResponse.data.items
}

async function loadProducts() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await catalogService.listProducts({
      search: search.value || undefined,
      active: activeFilter.value === '' ? undefined : activeFilter.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    products.value = response.data.items
    totalItems.value = response.data.totalItems
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingProduct.value = null
  resetForm()
  showForm.value = true
}

function openReferenceForm(type) {
  referenceType.value = type
  referenceName.value = ''
  showReferenceForm.value = true
}

async function saveReference() {
  const name = referenceName.value.trim()
  if (!name) {
    toast.add('Ingresa un nombre válido.', 'error')
    return
  }
  savingReference.value = true
  try {
    if (referenceType.value === 'category') {
      await catalogService.createCategory(name)
      toast.add('Categoría registrada.', 'success')
    } else {
      await catalogService.createMaterial(name)
      toast.add('Material registrado.', 'success')
    }
    showReferenceForm.value = false
    await loadReferenceData()
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  } finally {
    savingReference.value = false
  }
}

function openEdit(product) {
  editingProduct.value = product
  Object.assign(form, {
    categoryId: product.categoryId,
    materialId: product.materialId,
    name: product.name,
    dimensions: { ...product.dimensions },
    retailPrice: product.retailPrice,
    wholesalePrice: product.wholesalePrice,
    initialStock: 0,
  })
  showForm.value = true
}

async function saveProduct() {
  if (!form.categoryId || !form.materialId || !form.name.trim()) {
    toast.add('Completa los datos obligatorios del producto.', 'error')
    return
  }
  if (!productRules.isValidDimensions(form.dimensions)) {
    toast.add('Las dimensiones deben ser mayores que cero y no superar 1 000 cm.', 'error')
    return
  }
  if (!productRules.isValidPrice(form.retailPrice) || !productRules.isValidPrice(form.wholesalePrice)) {
    toast.add('Los precios no pueden ser negativos.', 'error')
    return
  }
  if (!editingProduct.value && !productRules.isValidInitialStock(form.initialStock)) {
    toast.add('El stock inicial debe ser un entero entre 0 y 1 000 000.', 'error')
    return
  }
  saving.value = true
  try {
    const payload = {
      categoryId: form.categoryId,
      materialId: form.materialId,
      name: form.name.trim(),
      dimensions: {
        lengthCm: Number(form.dimensions.lengthCm),
        widthCm: Number(form.dimensions.widthCm),
        heightCm: Number(form.dimensions.heightCm),
      },
      retailPrice: String(Number(form.retailPrice).toFixed(2)),
      wholesalePrice: String(Number(form.wholesalePrice).toFixed(2)),
    }
    if (editingProduct.value) {
      const etag = editingProduct.value.etag || '"v' + editingProduct.value.version + '"'
      await catalogService.updateProduct(editingProduct.value.productId, payload, etag)
      toast.add('Producto actualizado.', 'success')
    } else {
      await catalogService.createProduct({ ...payload, initialStock: Number(form.initialStock || 0) })
      toast.add('Producto registrado.', 'success')
    }
    showForm.value = false
    await loadProducts()
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  } finally {
    saving.value = false
  }
}

async function toggleProduct() {
  const product = pendingToggle.value
  pendingToggle.value = null
  if (!product) return
  try {
    const etag = product.etag || '"v' + product.version + '"'
    await catalogService.updateStatus(product.productId, !product.active, etag)
    toast.add(product.active ? 'Producto desactivado.' : 'Producto activado.', 'success')
    await loadProducts()
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  }
}

function changePage(nextPage) {
  page.value = Math.min(Math.max(1, nextPage), totalPages.value)
  loadProducts()
}

function runSearch() {
  page.value = 1
  loadProducts()
}

function clearFilters() {
  search.value = ''
  activeFilter.value = 'true'
  page.value = 1
  loadProducts()
}

onMounted(async () => {
  try {
    await loadReferenceData()
    await loadProducts()
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
    loading.value = false
  }
})
</script>

<template>
  <PageHeader eyebrow="Catálogo" title="Productos" description="Mantén el catálogo del negocio listo para consultar, cotizar y vender.">
    <template #actions>
      <button class="pf-button pf-button-secondary" type="button" @click="openReferenceForm('category')">
        <CIcon icon="cil-list-rich" width="17" /> Nueva categoría
      </button>
      <button class="pf-button pf-button-secondary" type="button" @click="openReferenceForm('material')">
        <CIcon icon="cil-inbox" width="17" /> Nuevo material
      </button>
      <button class="pf-button pf-button-primary" type="button" @click="openCreate">
        <CIcon icon="cil-plus" width="17" /> Nuevo producto
      </button>
    </template>
  </PageHeader>

  <section class="pf-card">
    <div class="pf-toolbar">
      <div class="pf-field">
        <label for="product-search">Buscar producto</label>
        <input id="product-search" v-model="search" class="pf-input" placeholder="Nombre, medida o material" @keyup.enter="runSearch" />
      </div>
      <div class="pf-field" style="max-width: 180px">
        <label for="product-status">Estado</label>
        <select id="product-status" v-model="activeFilter" class="pf-select" @change="runSearch">
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
          <option value="">Todos</option>
        </select>
      </div>
      <button class="pf-button pf-button-secondary" type="button" @click="runSearch"><CIcon icon="cil-search" width="17" /> Buscar</button>
      <button class="pf-button pf-button-ghost" type="button" @click="clearFilters"><CIcon icon="cil-filter-x" width="17" /> Limpiar filtros</button>
    </div>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadProducts" />
    <EmptyState v-else-if="!products.length" message="No hay productos que coincidan con los filtros." />
    <div v-else class="pf-table-wrap">
      <table class="pf-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Medidas</th>
            <th>Precios</th>
            <th>Stock</th>
            <th>Estado</th>
            <th><span class="visually-hidden">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.productId">
            <td>
              <strong>{{ product.name }}</strong>
              <div class="pf-kpi-label">{{ product.categoryName || 'Categoría' }} · {{ product.materialName || 'Material' }}</div>
            </td>
            <td class="pf-number">{{ formatDimensions(product.dimensions) }}</td>
            <td>
              <div class="pf-number">{{ formatMoney(product.retailPrice) }} minorista</div>
              <div class="pf-kpi-label">{{ formatMoney(product.wholesalePrice) }} mayorista</div>
            </td>
            <td class="pf-number">{{ product.currentStock }}</td>
            <td><StatusBadge :status="!product.active ? 'INACTIVE' : product.currentStock === 0 ? 'OUT' : product.currentStock <= 15 ? 'LOW' : 'ACTIVE'" /></td>
            <td>
              <div class="pf-inline">
                <button class="pf-button pf-button-ghost" type="button" title="Editar producto" @click="openEdit(product)">
                  <CIcon icon="cil-pencil" width="16" />
                </button>
                <button class="pf-button pf-button-ghost" type="button" @click="pendingToggle = product">
                  {{ product.active ? 'Desactivar' : 'Activar' }}
                </button>
              </div>
            </td>
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

  <div v-if="showForm" class="pf-modal-backdrop">
    <section class="pf-modal" role="dialog" aria-modal="true" :aria-label="editingProduct ? 'Editar producto' : 'Registrar producto'">
      <div class="pf-card-header">
        <h2 class="pf-card-title">{{ editingProduct ? 'Editar producto' : 'Registrar producto' }}</h2>
        <button class="pf-button pf-button-ghost" type="button" @click="showForm = false">×</button>
      </div>
      <form class="pf-form-grid" @submit.prevent="saveProduct">
        <div class="pf-grid pf-grid-2">
          <div class="pf-field">
            <label for="product-category">Categoría</label>
            <select id="product-category" v-model="form.categoryId" class="pf-select" required>
              <option value="">Selecciona una categoría</option>
              <option v-for="category in categories" :key="category.categoryId" :value="category.categoryId">{{ category.name }}</option>
            </select>
          </div>
          <div class="pf-field">
            <label for="product-material">Material</label>
            <select id="product-material" v-model="form.materialId" class="pf-select" required>
              <option value="">Selecciona un material</option>
              <option v-for="material in materials" :key="material.materialId" :value="material.materialId">{{ material.name }}</option>
            </select>
          </div>
        </div>
        <div class="pf-field">
          <label for="product-name">Nombre</label>
          <input id="product-name" v-model="form.name" class="pf-input" maxlength="150" required />
        </div>
        <div class="pf-grid pf-grid-3">
          <div class="pf-field"><label for="length">Largo (cm)</label><input id="length" v-model="form.dimensions.lengthCm" class="pf-input" type="number" min="0.01" max="1000" step="0.01" required /></div>
          <div class="pf-field"><label for="width">Ancho (cm)</label><input id="width" v-model="form.dimensions.widthCm" class="pf-input" type="number" min="0.01" max="1000" step="0.01" required /></div>
          <div class="pf-field"><label for="height">Alto (cm)</label><input id="height" v-model="form.dimensions.heightCm" class="pf-input" type="number" min="0.01" max="1000" step="0.01" required /></div>
        </div>
        <div class="pf-grid pf-grid-3">
          <div class="pf-field"><label for="retail">Precio minorista</label><input id="retail" v-model="form.retailPrice" class="pf-input" type="number" min="0" step="0.01" required /></div>
          <div class="pf-field"><label for="wholesale">Precio mayorista</label><input id="wholesale" v-model="form.wholesalePrice" class="pf-input" type="number" min="0" step="0.01" required /></div>
          <div v-if="!editingProduct" class="pf-field"><label for="initial-stock">Stock inicial</label><input id="initial-stock" v-model="form.initialStock" class="pf-input" type="number" min="0" max="1000000" step="1" /></div>
        </div>
        <div class="pf-inline" style="justify-content: flex-end; margin-top: 8px">
          <button class="pf-button pf-button-secondary" type="button" @click="showForm = false">Cancelar</button>
          <button class="pf-button pf-button-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar producto' }}</button>
        </div>
      </form>
    </section>
  </div>

  <div v-if="showReferenceForm" class="pf-modal-backdrop">
    <section class="pf-modal" role="dialog" aria-modal="true" :aria-label="referenceType === 'category' ? 'Nueva categoría' : 'Nuevo material'">
      <div class="pf-card-header">
        <h2 class="pf-card-title">{{ referenceType === 'category' ? 'Nueva categoría' : 'Nuevo material' }}</h2>
        <button class="pf-button pf-button-ghost" type="button" aria-label="Cerrar" @click="showReferenceForm = false">×</button>
      </div>
      <form class="pf-form-grid" @submit.prevent="saveReference">
        <div class="pf-field">
          <label for="reference-name">Nombre</label>
          <input id="reference-name" v-model="referenceName" class="pf-input" maxlength="150" required />
        </div>
        <div class="pf-inline" style="justify-content: flex-end; margin-top: 8px">
          <button class="pf-button pf-button-secondary" type="button" @click="showReferenceForm = false">Cancelar</button>
          <button class="pf-button pf-button-primary" type="submit" :disabled="savingReference"><CIcon icon="cil-check" width="17" /> {{ savingReference ? 'Guardando…' : 'Confirmar registro' }}</button>
        </div>
      </form>
    </section>
  </div>

  <ConfirmDialog
    :open="Boolean(pendingToggle)"
    :title="pendingToggle?.active ? 'Desactivar producto' : 'Activar producto'"
    :message="pendingToggle?.active ? 'El producto dejará de estar disponible para nuevas operaciones.' : 'El producto volverá a estar disponible para cotizar y vender.'"
    :confirm-text="pendingToggle?.active ? 'Desactivar' : 'Activar'"
    :danger="pendingToggle?.active"
    @cancel="pendingToggle = null"
    @confirm="toggleProduct"
  />
</template>
