# Contrato de API REST de Agilora

## 1. Alcance

La API conecta el frontend Vue con el backend ASP.NET Core. El backend es la autoridad final para autenticación, tenant, roles, catálogo, precios, costos adicionales, inventario, ventas, reportes y auditoría.

La especificación formal se encuentra en [openapi.yaml](./openapi.yaml).

## 2. Convenciones

- Base: `/api/v1`.
- JSON y `application/problem+json` para errores.
- UUID para identificadores internos.
- Fechas en ISO 8601; presentación en `America/Lima`.
- Importes como cadenas decimales con dos posiciones.
- Moneda inicial: `PEN`.
- Paginación con `page` y `pageSize`.
- El frontend no envía el tenant ni valores definitivos de precio, stock o total.
- El backend elimina espacios externos y valida duplicados ignorando mayúsculas cuando corresponda.

## 3. Seguridad

- Access token en memoria del frontend.
- Refresh token rotativo en cookie segura `HttpOnly`.
- CSRF para solicitudes que utilizan cookies.
- CORS limitado al origen configurado.
- Rate limiting por IP, usuario y negocio según el endpoint.
- `Idempotency-Key` en comandos persistentes.
- `If-Match` y ETags en actualizaciones mutables.
- Los endpoints administrativos comprueban el rol `ADMIN`.

## 4. Autenticación y acceso

| Método | Endpoint | Acceso | Uso |
|---|---|---|---|
| POST | `/auth/login` | Público | Iniciar sesión |
| GET | `/auth/csrf` | Público | Obtener token CSRF |
| POST | `/auth/refresh` | Cookie de sesión | Renovar sesión |
| GET | `/auth/me` | Autenticado | Obtener usuario, rol y negocio |
| POST | `/auth/logout` | Autenticado | Revocar sesión |
| POST | `/auth/password/change` | Autenticado | Cambiar contraseña |
| POST | `/auth/password/forgot` | Público | Solicitar recuperación |
| POST | `/auth/password/reset` | Público con token | Restablecer contraseña |

No habrá registro público en el primer release. El provisionamiento inicial del negocio será controlado.

## 5. Cuenta y configuración

| Método | Endpoint | Acceso | Uso |
|---|---|---|---|
| GET | `/account` | ADMIN | Consultar los datos del negocio |
| PATCH | `/account` | ADMIN | Actualizar los datos permitidos del negocio |
| GET | `/settings` | Autenticado | Consultar reglas comerciales y configuración del negocio |
| PATCH | `/settings` | ADMIN | Actualizar IGV y reglas comerciales |
| GET | `/me/preferences` | Autenticado | Consultar preferencias visuales del usuario |
| PATCH | `/me/preferences` | Autenticado | Actualizar tema y tamaño de fuente del usuario |

Las actualizaciones administrativas requieren `If-Match`, `Idempotency-Key` y una comprobación de rol en backend. Las preferencias visuales se guardan por usuario y no afectan a los demás miembros. Los valores aplicados a operaciones confirmadas se conservan como una instantánea histórica.

## 6. Usuarios y membresías

| Método | Endpoint | Acceso | Uso |
|---|---|---|---|
| GET | `/users` | ADMIN | Listar miembros del negocio |
| POST | `/users/invitations` | ADMIN | Invitar operador |
| POST | `/users/invitations/accept` | Público con token | Aceptar invitación |
| PATCH | `/users/{userId}/status` | ADMIN | Bloquear o reactivar usuario |

El backend valida que el usuario pertenezca al negocio de la sesión.

## 7. Catálogo y precios

| Método | Endpoint | Acceso | Uso |
|---|---|---|---|
| GET/POST | `/groups` | Autenticado | Consultar o crear grupos |
| GET/POST | `/attribute-definitions` | ADMIN | Consultar o definir atributos |
| GET/POST | `/products` | Autenticado | Consultar o crear productos |
| GET/PUT | `/products/{productId}` | Autenticado | Consultar o editar producto |
| PATCH | `/products/{productId}/status` | Autenticado | Activar o desactivar producto |
| GET/PUT | `/products/{productId}/price-rules` | ADMIN | Consultar o cambiar precios |
| GET/POST | `/charge-definitions` | ADMIN | Configurar costos adicionales |
| PUT | `/charge-definitions/{chargeId}` | ADMIN | Editar un costo adicional |

