# Agilora

Agilora es una plataforma SaaS para microempresas y pequeñas empresas que necesitan organizar sus productos, controlar inventario y registrar sus operaciones comerciales desde un solo lugar.

La plataforma no impone una estructura exclusiva para un tipo de negocio. Cada negocio puede crear sus grupos, atributos, productos, precios y costos adicionales según su forma de trabajo.

## Product Goal

Ayudar a los negocios pequeños a dejar de depender de registros dispersos y contar con información operativa clara, segura y disponible para las personas autorizadas del negocio.

## Problema

Muchos negocios todavía consultan existencias en almacenes, anotan ingresos y ventas manualmente y calculan precios con hojas de cálculo o papel. Esto provoca pérdida de tiempo, errores, duplicidad de trabajo y poca visibilidad sobre lo que realmente ocurre en el negocio.

## Hipótesis

Creemos que permitir a los negocios administrar productos, inventario y operaciones desde una plataforma centralizada reducirá el tiempo empleado en consultas y registros manuales.

Validaremos esta hipótesis observando el tiempo necesario para consultar stock, preparar una operación y registrar una venta, además de los errores reportados por los usuarios durante la prueba con negocios reales.

## Módulos principales

- **Dashboard:** indicadores y gráficos resumidos para administradores.
- **Usuarios:** invitación, bloqueo y reactivación de operadores.
- **Catálogo:** grupos, atributos, productos y activación o desactivación.
- **Precios y costos:** reglas por cantidad y cargos adicionales configurables.
- **Inventario:** stock, ingresos, ajustes y movimientos históricos.
- **Abastecimientos:** proveedores opcionales y entradas de mercadería.
- **Operaciones:** vista previa de una operación y confirmación de venta en el mismo flujo.
- **Reportes:** ventas, inventario, productos y abastecimientos.
- **Configuración:** datos del negocio, IGV y reglas comerciales; cada usuario también puede guardar sus preferencias visuales.

## Roles

- **Administrador:** realiza todas las operaciones y administra usuarios, configuración, dashboard y reportes.
- **Operador:** realiza las tareas operativas autorizadas, pero no gestiona funciones administrativas.

## Reglas importantes

- Cada negocio está aislado de los demás.
- Una operación admite como máximo 20 productos diferentes.
- El stock nunca puede ser negativo.
- Las cotizaciones preliminares no se guardan ni modifican stock.
- Las ventas, abastecimientos, ajustes y cancelaciones confirmadas sí se persisten.
- Toda venta confirmada actualiza el inventario dentro de una transacción.
- Una venta cancelada conserva su historial y registra una reversión de stock.
- El backend recalcula precios, descuentos, costos adicionales, IGV y totales.
- Las operaciones confirmadas utilizan idempotencia y auditoría.

## Tecnologías

- Vue 3, JavaScript moderno, Vite, Pinia y Vue Router.
- ASP.NET Core 10, .NET 10 LTS, C# 14 y Entity Framework Core 10.
- PostgreSQL administrado.
- Docker.
- OpenAPI/Swagger.
- SignalR para actualizaciones en tiempo real cuando el despliegue lo habilite.

## Arquitectura

Agilora utilizará un monolito modular con DDD, Clean Architecture, Layered Architecture, Ports and Adapters y CQRS lógico.

Bounded contexts principales:

```text
Identity & Access
Tenant & Business
Catalog & Pricing
Inventory & Supply
Commercial Operations
Reporting
Dashboard
Shared
```

## Documentación

- [Requisitos funcionales](./docs/requirements/functional-requirements.md)
- [Requisitos no funcionales](./docs/requirements/non-functional-requirements.md)
- [Contexto del producto](./docs/project-context.md)
- [User flows](./docs/user-flows.md)
- [Goal flows](./docs/goal-flows.md)
- [Arquitectura](./docs/architecture/architecture.md)
- [Contrato API](./docs/api/api.md)
- [OpenAPI](./docs/api/openapi.yaml)
- [Despliegue](./docs/deployment/deployment.md)
- [Matriz de trazabilidad](./docs/traceability.md)
- [Modelo de amenazas](./docs/security/threat-model.md)
- [Aspectos técnico-legales](./docs/legal/README.md)
- [Proceso Agile](./docs/agile/product-backlog.md)

## Fuera del alcance inicial

- Facturación electrónica e integración con SUNAT.
- Pagos en línea y pasarelas de pago.
- Contabilidad completa.
- Predicción de demanda.
- Integraciones con tiendas virtuales.
- MFA, mientras no se priorice para un release posterior.
- Registro público de negocios; el primer release utilizará provisionamiento controlado.
