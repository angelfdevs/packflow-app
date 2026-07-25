# Arquitectura de PackFlow

## 1. Propósito

PackFlow será una aplicación web para que una microempresa o pequeña empresa dedicada a la venta y distribución de empaques pueda administrar sus productos, consultar y ajustar su inventario, simular cotizaciones y registrar ventas.

La arquitectura busca mantener el dominio protegido de detalles tecnológicos, facilitar las pruebas, permitir la evolución del sistema y aplicar controles de seguridad desde el diseño.

## 2. Decisiones arquitectónicas

PackFlow empleará una arquitectura de monolito modular seguro, organizada mediante:

- Domain-Driven Design (DDD).
- Clean Architecture.
- Layered Architecture.
- Bounded Contexts.
- Ports and Adapters.
- CQRS lógico.
- API REST.
- Docker.
- DevSecOps.

Versiones objetivo de la plataforma:

- Vue.js 3.
- JavaScript moderno compatible con ES2023 o superior.
- .NET 10 LTS.
- ASP.NET Core 10.
- C# 14.
- Entity Framework Core 10.
- PostgreSQL 18.x administrado, manteniendo la última versión menor soportada por el proveedor.
- Docker con imágenes base oficiales y actualizadas.

No se implementarán microservicios inicialmente. Los módulos se ejecutarán dentro de un único backend desplegable, con límites claros entre dominios. Esto reduce la complejidad operativa y conserva la posibilidad de separar módulos en el futuro si el crecimiento lo justifica.

## 3. Principios de diseño

1. Las reglas del negocio estarán centralizadas en el dominio.
2. Las capas internas no dependerán de frameworks, bases de datos ni proveedores de nube.
3. Cada bounded context tendrá responsabilidades claras.
4. Las cotizaciones no se persistirán porque son simulaciones temporales.
5. Las ventas se persistirán y modificarán el stock dentro de una transacción.
6. El stock nunca podrá ser negativo.
7. Las operaciones importantes serán auditables.
8. La seguridad se aplicará mediante defensa en profundidad.
9. Las consultas y comandos tendrán responsabilidades separadas, aunque inicialmente compartan la misma aplicación y base de datos.
10. La infraestructura podrá cambiar sin modificar las reglas principales del negocio.

## 4. Bounded Contexts

### 4.1 Identity & Account

Responsable de:

- Inicio y cierre de sesión.
- Cuenta administradora del negocio.
- Contraseñas y recuperación de contraseña.
- Sesiones activas y revocación de sesiones.
- Datos de la cuenta y del negocio.

La primera versión operativa manejará una cuenta administradora dueña de un único negocio. No se implementarán múltiples usuarios ni roles avanzados mientras no exista una necesidad real del negocio.

No existirá un registro público de cuentas. Las cuentas serán provisionadas mediante un comando administrativo o job controlado que creará la cuenta, configuración, verificará o sembrará los tipos de precio globales y creará los rangos iniciales de serigrafía. Las credenciales se recibirán mediante un gestor de secretos o entrada segura y nunca se almacenarán en el repositorio.

### 4.2 Catalog

Responsable de:

- Categorías de productos.
- Materiales.
- Productos.
- Medidas y atributos del empaque.
- Activación y desactivación de productos.
- Precios minoristas y mayoristas.

El precio minorista se aplicará de 1 a 100 unidades. El precio mayorista se aplicará desde 101 unidades.

Los productos no se eliminarán físicamente cuando tengan historial. Se desactivarán mediante borrado lógico para conservar la trazabilidad de ventas y movimientos.

### 4.3 Inventory

Responsable de:

- Consulta de stock.
- Ingreso de mercadería.
- Ajustes por pérdida, daño o corrección.
- Descuento de stock por ventas.
- Historial de movimientos.
- Validación de stock no negativo.
- Clasificación de bajo stock cuando el stock actual es menor o igual a 15 unidades.

