<script setup>
import { onMounted, reactive, ref } from 'vue'
import PageHeader from '../../../shared/presentation/components/PageHeader.vue'
import { identityAccountApi } from '../../infrastructure/identityAccountApi'
import { useSettingsStore } from '../../../shared/application/stores/settingsStore'
import { useToastStore } from '../../../shared/application/stores/toastStore'
import { getFriendlyError } from '../../../shared/application/useApiError'
import { formatMoney } from '../../../shared/application/formatters'

const settings = useSettingsStore()
const toast = useToastStore()
const account = ref(null)
const accountForm = reactive({ businessName: '', email: '' })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const ruleDraft = reactive({ igvRate: '18', tiers: [] })
const fontSizeDraft = ref('MEDIUM')
const accountEditing = ref(false)
const fontSizeEditing = ref(false)
const rulesEditing = ref(false)
const passwordOpen = ref(false)
const savingAccount = ref(false)
const savingPassword = ref(false)
const savingFontSize = ref(false)
const savingRules = ref(false)
const errorMessage = ref('')

function syncRuleDraft() {
  ruleDraft.igvRate = String(Number(settings.igvRate || 0) * 100)
  ruleDraft.tiers = (settings.screenPrintingTiers || []).map((tier) => ({
    from: tier.from,
    to: tier.to ?? '',
    ratePerColor: String(tier.ratePerColor),
  }))
  fontSizeDraft.value = settings.fontSize
}

async function loadAccount() {
  const response = await identityAccountApi.getAccount()
  account.value = response.data
  accountForm.businessName = response.data.businessName
  accountForm.email = response.data.email
}

function startAccountEdit() {
  accountEditing.value = true
}

function cancelAccountEdit() {
  accountForm.businessName = account.value.businessName
  accountForm.email = account.value.email
  accountEditing.value = false
}

async function saveAccount() {
  if (!accountEditing.value) return
  if (!accountForm.businessName.trim() || !accountForm.email.trim()) {
    toast.add('El nombre y el correo del negocio son obligatorios.', 'error')
    return
  }
  savingAccount.value = true
  try {
    const response = await identityAccountApi.updateAccount({ businessName: accountForm.businessName.trim(), email: accountForm.email.trim() }, '"v' + account.value.version + '"')
    account.value = response.data
    accountForm.businessName = response.data.businessName
    accountForm.email = response.data.email
    accountEditing.value = false
    toast.add('Datos del negocio actualizados.', 'success')
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  } finally {
    savingAccount.value = false
  }
}

async function changeTheme(event) {
  try {
    await settings.setTheme(event.target.checked ? 'DARK' : 'LIGHT')
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  }
}

function startFontSizeEdit() {
  fontSizeDraft.value = settings.fontSize
  fontSizeEditing.value = true
}

function cancelFontSizeEdit() {
  fontSizeDraft.value = settings.fontSize
  fontSizeEditing.value = false
}

async function saveFontSize() {
  savingFontSize.value = true
  try {
    await settings.setFontSize(fontSizeDraft.value)
    fontSizeEditing.value = false
    toast.add('Tamaño de fuente actualizado.', 'success')
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  } finally {
    savingFontSize.value = false
  }
}

function startRulesEdit() {
  syncRuleDraft()
  rulesEditing.value = true
}

function cancelRulesEdit() {
  syncRuleDraft()
  rulesEditing.value = false
}

function validateRules() {
  const igvRate = Number(ruleDraft.igvRate)
  if (!Number.isFinite(igvRate) || igvRate < 0 || igvRate > 100) return 'El IGV debe estar entre 0 % y 100 %.'
  if (ruleDraft.tiers.length !== 3) return 'Debes conservar los tres rangos de serigrafía.'
  const expectedRanges = [
    { from: 20, to: 300 },
    { from: 301, to: 500 },
    { from: 501, to: '' },
  ]
  for (const tier of ruleDraft.tiers) {
    const from = Number(tier.from)
    const rate = Number(tier.ratePerColor)
    if (!Number.isInteger(from) || from < 20 || !Number.isFinite(rate) || rate < 0) return 'Revisa los rangos y las tarifas de serigrafía.'
    if (tier.to !== '' && (!Number.isInteger(Number(tier.to)) || Number(tier.to) < from)) return 'Cada rango debe tener límites válidos.'
  }
  const hasFixedRanges = ruleDraft.tiers.every((tier, index) => Number(tier.from) === expectedRanges[index].from && String(tier.to) === String(expectedRanges[index].to))
  if (!hasFixedRanges) return 'Los rangos de serigrafía son fijos: 20–300, 301–500 y 501 en adelante.'
  return ''
}

