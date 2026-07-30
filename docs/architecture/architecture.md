# Arquitectura de Agilora

## 1. Propósito

Agilora será un SaaS multiempresa para administrar productos configurables, inventario, abastecimientos y operaciones comerciales. La arquitectura debe mantener aislados los datos de cada negocio, permitir varios usuarios por negocio y conservar consistencia cuando dos personas trabajan al mismo tiempo.

## 2. Decisión principal

Agilora utilizará un monolito modular seguro. No se dividirá inicialmente en microservicios.

La solución combinará:

- Domain-Driven Design.
- Bounded Contexts.
- Clean Architecture.
- Layered Architecture.
- Ports and Adapters.
- CQRS lógico.
- API REST con OpenAPI.
- Docker.
- DevSecOps.
- Eventos internos y Outbox para notificaciones posteriores al commit.

Esta decisión mantiene bajo el costo y la complejidad operativa inicial, pero deja límites claros para separar módulos si las métricas lo justifican.

## 3. Tecnologías objetivo

- Vue 3, JavaScript moderno, Vite, Pinia, Vue Router y CoreUI.
- ASP.NET Core 10, .NET 10 LTS, C# 14 y Entity Framework Core 10.
- PostgreSQL 18.x administrado, utilizando la revisión menor soportada por el proveedor.
- Docker.
- SignalR para avisos de cambios relevantes entre usuarios conectados.
- OpenAPI 3.1.

Las versiones deberán mantenerse dentro de las versiones soportadas por los proveedores y actualizarse mediante una decisión documentada.

## 4. Bounded contexts

### 4.1 Identity & Access

Gestiona usuarios, credenciales, sesiones, recuperación de contraseña, invitaciones, roles, estados de membresía y preferencias visuales personales.

Roles iniciales:

- `ADMIN`: acceso administrativo y operativo.
- `OPERATOR`: acceso a las operaciones autorizadas del negocio.

La autorización se verifica en el backend mediante la membresía del usuario en el tenant.

### 4.2 Tenant & Business

Representa el negocio, su estado y configuración general. El tenant se obtiene desde la sesión autenticada y no desde un identificador confiado del cliente.

### 4.3 Catalog & Pricing

Gestiona grupos, atributos personalizados, productos, activación y reglas de precio por cantidad.

No se impondrán campos exclusivos para empaques. Un negocio puede crear atributos como material, medida, peso, color, marca o cualquier otro dato soportado por los tipos definidos.

### 4.4 Inventory & Supply

Gestiona stock, ingresos, abastecimientos, proveedores, ajustes, movimientos, pérdidas, daños y correcciones.

La venta confirmada, el abastecimiento confirmado, el ingreso, el ajuste y la cancelación de venta generan movimientos inmutables.

### 4.5 Commercial Operations

Gestiona una operación comercial común para cotizar y vender.

El backend ofrece una vista previa no persistente. Si el usuario confirma la venta, el backend recalcula los importes, guarda la venta y actualiza el inventario dentro de una transacción.

Los costos adicionales se suman al subtotal y el descuento se aplica antes del IGV. El resultado muestra un único subtotal, el descuento aplicado, el IGV y el total.

### 4.6 Reporting

Construye reportes de ventas, inventario, productos y abastecimientos utilizando consultas de lectura. Los reportes iniciales no reemplazan la contabilidad ni la facturación electrónica.

### 4.7 Dashboard

Compone indicadores, gráficos y accesos rápidos para administradores. No contiene reglas transaccionales propias y consulta información de los contextos correspondientes.

### 4.8 Shared

Es un módulo transversal, no un bounded context de negocio. Contiene identificadores, errores, paginación, reloj, resultados, contratos técnicos, validaciones comunes y eventos base. No debe contener reglas específicas de productos, inventario o ventas.

## 5. Backend

Cada bounded context del backend respetará:

```text
Interfaces
    ↓
Application
    ↓
Domain

Infrastructure implementa los contratos de las capas internas
```

### Interfaces

Contiene endpoints REST, autenticación de transporte, autorización, middlewares, health checks, manejo de errores y OpenAPI.

### Application

Contiene comandos, consultas, DTOs, validaciones de aplicación, autorización de casos de uso, idempotencia y orquestación de transacciones.

### Domain

Contiene entidades, agregados, objetos de valor, servicios de dominio y reglas de precios, cargos adicionales, descuentos, IGV, inventario y ventas.

### Infrastructure