La disminución de stock por venta y el registro de la venta deberán ejecutarse dentro de una transacción. Se utilizarán controles de concurrencia e idempotencia para evitar descuentos duplicados.

### 4.4 Commercial Operations

Responsable de:

- Cálculo de cotizaciones.
- Registro de ventas.
- Aplicación del precio minorista o mayorista.
- Descuentos porcentuales o fijos.
- Cálculo del IGV.
- Aplicación opcional de serigrafía.

Las cotizaciones serán operaciones temporales y no modificarán el stock. Las ventas serán operaciones persistentes y actualizarán el inventario.

La serigrafía se podrá activar desde 20 unidades. El cobro se calculará por lotes de 100 unidades, incluyendo el lote parcial, según estos rangos:

| Cantidad del pedido | Costo por color y lote |
|---|---:|
| 20 a 300 unidades | S/45 |
| 301 a 500 unidades | S/40 |
| 501 unidades a más | S/30 |

El costo de serigrafía se multiplicará por la cantidad de colores y por la cantidad de lotes de 100 unidades, redondeando hacia arriba. El descuento se aplicará antes del IGV. Las cotizaciones y ventas expondrán un único subtotal, calculado después del descuento cuando este exista, además del IGV y el total. El descuento mostrará su tipo, valor y monto aplicado.

Una operación podrá contener como máximo 20 productos diferentes. Cada línea podrá contener hasta 1 000 000 unidades y hasta 10 colores de serigrafía. Cada dimensión del producto será mayor que cero y no superará 1 000 cm.

## 5. Módulo Shared

`Shared` no será un bounded context independiente. Será un módulo transversal para elementos reutilizables y conceptos compartidos, por ejemplo:

- Identificadores.
- Resultados y errores de aplicación.
- Fechas y reloj del sistema.
- Paginación.
- Validaciones comunes.
- Auditoría técnica.
- Excepciones base.
- Contratos de eventos internos.

`Shared` no debe contener reglas específicas de productos, inventario o ventas. Las reglas de cada negocio deben permanecer en su bounded context correspondiente.

## 6. Arquitectura del backend

El backend se desarrollará con ASP.NET Core y C# mediante las siguientes capas:

```text
Interfaces
    ↓
Application
    ↓
Domain

Infrastructure → implementa contratos definidos por Application y Domain
```

### 6.1 Interfaces

Contendrá los puntos de entrada y salida de la aplicación:

- Controllers o endpoints REST.
- Middlewares.
- Configuración de autenticación y autorización.
- Filtros y manejo global de excepciones.
- Health checks.
- Serialización de respuestas.
- Documentación OpenAPI.

Esta capa recibirá las solicitudes HTTP, validará aspectos de transporte y delegará la operación a Application.

### 6.2 Application

Contendrá los casos de uso de PackFlow:

- Comandos para crear productos, ingresar stock, registrar ventas y ajustar inventario.
- Consultas para buscar productos, consultar stock y obtener ventas.
- DTOs y contratos de entrada y salida.
- Validaciones de aplicación.
- Orquestación de transacciones.
- Idempotencia.
- Interfaces de repositorios y servicios externos.

La capa Application no contendrá lógica específica de HTTP ni consultas SQL directas.

### 6.3 Domain

Contendrá el modelo y las reglas centrales del negocio:

- Entidades.
- Agregados y raíces de agregado.
- Objetos de valor.
- Servicios de dominio.
- Eventos de dominio.
- Reglas de precios.
- Reglas de serigrafía.
- Reglas de descuentos.
- Reglas de stock.
- Reglas de IGV.

Esta capa no dependerá de ASP.NET Core, Entity Framework Core, PostgreSQL ni Render.

### 6.4 Infrastructure

Contendrá las implementaciones técnicas:

- Entity Framework Core.
- PostgreSQL.
- Repositorios.
- Unidad de trabajo.
- Migraciones.
- Proveedor de correo para recuperación de contraseña.
- Persistencia de sesiones y tokens.
- Registro estructurado.
- Integraciones con servicios de nube.

