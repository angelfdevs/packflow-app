# Instrucciones de documentación de Agilora

- Mantener sincronizados requisitos, flujos, arquitectura, API, ERD, C4, seguridad y despliegue.
- Actualizar primero la fuente funcional y luego los artefactos derivados.
- `docs/api/openapi.yaml` es la fuente principal del contrato HTTP.
- `diagrams/diagrama-erd-agilora.puml` es la fuente del ERD; los SVG son artefactos generados.
- Los códigos C4 deben representar la arquitectura vigente y conservar la sintaxis de Structurizr DSL.
- Toda decisión que cambie alcance, datos, seguridad o arquitectura debe registrarse en `docs/decisions/`.
- No documentar como implementada una funcionalidad que solo esté planificada.
