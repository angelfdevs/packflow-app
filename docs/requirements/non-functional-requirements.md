# Requisitos no funcionales de Agilora

Estos requisitos describen cómo debe comportarse Agilora en aspectos como seguridad, rendimiento, disponibilidad, mantenimiento y calidad. Las reglas de negocio concretas se encuentran en `functional-requirements.md`.

## RNF-001 — Seguridad de contraseñas

### Descripción

Agilora debe proteger las contraseñas de todos sus usuarios.

### Criterios de aceptación

- Las contraseñas no se almacenan ni se muestran en texto plano.
- El cambio y la recuperación de contraseña requieren validaciones de seguridad.
- Las contraseñas se procesan con el mecanismo estándar seguro de ASP.NET Core.
- Los logs, respuestas y errores no contienen contraseñas.

## RNF-002 — Sesiones seguras

### Descripción

La sesión debe permanecer disponible mientras el usuario utilice la aplicación y debe cerrarse después de 15 minutos sin solicitudes autenticadas procesadas por el backend.

### Criterios de aceptación

- La sesión no tiene expiración absoluta durante el alcance actual.
- El usuario puede cerrar sesión voluntariamente.
- El backend controla la expiración mediante la última actividad registrada.
- No existe un botón “Mantener sesión activa” ni un heartbeat automático.
- El refresh token se rota y puede revocarse.
- Si la sesión expira mientras se completa una operación, el formulario puede conservarse temporalmente en memoria hasta la reautenticación.

## RNF-003 — Aislamiento entre negocios

### Descripción

Los datos de un negocio nunca deben quedar disponibles para otro negocio.

### Criterios de aceptación

- Toda solicitud protegida se relaciona con el tenant de la sesión.
- El backend no confía en un `businessId` enviado por el frontend.
- Una consulta o modificación con un identificador de otro negocio es rechazada.
- Las claves foráneas y restricciones de PostgreSQL impiden referencias cruzadas.
- Existen pruebas contra acceso directo, IDOR y filtración de datos entre tenants.

## RNF-004 — Autorización por rol

### Descripción

Las funciones administrativas y operativas deben estar separadas mediante autorización en el backend.

### Criterios de aceptación

- `ADMIN` puede utilizar las funciones administrativas y operativas.
- `OPERATOR` puede realizar las tareas operativas permitidas.
- `OPERATOR` no puede gestionar usuarios, configuración administrativa, dashboard ni reportes administrativos.
- Ocultar un botón en el frontend no reemplaza la comprobación del backend.
- Un usuario bloqueado no puede seguir utilizando sesiones anteriores.

## RNF-005 — Validación de entradas

### Descripción

El sistema debe validar la información recibida antes de procesarla o persistirla.

### Criterios de aceptación

- Se validan campos obligatorios, formatos, longitudes y rangos.
- Se rechazan cantidades, importes, descuentos y atributos incompatibles.
- Se limita el tamaño de solicitudes y búsquedas.
- El backend repite todas las validaciones importantes aunque el frontend ya las haya realizado.
- Las consultas utilizan parámetros seguros y no concatenan SQL recibido del usuario.

## RNF-006 — Persistencia e integridad de operaciones

### Descripción

Toda operación confirmada que cambie el estado del negocio debe quedar guardada de forma completa y consistente.

### Criterios de aceptación

- La venta, abastecimiento, ingreso, ajuste, cancelación, cambio de usuario o configuración se guarda dentro de una transacción cuando corresponde.
- La respuesta exitosa se envía después del `commit`.
- Si falla la persistencia, el sistema no muestra la operación como confirmada.
- No se guardan ventas o movimientos parcialmente.
- Las cotizaciones preliminares no se guardan ni modifican stock.

## RNF-007 — Integridad del inventario

### Descripción

El stock debe mantenerse correcto aunque existan reintentos o usuarios operando al mismo tiempo.

### Criterios de aceptación

- El stock nunca queda por debajo de cero.
- La venta y su salida de inventario se confirman juntas.
- Una cancelación genera una reversión, no modifica el movimiento original.
- Las operaciones utilizan transacciones y control de concurrencia.
- Se prueban ventas simultáneas del mismo producto.

## RNF-008 — Cálculos monetarios confiables

### Descripción

Los importes mostrados al usuario deben provenir del cálculo del backend y conservar precisión decimal.

### Criterios de aceptación

- El frontend no es la autoridad para precios, costos adicionales, descuentos, IGV ni totales.
- El backend recalcula la vista previa y la venta.
- El descuento se aplica antes del IGV.
- Se muestra un solo subtotal, además del descuento aplicado, IGV y total.
- Los importes se almacenan con precisión decimal y se muestran con dos decimales.
- Se prueban límites, redondeos y combinaciones de costos.

## RNF-009 — Idempotencia y concurrencia

### Descripción

Una solicitud repetida o una edición basada en datos antiguos no debe duplicar operaciones ni sobrescribir cambios sin aviso.

### Criterios de aceptación

- Las operaciones persistentes usan `Idempotency-Key`.
- Repetir la misma clave con el mismo contenido devuelve el resultado original.
- Reutilizar la clave con otro contenido genera conflicto.
- Las actualizaciones utilizan `If-Match` y ETags.
- Las solicitudes concurrentes se rechazan o resuelven de forma explícita.

## RNF-010 — Rendimiento

### Descripción

Agilora debe responder con rapidez durante el uso normal de varios negocios.

### Criterios de aceptación