Los atributos y costos pertenecen al tenant autenticado.

## 8. Inventario y abastecimiento

| Método | Endpoint | Acceso | Uso |
|---|---|---|---|
| GET | `/inventory/stock` | Autenticado | Consultar stock |
| POST | `/inventory/receipts` | Autenticado | Registrar ingreso directo |
| POST | `/inventory/adjustments` | Autenticado | Ajustar stock con motivo |
| GET | `/inventory/movements` | Autenticado | Consultar movimientos |
| GET/POST | `/suppliers` | Autenticado | Consultar o crear proveedores |
| PATCH | `/suppliers/{supplierId}/status` | Autenticado | Activar o desactivar proveedor |
| GET/POST | `/supplies` | Autenticado | Consultar o confirmar abastecimientos |
| GET | `/supplies/{supplyId}` | Autenticado | Consultar detalle |

Los ingresos, ajustes y abastecimientos confirmados generan movimientos inmutables.

## 9. Operaciones comerciales

| Método | Endpoint | Acceso | Uso |
|---|---|---|---|
| POST | `/commercial-operations/preview` | Autenticado | Calcular una vista previa no persistente |
| GET | `/sales` | Autenticado | Consultar ventas |
| POST | `/sales` | Autenticado | Confirmar una venta |
| GET | `/sales/{saleId}` | Autenticado | Consultar detalle |
| POST | `/sales/{saleId}/cancel` | ADMIN | Cancelar y revertir una venta |

La vista previa y la confirmación de venta utilizan las mismas entradas, pero la confirmación vuelve a calcular todo con datos actuales.

Una venta confirmada exige `Idempotency-Key`. La cancelación exige otra clave de idempotencia y un motivo obligatorio.

## 10. Dashboard y reportes

| Método | Endpoint | Acceso | Uso |
|---|---|---|---|
| GET | `/dashboard/summary` | ADMIN | Indicadores y datos resumidos |
| GET | `/reports/{reportType}` | ADMIN | Reportes de ventas, inventario, productos o abastecimientos |
| GET | `/audit-events` | ADMIN | Consultar eventos de auditoría |

Los reportes aceptan períodos como `TODAY`, `LAST_7_DAYS`, `LAST_MONTH`, `ALL` y rangos explícitos.

## 11. Health checks

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/health/live` | Comprueba que el proceso esté activo |
| GET | `/health/ready` | Comprueba backend y dependencias necesarias |

## 12. Reglas de consistencia

- El negocio se obtiene de la sesión.
- Toda operación confirmada se persiste antes de responder éxito.
- Las vistas previas no persisten ni cambian stock.
- Las ventas, abastecimientos, ingresos, ajustes y cancelaciones confirmadas son transaccionales.
- El stock nunca puede ser negativo.
- Los movimientos y ventas históricas no se eliminan físicamente.
- Los precios y totales históricos no cambian al editar el catálogo.
- Los costos adicionales y descuentos se recalculan en backend.
- Los errores usan `ProblemDetails` y no revelan infraestructura.
- Un evento de tiempo real se publica después del commit y no reemplaza la persistencia.

## 13. Trazabilidad

| Requisito | API principal |
|---|---|
| US-001 a US-004 | `/auth/*` |
| US-005 y US-006 | `/users/*` |
| US-007 | `/settings` |
| US-008 a US-011 | `/groups`, `/attribute-definitions`, `/products`, `/charge-definitions` |
| US-012 a US-015 | `/inventory/*` |
| US-016 y US-017 | `/suppliers`, `/supplies` |
| US-018 a US-020 | `/commercial-operations/preview`, `/sales` |
| US-021 y US-022 | `/sales` |
| US-023 y US-024 | `/dashboard`, `/reports` |
| US-025 y US-026 | eventos, `/audit-events` |
| US-027 y US-028 | `/me/preferences`, persistencia y auditoría |

OpenAPI deberá validarse en CI y mantenerse sincronizado con el backend.
