# Instrucciones del frontend de Agilora

- Utilizar Vue 3, JavaScript moderno, Vite, Pinia, Vue Router, CoreUI y Axios.
- Respetar los bounded contexts y las capas `presentation`, `application`, `domain` e `infrastructure` dentro de cada contexto.
- El backend es la autoridad final para precios, descuentos, costos adicionales, IGV, stock y totales.
- No enviar `businessId`, precios definitivos, stock final ni totales calculados como valores de confianza.
- No guardar access tokens, refresh tokens, contraseñas ni datos sensibles en `localStorage` o `sessionStorage`.
- Mantener los borradores de cotización y venta únicamente en memoria.
- Aplicar las reglas de rol también en la navegación, sin reemplazar la autorización del backend.
- Los estados de carga, vacío, error, autorización y sesión expirada deben ser visibles y comprensibles en español.
- Ejecutar lint, pruebas y build después de cambios relevantes.