Infrastructure dependerá de contratos definidos por las capas internas, no al contrario.

## 7. CQRS

Se utilizará CQRS lógico:

- Los comandos modificarán el estado y ejecutarán reglas de negocio.
- Las consultas devolverán información para pantallas y reportes.
- Las consultas podrán utilizar modelos de lectura optimizados.
- No se crearán microservicios ni bases de datos separadas solo por utilizar CQRS.

Los casos de uso estarán separados aunque inicialmente se ejecuten en el mismo backend y sobre PostgreSQL.

## 8. Arquitectura del frontend

El frontend se desarrollará con Vue.js y JavaScript mediante las siguientes capas:

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

### 8.1 Presentation

Contendrá:

- Vistas y componentes Vue.
- Formularios.
- Tablas.
- Navegación.
- Estados visuales.
- Mensajes de validación.
- Tema claro y oscuro.

### 8.2 Application

Contendrá:

- Casos de uso del frontend.
- Manejo del estado de la aplicación.
- Orquestación de formularios.
- Adaptación de respuestas del backend.
- Control de permisos de navegación.

### 8.3 Domain

Contendrá:

- Modelos del frontend.
- Objetos de valor necesarios para la interfaz.
- Reglas de presentación que no sustituyan las validaciones del backend.
- Cálculos visuales de cotización para mejorar la experiencia.

El backend siempre será la autoridad final para las reglas de negocio.

### 8.4 Infrastructure

Contendrá:

- Cliente HTTP.
- Interceptores.
- Manejo de cookies y sesión.
- Adaptadores para la API REST.
- Configuración de entorno.
- Persistencia local únicamente para preferencias no sensibles, como el tema visual.

No se almacenarán contraseñas, tokens sensibles ni información crítica en `localStorage`.

Los datos temporales de una cotización o venta en progreso podrán conservarse en memoria durante una reautenticación, pero no se persistirán credenciales, tokens ni secretos en el almacenamiento del navegador.

## 9. Seguridad

La seguridad se implementará mediante defensa en profundidad:

- HTTPS obligatorio.
- HSTS y encabezados de seguridad.
- CORS restrictivo por origen permitido.
- Protección CSRF/antiforgery cuando se utilicen cookies.
- Cookie `pf_refresh` con `HttpOnly`, `Secure`, `SameSite=None` y `Path=/api/v1/auth`.
- Cookie antiforgery `XSRF-TOKEN` con `Secure`, `SameSite=None` y `Path=/api/v1/auth`.
- Encabezado `X-CSRF-TOKEN` obligatorio en operaciones autenticadas mediante cookies.
- Cuando el frontend y el backend estén en orígenes distintos, el frontend obtendrá el token CSRF mediante `GET /api/v1/auth/csrf` y lo conservará únicamente en memoria. El inicio de sesión y la renovación también devolverán el valor no sensible cuando emitan o roten `XSRF-TOKEN`; la cookie de refresh nunca será accesible desde JavaScript.
- Access tokens únicamente en memoria del frontend.
- Access tokens con duración objetivo de 15 minutos y almacenados únicamente en memoria del frontend.
- Refresh tokens rotativos con expiración por inactividad de 15 minutos, sin expiración absoluta y revocables por el backend.
- La expiración por inactividad se validará en el backend utilizando la última actividad registrada en `sessions.last_seen_at`; el contador del frontend solo tendrá fines informativos.
- Para efectos del contador del servidor, se considerará interacción una solicitud autenticada procesada por el backend, como consultar información o guardar una operación. Los eventos locales del navegador, como escribir en un formulario o mover el cursor sin realizar una solicitud, no reiniciarán el contador; no se implementará un heartbeat automático.
- La reutilización de un refresh token ya rotado se considera un evento de seguridad y revoca la familia de tokens de la sesión.
- Cada refresh token estará asociado a una sesión mediante `session_id`, que identificará la familia de tokens. El backend validará la sesión y el hash del token; el `session_id` no será el secreto.
- Cada refresh token emitido se conservará en `session_refresh_tokens` mediante un hash único, con sus fechas de emisión, uso, revocación y eventual reemplazo. La rotación se ejecutará en una transacción; la reutilización de un token usado revocará toda la familia.
- Hash de contraseñas mediante `PasswordHasher` de ASP.NET Core Identity, sin implementar criptografía propia.
- Recuperación de contraseña mediante token de un solo uso con duración de 30 minutos.
- Sesión con expiración por inactividad de 15 minutos y sin expiración absoluta. Mientras exista actividad, podrá renovarse de forma transparente; no habrá un botón “Mantener sesión activa” ni un heartbeat automático. También podrá revocarse por cierre de sesión, bloqueo de cuenta, cambio o recuperación de contraseña, detección de seguridad o indisponibilidad del proveedor.
- Rotación y revocación de sesiones.
- Rate limiting para autenticación y endpoints sensibles.
- Rate limiting particionado por cuenta e IP, con límites distribuidos o aplicados en el perímetro cuando existan varias instancias.
- Validación de entrada y límites de tamaño.
- Consultas parametrizadas mediante Entity Framework Core.
- Separación de secretos mediante variables de entorno.
- Base de datos no expuesta públicamente cuando el proveedor lo permita.
- Principio de mínimo privilegio.
- Registro de eventos relevantes sin almacenar contraseñas, tokens ni datos sensibles.
- Escaneo de dependencias y vulnerabilidades en CI/CD.
- Análisis estático y pruebas de seguridad.
- Health checks y alertas.
- Protección CDN/DDoS en el perímetro mediante Cloudflare.

