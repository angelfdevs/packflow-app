import { expect, test } from '@playwright/test'

test('permite iniciar sesión con la cuenta demo', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill('admin@packflow.local')
  await page.getByLabel('Contraseña').fill('PackFlowDemo123!')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page).toHaveURL(/dashboard/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

test('permite calcular una cotización desde la interfaz', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill('admin@packflow.local')
  await page.getByLabel('Contraseña').fill('PackFlowDemo123!')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.getByRole('link', { name: 'Cotizador' }).click()
  await expect(page.getByRole('heading', { name: 'Cotizador' })).toBeVisible()
  await page.locator('#operation-product').fill('Caja duo')
  await page.getByRole('option', { name: /Caja dúo 20×20/ }).click()
  await page.getByRole('button', { name: 'Agregar' }).click()
  await page.locator('input[type="number"]').first().fill('50')
  await page.locator('select').filter({ hasText: 'Sin serigrafía' }).selectOption('true')
  await page.getByLabel(/Colores/).fill('1')
  await page.getByRole('button', { name: 'Calcular operación' }).click()
  await expect(page.getByText('Subtotal')).toBeVisible()
  await expect(page.getByText(/^IGV \(/)).toBeVisible()
  await expect(page.getByText('Total', { exact: true })).toBeVisible()
})
