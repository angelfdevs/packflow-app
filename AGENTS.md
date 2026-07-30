# Instrucciones de trabajo para Agilora

## Propósito del repositorio

Agilora es un SaaS multiempresa para microempresas y pequeñas empresas. El sistema administra productos configurables, inventario, abastecimientos, operaciones comerciales, usuarios, reportes y configuración del negocio.

## Fuente de verdad

Antes de modificar código o documentación, revisar los archivos relacionados en este orden:

1. `docs/project-context.md`.
2. `docs/requirements/functional-requirements.md` y `docs/requirements/non-functional-requirements.md`.
3. `docs/user-flows.md` y `docs/goal-flows.md`.
4. `docs/architecture/architecture.md`.
5. `docs/api/openapi.yaml` y `docs/api/api.md`.
6. `docs/diagrams/diagrama-erd-agilora.puml` y los códigos C4.
7. `docs/deployment/deployment.md` y `docs/security/threat-model.md`.

Si existe una contradicción entre estos archivos, detenerse, explicarla y no inventar una solución sin autorización.

## Reglas de negocio no negociables

- Cada negocio es un tenant independiente.
- El negocio de una operación se obtiene de la sesión autenticada; el frontend nunca puede elegir libremente el tenant.
- Existen dos roles: `ADMIN` y `OPERATOR`.
- `ADMIN` puede administrar usuarios, configuración, dashboard, reportes y operaciones.
- `OPERATOR` puede realizar las operaciones autorizadas, pero no administrar usuarios, configuración, dashboard ni reportes administrativos.
- El administrador también puede realizar todas las tareas operativas.
- El stock nunca puede ser negativo.
- Las operaciones confirmadas deben persistirse antes de devolver una respuesta exitosa.
- Una venta confirmada, un abastecimiento confirmado o un ajuste confirmado deben ejecutarse dentro de una transacción y registrar movimientos de inventario cuando corresponda.
- Las cotizaciones preliminares son simulaciones y no se guardan ni modifican stock.
- Una venta cancelada conserva su historial, exige un motivo y genera una reversión de inventario cuando corresponde.
- Los movimientos de inventario y la auditoría son inmutables.
- El backend es la autoridad final para precios, cantidades, costos adicionales, descuentos, IGV, stock y totales.
- Las operaciones persistentes deben usar idempotencia y control de concurrencia.
- No se deben guardar contraseñas, tokens ni secretos en texto plano.
- No se deben incluir datos reales de negocios en fixtures, documentación pública, logs ni demostraciones.

## Arquitectura

- Mantener un monolito modular con DDD, Clean Architecture, Layered Architecture, Ports and Adapters y CQRS lógico.
- Mantener bounded contexts claros: Identity & Access, Tenant & Business, Catalog & Pricing, Inventory & Supply, Commercial Operations, Reporting, Dashboard y Shared.
- `Shared` es transversal y no contiene reglas específicas de negocio.
- Las dependencias deben apuntar hacia las capas internas y los contratos.
- No crear microservicios sin una decisión arquitectónica documentada.

## Seguridad

- Validar autenticación, tenant y autorización en el backend.
- Aplicar protección contra IDOR, inyección, XSS, CSRF, fuerza bruta, abuso de API, repetición de solicitudes y concurrencia insegura.
- Usar consultas parametrizadas, límites de entrada, rate limiting, cookies seguras, CORS restrictivo y logs sin datos sensibles.
- No utilizar secretos en el repositorio ni en variables públicas del frontend.
- Si una modificación afecta privacidad, auditoría, sesiones, roles o datos sensibles, actualizar también la documentación de seguridad y privacidad.

## Flujo obligatorio de cambios

1. Revisar los archivos existentes y el alcance de la solicitud.
2. Identificar requisitos, bounded contexts, endpoints, tablas y pruebas afectadas.
3. Proponer un plan breve antes de cambios amplios.
4. Implementar el cambio mínimo y coherente.
5. Actualizar la documentación relacionada en el mismo cambio.
6. Ejecutar las pruebas, lint, build y validaciones aplicables.
7. Revisar el diff y buscar contradicciones o referencias antiguas.
8. Informar archivos modificados, comandos ejecutados, resultados, riesgos y trabajo pendiente.

## Verificación mínima

- Frontend: lint, pruebas unitarias, pruebas de componentes, build y E2E cuando estén disponibles.
- Backend: restore, build, pruebas unitarias, integración, formato y análisis de vulnerabilidades.
- Base de datos: migraciones, constraints, claves foráneas, índices, aislamiento por tenant y pruebas de concurrencia.
- API: lint OpenAPI, ejemplos, códigos HTTP, autorización e idempotencia.
- Documentación: enlaces, trazabilidad requisito-endpoint-tabla-prueba y consistencia con los diagramas.

Si un comando no puede ejecutarse, informar la causa exacta; no afirmar que la verificación fue realizada.

## Alcance de las acciones

- No ejecutar `git commit`, `git push`, despliegues ni acciones destructivas sin autorización explícita.
- No modificar requisitos, arquitectura o reglas de negocio silenciosamente.
- No exponer secretos, tokens, contraseñas ni información personal.
