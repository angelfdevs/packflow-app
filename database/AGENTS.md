# Instrucciones de la base de datos de Agilora

- Utilizar PostgreSQL mediante migraciones versionadas de Entity Framework Core.
- Mantener claves primarias, claves foráneas, constraints, índices y aislamiento por tenant.
- No modificar el esquema manualmente sin una migración reproducible.
- Evitar referencias cruzadas entre negocios mediante claves foráneas y validaciones de aplicación.
- Mantener movimientos de inventario, ventas confirmadas, cancelaciones y auditoría como historial inmutable.
- Proteger contraseñas y tokens mediante hashes; nunca persistir secretos en texto plano.
- Probar stock no negativo, idempotencia, concurrencia, rollback y referencias inválidas entre tenants.
- Utilizar datos ficticios en desarrollo, QA y staging.
