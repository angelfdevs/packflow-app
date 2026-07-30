# Modelo de amenazas de Agilora

## Activos

- Credenciales y sesiones.
- Datos de cada negocio.
- Productos, precios, stock y ventas.
- Información de clientes introducida en descripciones.
- Configuración comercial.
- Logs, auditoría y respaldos.

## Amenazas prioritarias

- Acceso de un tenant a información de otro.
- Escalada de privilegios de operador a administrador.
- Robo o reutilización de sesiones.
- Manipulación de precios, descuentos o totales.
- Stock negativo por concurrencia.
- Duplicación de ventas por reintentos.
- Inyección, XSS, CSRF y abuso de API.
- Exposición de secretos o datos en logs.
- Indisponibilidad por saturación o fallas del proveedor.

## Controles

- Tenant obtenido de la sesión y validado en backend y base de datos.
- Autorización por membresía y rol.
- Access token en memoria y refresh token rotativo en cookie segura.
- CSRF, CORS restrictivo, rate limiting y límites de entrada.
- Recalculo de valores en backend.
- Transacciones, locks o control de concurrencia e idempotencia.
- Auditoría inmutable y outbox después del commit.
- Secretos fuera del repositorio.
- Backups, PITR, health checks, monitoreo y rollback.
- Pruebas de seguridad en CI y antes de producción.

## Alcance

Estos controles reducen riesgos, pero no garantizan riesgo cero. La revisión de seguridad deberá repetirse antes de cada release relevante y ante cambios en autenticación, roles, pagos, archivos, integraciones o datos personales.