- Las búsquedas, vistas previas y consultas frecuentes deben medirse con percentiles, no solo con un promedio.
- Como objetivo inicial, el P95 de las operaciones frecuentes será de hasta dos segundos bajo una carga previamente definida.
- Las listas usarán paginación y filtros.
- Los reportes grandes no deben bloquear las solicitudes normales.
- Se medirá el rendimiento considerando frontend, backend y base de datos.

## RNF-011 — Manejo de errores

### Descripción

Los errores deben ser claros para el usuario y útiles para el equipo sin revelar información interna.

### Criterios de aceptación

- La API utiliza `ProblemDetails` y códigos HTTP adecuados.
- La interfaz muestra mensajes comprensibles en español.
- No se muestran SQL, stack traces, rutas internas ni secretos.
- Un error no deja datos guardados a medias.
- Los errores incluyen un `traceId` para poder investigarlos.

## RNF-012 — Auditoría y trazabilidad

### Descripción

Agilora debe conservar quién hizo cambios importantes y qué resultado tuvo cada operación.

### Criterios de aceptación

- Se registran actor, negocio, acción, entidad, fecha, resultado y `traceId`.
- Se registran ventas, cancelaciones, ingresos, ajustes, abastecimientos, cambios de configuración y cambios de acceso.
- Los movimientos y eventos de auditoría no se editan desde la aplicación.
- No se registran contraseñas, tokens ni secretos.

## RNF-013 — Copias de seguridad y recuperación

### Descripción

La información de los negocios debe poder recuperarse después de una falla.

### Criterios de aceptación

- Se realizan respaldos administrados y respaldos lógicos independientes.
- Se conserva como mínimo una política de retención definida para producción.
- Existe recuperación punto en el tiempo cuando el plan lo permite.
- La restauración se prueba periódicamente.
- El RTO objetivo inicial es de una hora y el RPO objetivo es de 15 minutos, sujetos al proveedor y al plan contratado.

## RNF-014 — Disponibilidad

### Descripción

Agilora debe estar disponible tanto como sea posible, considerando frontend, backend, base de datos y servicios esenciales.

### Criterios de aceptación

- El perfil inicial se considera `best effort` y no garantiza formalmente 99.9 %.
- El objetivo de 99.9 % mensual solo aplica al perfil de alta disponibilidad con redundancia y monitoreo probado.
- La aplicación no se considera disponible si carga el frontend pero no funciona la API o la base de datos.
- Los despliegues utilizan health checks, apagado controlado y rollback.
- Se registra el tiempo real de disponibilidad mediante monitoreo externo.

## RNF-015 — Monitoreo y registros

### Descripción

El equipo debe poder detectar fallas y revisar qué ocurrió en producción.

### Criterios de aceptación

- Existen `/health/live` y `/health/ready`.
- El endpoint de readiness comprueba las dependencias necesarias.
- Un monitor externo verifica frontend y backend.
- Los logs estructurados incluyen fecha, nivel, operación y contexto.
- Existen alertas ante errores críticos, saturación o indisponibilidad.
- Los logs no contienen datos sensibles.

## RNF-016 — Accesibilidad y experiencia de uso

### Descripción

La interfaz debe poder utilizarse cómodamente desde computadoras, tablets y teléfonos.

### Criterios de aceptación

- Las funciones principales funcionan en pantallas pequeñas.
- Los botones y formularios son utilizables con teclado y pantalla táctil.
- Los controles tienen etiquetas claras.
- Los errores no dependen únicamente del color.
- El contraste, foco visible y navegación por teclado se prueban antes del release.

## RNF-017 — Mantenibilidad

### Descripción

El código y la documentación deben permitir que Agilora crezca sin convertirse en un sistema difícil de modificar.

### Criterios de aceptación

- Cada bounded context mantiene responsabilidades claras.
- Las reglas de negocio no se duplican innecesariamente entre frontend y backend.
- Las migraciones y decisiones técnicas están versionadas.
- La API, ERD, diagramas y requisitos se actualizan junto con cambios relevantes.
- Las dependencias se mantienen en versiones soportadas por los proveedores.

## RNF-018 — Pruebas y calidad

### Descripción

Las reglas críticas deben validarse automáticamente antes de entregar un incremento.

### Criterios de aceptación

- Existen pruebas unitarias para precios, descuentos, costos adicionales, IGV, stock e idempotencia.
- Existen pruebas de integración con PostgreSQL.
- Existen pruebas de contrato contra OpenAPI.
- Existen pruebas E2E para login, roles, catálogo, inventario, venta y cancelación.
- Se prueban errores, límites, tenants y concurrencia.
- Lint, formato, build y pruebas se ejecutan en CI antes de desplegar.

## RNF-019 — Privacidad y protección de información

### Descripción

Agilora debe tratar los datos de los negocios y de sus usuarios con el menor alcance necesario.

### Criterios de aceptación

- No se utilizan datos reales en repositorios, fixtures ni demostraciones públicas.
- El sistema informa finalidades, conservación, proveedores y derechos de los titulares.
- Los datos de una descripción de venta se limitan a lo necesario.
- Existe un procedimiento para atender solicitudes de acceso, rectificación, cancelación y oposición.
- La política de privacidad y el acuerdo SaaS se revisan legalmente antes del lanzamiento comercial.

## RNF-020 — Despliegue seguro

### Descripción

Los ambientes y despliegues deben reducir el riesgo de exponer información o publicar cambios incompletos.

### Criterios de aceptación

- Development, QA, staging y production usan configuraciones y datos separados.
- Los secretos se administran fuera del repositorio.
- Las imágenes Docker y dependencias se escanean en CI.
- Las migraciones se ejecutan de forma controlada.
- Swagger queda protegido o deshabilitado públicamente en producción.
- Solo se publica una versión que superó los controles definidos en la Definition of Done.