async function saveRules() {
  const validationError = validateRules()
  if (validationError) {
    toast.add(validationError, 'error')
    return
  }
  savingRules.value = true
  try {
    await settings.update({
      igvRate: Number(ruleDraft.igvRate) / 100,
      screenPrintingTiers: ruleDraft.tiers.map((tier) => ({
        from: Number(tier.from),
        to: tier.to === '' ? null : Number(tier.to),
        ratePerColor: Number(tier.ratePerColor).toFixed(2),
      })),
    })
    syncRuleDraft()
    rulesEditing.value = false
    toast.add('Reglas comerciales guardadas.', 'success')
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  } finally {
    savingRules.value = false
  }
}

async function savePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.add('Las contraseñas no coinciden.', 'error')
    return
  }
  savingPassword.value = true
  try {
    await identityAccountApi.changePassword(passwordForm)
    Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
    passwordOpen.value = false
    toast.add('Contraseña actualizada. Las sesiones anteriores fueron revocadas.', 'success')
  } catch (error) {
    toast.add(getFriendlyError(error), 'error')
  } finally {
    savingPassword.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([loadAccount(), settings.load()])
    syncRuleDraft()
  } catch (error) {
    errorMessage.value = getFriendlyError(error)
  }
})
</script>

<template>
  <PageHeader eyebrow="Cuenta" title="Configuración" description="Ajusta la información del negocio, apariencia y reglas comerciales." />
  <div v-if="errorMessage" class="pf-alert" style="margin-bottom: 18px">{{ errorMessage }}</div>
  <div class="pf-grid pf-grid-2">
    <section class="pf-card">
      <div class="pf-card-header"><h2 class="pf-card-title">Datos del negocio</h2><span class="pf-kpi-label">Información protegida</span></div>
      <form class="pf-form-grid" @submit.prevent="saveAccount">
        <div class="pf-field">
          <label for="business-name">Nombre del negocio</label>
          <div class="pf-input-action">
            <input id="business-name" v-model="accountForm.businessName" class="pf-input" maxlength="150" :disabled="!accountEditing" />
            <button class="pf-button pf-button-ghost" type="button" aria-label="Editar nombre del negocio" title="Editar nombre del negocio" @click="startAccountEdit"><CIcon icon="cil-pencil" width="16" /></button>
          </div>
        </div>
        <div class="pf-field">
          <label for="business-email">Correo administrador</label>
          <div class="pf-input-action">
            <input id="business-email" v-model="accountForm.email" class="pf-input" type="email" maxlength="254" :disabled="!accountEditing" />
            <button class="pf-button pf-button-ghost" type="button" aria-label="Editar correo administrador" title="Editar correo administrador" @click="startAccountEdit"><CIcon icon="cil-pencil" width="16" /></button>
          </div>
        </div>
        <div v-if="accountEditing" class="pf-inline" style="justify-content: flex-end">
          <button class="pf-button pf-button-secondary" type="button" @click="cancelAccountEdit">Cancelar</button>
          <button class="pf-button pf-button-primary" type="submit" :disabled="savingAccount"><CIcon icon="cil-check" width="17" /> {{ savingAccount ? 'Confirmando…' : 'Confirmar cambios' }}</button>
        </div>
      </form>
    </section>

    <section class="pf-card">
      <div class="pf-card-header"><h2 class="pf-card-title">Apariencia</h2><span class="pf-kpi-label">Preferencias del negocio</span></div>
      <div class="pf-form-grid">
        <div class="pf-setting-row">
          <div><strong>Tema oscuro</strong><div class="pf-kpi-label">Cambia el contraste de toda la aplicación.</div></div>
          <label class="pf-switch" aria-label="Cambiar tema oscuro">
            <input type="checkbox" :checked="settings.theme === 'DARK'" @change="changeTheme" />
            <span class="pf-switch-track"><span class="pf-switch-thumb" /></span>
          </label>
        </div>
        <div class="pf-field">
          <label for="font-size">Tamaño de fuente</label>
          <div class="pf-input-action">
            <select id="font-size" v-model="fontSizeDraft" class="pf-select" :disabled="!fontSizeEditing">
              <option value="SMALL">Pequeño</option>
              <option value="MEDIUM">Mediano</option>
              <option value="LARGE">Grande</option>
            </select>
            <button class="pf-button pf-button-ghost" type="button" aria-label="Editar tamaño de fuente" title="Editar tamaño de fuente" @click="startFontSizeEdit"><CIcon icon="cil-pencil" width="16" /></button>
          </div>
        </div>
        <div v-if="fontSizeEditing" class="pf-inline" style="justify-content: flex-end">
          <button class="pf-button pf-button-secondary" type="button" @click="cancelFontSizeEdit">Cancelar</button>
          <button class="pf-button pf-button-primary" type="button" :disabled="savingFontSize" @click="saveFontSize"><CIcon icon="cil-check" width="17" /> {{ savingFontSize ? 'Confirmando…' : 'Confirmar tamaño' }}</button>
        </div>
      </div>
    </section>

    <section class="pf-card">
      <div class="pf-card-header">
        <div><h2 class="pf-card-title">Reglas comerciales</h2><span class="pf-kpi-label">Se aplican al calcular operaciones.</span></div>
        <button v-if="!rulesEditing" class="pf-button pf-button-ghost" type="button" aria-label="Editar reglas comerciales" title="Editar reglas comerciales" @click="startRulesEdit"><CIcon icon="cil-pencil" width="16" /></button>
      </div>
      <div v-if="!rulesEditing">
        <div class="pf-summary-row"><span>IGV</span><strong class="pf-number">{{ Number(settings.igvRate) * 100 }}%</strong></div>
        <div v-for="tier in settings.screenPrintingTiers" :key="tier.from" class="pf-summary-row"><span>{{ tier.from }}{{ tier.to ? '–' + tier.to : '+' }} unidades</span><strong class="pf-number">{{ formatMoney(tier.ratePerColor) }} / color</strong></div>
      </div>
      <form v-else class="pf-form-grid" @submit.prevent="saveRules">
        <p class="pf-kpi-label">Los rangos de cantidad son fijos. Solo puedes modificar el IGV y la tarifa por color de cada rango.</p>
        <div class="pf-field"><label for="igv-rate">IGV (%)</label><input id="igv-rate" v-model="ruleDraft.igvRate" class="pf-input" type="number" min="0" max="100" step="0.01" required /></div>
        <div v-for="(tier, index) in ruleDraft.tiers" :key="index" class="pf-rule-editor">
          <strong>Rango {{ index + 1 }}</strong>
          <div class="pf-grid pf-grid-3">
            <div class="pf-field"><label :for="'tier-from-' + index">Desde</label><input :id="'tier-from-' + index" v-model="tier.from" class="pf-input" type="number" disabled /></div>
            <div class="pf-field"><label :for="'tier-to-' + index">Hasta</label><input :id="'tier-to-' + index" v-model="tier.to" class="pf-input" type="number" placeholder="Sin límite" disabled /></div>
            <div class="pf-field"><label :for="'tier-rate-' + index">S/ por color</label><input :id="'tier-rate-' + index" v-model="tier.ratePerColor" class="pf-input" type="number" min="0" step="0.01" required /></div>
          </div>
        </div>
        <div class="pf-inline" style="justify-content: flex-end">
          <button class="pf-button pf-button-secondary" type="button" @click="cancelRulesEdit">Cancelar</button>
          <button class="pf-button pf-button-primary" type="submit" :disabled="savingRules"><CIcon icon="cil-save" width="17" /> {{ savingRules ? 'Guardando…' : 'Guardar configuración' }}</button>
        </div>
      </form>
    </section>

    <section class="pf-card">
      <div class="pf-card-header"><div><h2 class="pf-card-title">Cambiar contraseña</h2><span class="pf-kpi-label">Requiere confirmar la contraseña actual.</span></div><CIcon icon="cil-lock-locked" width="20" /></div>
      <div v-if="!passwordOpen" class="pf-empty">
        <p>El formulario permanece oculto hasta que decidas iniciar el cambio.</p>
        <button class="pf-button pf-button-secondary" type="button" @click="passwordOpen = true"><CIcon icon="cil-lock-locked" width="17" /> Abrir cambio de contraseña</button>
      </div>
      <form v-else class="pf-form-grid" autocomplete="off" @submit.prevent="savePassword">
        <div class="pf-field"><label for="current-password">Contraseña actual</label><input id="current-password" v-model="passwordForm.currentPassword" class="pf-input" type="password" minlength="12" autocomplete="current-password" required /></div>
        <div class="pf-field"><label for="new-password">Nueva contraseña</label><input id="new-password" v-model="passwordForm.newPassword" class="pf-input" type="password" minlength="12" autocomplete="new-password" required /></div>
        <div class="pf-field"><label for="confirm-password">Confirmar contraseña</label><input id="confirm-password" v-model="passwordForm.confirmPassword" class="pf-input" type="password" minlength="12" autocomplete="new-password" required /></div>
        <div class="pf-inline" style="justify-content: flex-end">
          <button class="pf-button pf-button-secondary" type="button" @click="passwordOpen = false">Cancelar</button>
          <button class="pf-button pf-button-primary" type="submit" :disabled="savingPassword"><CIcon icon="cil-check" width="17" /> {{ savingPassword ? 'Guardando…' : 'Confirmar cambio' }}</button>
        </div>
      </form>
    </section>
  </div>
</template>
