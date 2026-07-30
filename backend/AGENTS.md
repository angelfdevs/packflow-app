# Instrucciones del backend de Agilora

- Utilizar ASP.NET Core 10, C# 14, Entity Framework Core 10 y PostgreSQL.
- Respetar las capas `interfaces`, `application`, `domain` e `infrastructure`.
- Validar en cada solicitud autenticación, membresía al negocio, rol y autorización de la operación.
- Obtener el tenant desde la sesión; nunca confiar en un identificador enviado por el cliente.
- Mantener las reglas de negocio en Domain/Application y no en controllers.
- Ejecutar ventas, abastecimientos, ajustes y demás comandos persistentes mediante transacciones.
- Usar `Idempotency-Key`, `If-Match` y ETags cuando corresponda.
- Registrar auditoría sin contraseñas, tokens, secretos ni datos innecesarios.
- Devolver errores con `ProblemDetails` sin stack traces ni detalles de infraestructura.
- Ejecutar pruebas unitarias, integración, seguridad, build y formato antes de entregar cambios.