Estas medidas reducen el riesgo frente a ataques como inyección SQL, XSS, CSRF, fuerza bruta, abuso de API, robo de sesión, exposición de secretos, manipulación de precios y modificación inconsistente del stock. Ninguna arquitectura puede garantizar riesgo cero.

## 10. Persistencia y consistencia

### 10.1 Aislamiento de datos por negocio

PackFlow aplicará aislamiento multiempresa mediante `business_account_id`. El
backend determinará el negocio a partir de la sesión autenticada y no confiará
en un identificador de negocio enviado por el frontend.

Las migraciones de PostgreSQL reforzarán este aislamiento mediante restricciones
`UNIQUE` y claves foráneas compuestas. Cuando una relación incluya
`business_account_id`, la combinación de columnas referenciada deberá tener una
clave primaria o una restricción `UNIQUE` compatible. Esto impedirá referencias
cruzadas entre productos, ventas, movimientos, solicitudes idempotentes y otros
registros pertenecientes a diferentes negocios.

El aislamiento se validará tanto en la capa de aplicación como en PostgreSQL;
ninguna de las dos capas será considerada suficiente por sí sola.

PostgreSQL será la base de datos principal. Se aplicarán:

- Claves primarias y foráneas.
- Restricciones `UNIQUE`.
- Restricciones `CHECK`.
- Integridad referencial.
- Borrado lógico de productos.
- Índices para búsquedas frecuentes.
- Migraciones versionadas.
- Transacciones para ventas y movimientos de inventario.
- Control de concurrencia.
- Versionado entero de recursos mutables para generar ETags deterministas.
- Registro de movimientos de stock.
- Claves de idempotencia para evitar operaciones duplicadas.
- Historial de refresh tokens para detectar reutilización después de la rotación.
- Row-Level Security para reforzar el aislamiento por `business_account_id`.
- Foreign keys compuestas para impedir referencias entre negocios.

Cada clave foránea compuesta que incluya `business_account_id` deberá apuntar a una clave primaria o restricción `UNIQUE` compatible en la tabla referenciada. Las migraciones de Entity Framework Core deberán crear esas restricciones antes de crear las claves foráneas y probar referencias válidas e inválidas entre negocios.

Como mínimo, las migraciones deberán implementar:

