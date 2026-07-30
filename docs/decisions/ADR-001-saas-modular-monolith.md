# ADR-001 — Monolito modular para el SaaS inicial

## Estado

Aceptada.

## Decisión

Agilora utilizará un monolito modular con DDD, Clean Architecture, capas, Ports and Adapters y CQRS lógico.

## Motivo

Permite aislamiento de dominios, transacciones consistentes y una operación sencilla para los primeros negocios. La separación futura de módulos en servicios independientes se evaluará únicamente con métricas de tráfico, disponibilidad o carga operativa.

## Consecuencia

La aplicación debe preservar límites entre bounded contexts y no compartir tablas o reglas sin contratos explícitos.