Contiene EF Core, PostgreSQL, repositorios, migraciones, proveedor de correo, persistencia de sesiones, outbox, logs e integraciones externas.

## 6. Frontend

Cada bounded context del frontend respetará:

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

El frontend contiene la experiencia de uso y validaciones anticipadas, pero no es la autoridad final. No debe guardar tokens ni datos sensibles en el almacenamiento del navegador.

Los formularios de operación pueden conservarse temporalmente en memoria si la sesión expira. Al cerrar sesión voluntariamente deben limpiarse.

## 7. Persistencia y consistencia

PostgreSQL es la fuente de verdad para los datos del negocio.

Una operación confirmada sigue este flujo:

```text
Validar sesión, tenant y rol
    ↓
Validar comando e idempotencia
    ↓
Obtener datos actuales
    ↓
Recalcular reglas de negocio
    ↓
Ejecutar transacción PostgreSQL
    ↓
Guardar datos, movimientos y auditoría
    ↓
Confirmar commit
    ↓
Publicar evento Outbox o notificación
    ↓
Responder éxito
```

Si falla cualquier paso antes del commit, la operación no debe mostrarse como confirmada.

Los eventos de Outbox y SignalR son mecanismos de notificación. No reemplazan la persistencia ni deben decidir si una venta fue confirmada.

## 8. Actualización entre usuarios

Cuando un usuario confirma una operación, el backend guardará primero los datos. Después del commit podrá publicar un evento para que otros clientes actualicen sus vistas mediante SignalR.

Si el canal de tiempo real falla, el dato permanece persistido y el frontend debe reconciliarse mediante una consulta posterior.

En un solo backend se puede utilizar la conexión directa. Con varias instancias se necesitará un backplane o servicio distribuido compatible con SignalR.

## 9. Seguridad

La seguridad se aplicará mediante defensa en profundidad:

- HTTPS, HSTS y encabezados de seguridad.
- CORS limitado al origen configurado.
- Cookies `HttpOnly`, `Secure` y `SameSite` apropiadas.
- CSRF para operaciones que utilicen cookies.
- Access tokens únicamente en memoria.
- Refresh tokens rotativos y revocables.
- Expiración por inactividad de 15 minutos sin expiración absoluta.
- Autorización por tenant y rol en cada endpoint.
- Rate limiting por IP, usuario y negocio cuando corresponda.
- Límites de tamaño, paginación y cantidad de líneas.
- Consultas parametrizadas.
- Validación de archivos si se agregan cargas en el futuro.
- Protección contra IDOR, inyección, XSS, CSRF, fuerza bruta, abuso de API y repetición de solicitudes.
- Idempotencia y control de concurrencia.
- Logs sin secretos ni datos innecesarios.
- Escaneo de dependencias, imágenes y código en CI.
- Auditoría y modelo de amenazas documentados.

Ninguna arquitectura garantiza riesgo cero. Los controles se deben probar y revisar antes de cada release relevante.

## 10. Despliegue

### Perfil inicial

- Frontend estático en Cloudflare Pages.
- Una instancia stateless del backend en Render o proveedor equivalente.
- PostgreSQL administrado.
- Backups, health checks, monitoreo y migraciones controladas.
- SignalR directo sin backplane mientras exista una sola instancia.

Este perfil permite varios negocios y usuarios, pero no ofrece redundancia completa ni una garantía formal de 99.9 %.

### Perfil objetivo

- CDN, WAF y protección DDoS.
- Dos o más instancias stateless del backend.
- PostgreSQL administrado con alta disponibilidad y PITR, si el proveedor lo ofrece.
- Almacén distribuido para rate limiting y backplane de SignalR.
- Monitoreo externo, alertas, rollback y restauración probada.

El objetivo de disponibilidad de 99.9 % solo se considerará operativo cuando este perfil esté contratado, configurado y medido.

## 11. Proceso de entrega

```text
Development
    ↓
CI
    ↓
QA
    ↓
Staging
    ↓
UAT con el cliente
    ↓
Production
```

Cada incremento debe cumplir la Definition of Done, tener trazabilidad y pasar pruebas funcionales, técnicas y de seguridad proporcionales al riesgo.

## 12. Decisiones que no se implementarán todavía

- Microservicios.
- Pagos en línea.
- Facturación electrónica.
- MFA.
- Predicción de demanda.
- Integraciones con tiendas virtuales.
- Contabilidad completa.

Estas decisiones pueden revisarse con evidencia de uso, métricas y necesidades reales.