- Índices únicos funcionales sobre `(business_account_id, lower(btrim(category_name)))`, `(business_account_id, lower(btrim(material_name)))` y `lower(btrim(admin_email))` para evitar duplicados por espacios o mayúsculas.
- `UNIQUE (business_account_id, idempotency_key)` en solicitudes idempotentes.
- `UNIQUE (business_account_id, minimum_quantity)` y el siguiente `CHECK` para mantener fijos los rangos de serigrafía:

```sql
CHECK (
    (minimum_quantity = 20 AND maximum_quantity = 300)
    OR
    (minimum_quantity = 301 AND maximum_quantity = 500)
    OR
    (minimum_quantity = 501 AND maximum_quantity IS NULL)
)
```

Las tarifas por color pueden modificarse; los límites de cantidad no.
- Índice único parcial basado en `lower(btrim(product_name))` para impedir dos productos activos con la misma combinación de negocio, categoría, material, nombre y medidas. Los precios no forman parte de esta identidad.
- `UNIQUE (type_code)` en `price_types`, que será un catálogo global de referencia; los precios de cada negocio se almacenarán en `product_prices`.
- Claves foráneas compuestas para que una categoría, material, venta, movimiento o solicitud idempotente solo pueda asociarse a registros del mismo negocio.
- Clave foránea compuesta desde `sale_items (product_id, price_type_id)` hacia `product_prices (product_id, price_type_id)`.
- `CHECK (current_stock >= 0)`, `CHECK (quantity > 0)` y `CHECK (price_amount >= 0)`.
- Restricciones para tipos de descuento, estados de venta, lotes y tarifas de serigrafía, y para impedir movimientos con `quantity_delta = 0`.
- Validaciones de dimensiones, tarifas y colores conforme a los límites definidos en los requisitos y el contrato OpenAPI.

La venta se considerará confirmada únicamente cuando se hayan guardado la operación y su movimiento de inventario dentro de la misma transacción.

## 11. Despliegue e infraestructura

PackFlow utilizará dos perfiles de despliegue. El perfil inicial permitirá poner en operación la aplicación con una infraestructura sencilla para los primeros negocios. El perfil objetivo incorporará redundancia y alta disponibilidad cuando el nivel operativo lo justifique.

### 11.1 Perfil inicial

- Vue.js desplegado como sitio estático en Cloudflare Pages.
- Una instancia stateless del backend ASP.NET Core en Render.
- PostgreSQL 18.x administrado sin nodo standby.
- Rate limiting aplicado por cuenta e IP en el backend y reforzado en el perímetro cuando el proveedor lo permita.
- Sin estado de sesión ni archivos persistentes en la instancia del backend.
- Backups, health checks, monitoreo y migraciones controladas.

Este perfil es adecuado para el inicio de operaciones con pocos negocios y no representa una garantía formal de alta disponibilidad. La aplicación deberá conservar la misma separación por negocio y los mismos controles de seguridad que el perfil objetivo.

### 11.2 Perfil objetivo de alta disponibilidad

La infraestructura objetivo será:

```text
Usuario
   ↓ HTTPS
Cloudflare Pages + CDN + WAF/DDoS
   ↓ HTTPS
Render Load Balancer
   ├── Backend ASP.NET Core - Instancia 1
   └── Backend ASP.NET Core - Instancia 2
          ↓ TLS
Render PostgreSQL con alta disponibilidad
   ├── Nodo principal
   └── Nodo standby
```

Componentes previstos:

- Vue.js desplegado en Cloudflare Pages.
- Backend ASP.NET Core desplegado como servicio Docker stateless en Render.
- Mínimo dos instancias stateless del backend en el perfil objetivo.
- PostgreSQL 18.x administrado en Render con PITR y alta disponibilidad en el plan contratado.
- Código fuente y flujo CI/CD en GitHub.
- Monitoreo externo de frontend, backend y base de datos.
- Variables de entorno para configuración y secretos.
- El backend no utilizará discos persistentes ni estado local de sesión.
- Los contadores de rate limiting no dependerán únicamente de memoria local cuando existan varias instancias; se utilizará un almacén distribuido compatible con Redis o una política equivalente en el perímetro.
- Los despliegues utilizarán health checks, apagado controlado y rollback.

La especificación operativa del despliegue se encuentra en [`docs/deployment/deployment.md`](../deployment/deployment.md).

## 12. CI/CD y calidad

El flujo de integración y despliegue deberá incluir:

1. Validación de formato y compilación.
2. Pruebas unitarias del dominio.
3. Pruebas de aplicación.
4. Pruebas de integración con PostgreSQL.
5. Escaneo de dependencias.
6. Análisis estático.
7. Construcción de imágenes Docker.
8. Publicación únicamente desde ramas autorizadas.
9. Migraciones controladas.
10. Verificación posterior al despliegue mediante health checks.

## 13. Disponibilidad, respaldo y recuperación

Los objetivos de PackFlow serán:

- Disponibilidad objetivo: 99.9 % mensual en el perfil objetivo de alta disponibilidad.
- RTO objetivo: máximo una hora.
- RPO objetivo: máximo 15 minutos.

Estos objetivos se medirán utilizando la infraestructura redundante definida en el perfil objetivo. El 99.9 % no deberá presentarse como garantía contractual hasta confirmar el SLA del proveedor, el plan contratado y los resultados del monitoreo. Durante el perfil inicial, la disponibilidad se medirá como best effort y deberá registrarse para decidir cuándo realizar la ampliación.

La primera versión deberá contar con PITR, respaldos lógicos independientes, recuperación probada y un procedimiento documentado de restauración.

## 14. Evolución de la infraestructura

La aplicación podrá iniciar con el perfil inicial y evolucionar al perfil objetivo sin modificar el dominio ni el contrato funcional. La ampliación se realizará cuando el número de negocios, el tráfico, los requisitos de disponibilidad o las métricas operativas lo justifiquen.

La alta disponibilidad requerirá dos instancias del backend, PostgreSQL administrado con nodo standby, respaldos y recuperación probada, monitoreo externo y rate limiting distribuido o perimetral. El almacén distribuido compatible con Redis se utilizará únicamente para controles técnicos como rate limiting; no almacenará información del negocio.

## 15. Evolución futura

La arquitectura permitirá incorporar posteriormente:

- MFA.
- Más de una cuenta o usuario por negocio.
- Roles y permisos avanzados.
- Reportes empresariales.
- Exportación de información.
- Integraciones externas.
- Procesamiento asíncrono.
- Separación de módulos en servicios independientes si el volumen lo justifica.

Estas capacidades no se implementarán anticipadamente si no existe una necesidad real del negocio.

## 16. Conclusión

PackFlow empleará un monolito modular basado en DDD, Clean Architecture y capas bien definidas. La separación por bounded contexts permitirá proteger las reglas de productos, inventario, operaciones comerciales e identidad sin introducir la complejidad de los microservicios.

La solución estará preparada para crecer, mantener la consistencia del stock, proteger la información sensible y desplegarse en la nube con un costo inicial controlado. Las garantías superiores de disponibilidad y recuperación dependerán de la ampliación de la infraestructura cuando el nivel operativo del negocio lo requiera.

## 17. Referencias

- [OWASP Top 10](https://owasp.org/Top10/2025/).
- [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x03-introduction/).
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/).
- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20).
- [Microsoft ASP.NET Core security documentation](https://learn.microsoft.com/en-us/aspnet/core/security/).
- [Microsoft .NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).
- [Render pricing](https://render.com/pricing).
- [Render PostgreSQL](https://render.com/docs/postgresql).
- [Cloudflare plans](https://www.cloudflare.com/plans/).
- [Resend pricing](https://resend.com/pricing).
- [UptimeRobot pricing](https://uptimerobot.com/pricing/).
