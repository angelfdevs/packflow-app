# Requisitos funcionales de Agilora

Agilora es un SaaS multiempresa. Las historias se expresan desde el punto de vista del usuario del negocio y se implementan respetando tenant, rol, autorización, persistencia y auditoría.

## US-001 — Iniciar sesión

**Código:** US-001
**Título:** Iniciar sesión
**Descripción:** Como usuario de un negocio, quiero iniciar sesión con mis credenciales para acceder únicamente a la información y operaciones autorizadas de mi negocio.

### Criterios de aceptación

#### Escenario 1: Credenciales válidas

Dado que el usuario tiene una membresía activa. Cuando ingresa credenciales válidas, entonces el sistema inicia la sesión, obtiene su rol y negocio, y muestra la pantalla correspondiente.

#### Escenario 2: Credenciales inválidas

Dado que las credenciales no son válidas. Cuando intenta iniciar sesión, entonces el sistema rechaza el acceso sin revelar qué dato fue incorrecto.

#### Escenario 3: Usuario bloqueado

Dado que la membresía o usuario está bloqueado. Cuando intenta iniciar sesión, entonces el sistema rechaza el acceso.

### Reglas de negocio

- No existe registro público durante el primer release; las cuentas de negocio se provisionan mediante un procedimiento controlado.
- El backend determina el negocio y rol de la sesión.
- Los roles iniciales son `ADMIN` y `OPERATOR`.

## US-002 — Cerrar sesión

**Código:** US-002
**Título:** Cerrar sesión
**Descripción:** Como usuario autenticado, quiero cerrar sesión para proteger el acceso al negocio.

### Criterios de aceptación

#### Escenario 1: Cierre exitoso

Dado que existe una sesión activa. Cuando selecciona cerrar sesión, entonces el backend revoca la sesión, limpia las cookies y el frontend redirige al inicio de sesión.

#### Escenario 2: Acceso posterior

Dado que la sesión fue revocada. Cuando intenta abrir un módulo protegido, entonces el sistema solicita autenticación nuevamente.

### Reglas de negocio

- Una sesión revocada no puede utilizarse para consultar ni modificar datos.
- El cierre de sesión no elimina ventas, movimientos ni auditoría.

## US-003 — Recuperar y restablecer contraseña

**Código:** US-003
**Título:** Recuperar y restablecer contraseña
**Descripción:** Como usuario, quiero recuperar mi contraseña mediante un enlace de un solo uso para recuperar el acceso de forma segura.

### Criterios de aceptación

#### Escenario 1: Solicitud de recuperación

Dado que el usuario ingresa un correo. Cuando solicita recuperar la contraseña, entonces el sistema devuelve una respuesta genérica y, si corresponde, envía un enlace.

#### Escenario 2: Restablecimiento válido

Dado que el token es válido y no utilizado. Cuando define una contraseña válida, entonces el sistema actualiza el hash, invalida el token y revoca sesiones anteriores.

#### Escenario 3: Token inválido o usado

Dado que el token expiró o ya fue utilizado. Cuando intenta restablecer la contraseña, entonces el sistema rechaza la operación.

### Reglas de negocio

- El token es de un solo uso, expira y se almacena únicamente mediante hash.
- El sistema no revela si un correo está registrado.
- Las contraseñas nunca se almacenan en texto plano.

## US-004 — Consultar el contexto del negocio

**Código:** US-004
**Título:** Consultar negocio y rol
**Descripción:** Como usuario autenticado, quiero conocer el negocio y rol de mi sesión para utilizar correctamente las funciones disponibles.

### Criterios de aceptación

#### Escenario 1: Sesión válida

Dado que existe una sesión activa. Cuando el frontend consulta el contexto, entonces recibe el negocio, el usuario, el rol y el estado de la membresía.

#### Escenario 2: Sesión inválida

Dado que la sesión expiró. Cuando consulta el contexto, entonces recibe `401 Unauthorized` y debe autenticarse nuevamente.

### Reglas de negocio

- El contexto se obtiene del backend y no de valores confiados enviados por el frontend.
- La información se limita al negocio de la sesión activa.

## US-005 — Invitar operador

**Código:** US-005
**Título:** Invitar usuario al negocio
**Descripción:** Como administrador, quiero invitar a un operador para que pueda trabajar en el mismo negocio con sus propias credenciales.

### Criterios de aceptación

#### Escenario 1: Invitación válida

Dado que el administrador ingresa un correo válido. Cuando confirma la invitación, entonces el sistema crea una invitación de un solo uso y envía el enlace correspondiente.

#### Escenario 2: Correo ya miembro

Dado que el correo ya pertenece al negocio. Cuando el administrador intenta invitarlo, entonces el sistema rechaza el duplicado.

#### Escenario 3: Aceptación

Dado que el token de invitación es válido. Cuando el invitado define sus credenciales, entonces se crea o activa su membresía como `OPERATOR`.

### Reglas de negocio

- Solo `ADMIN` puede invitar usuarios.
- Una invitación expira, es de un solo uso y no contiene contraseñas.
- El administrador no puede invitar a otro administrador durante el alcance inicial.

## US-006 — Administrar usuarios y permisos

**Código:** US-006
**Título:** Bloquear o reactivar operador
**Descripción:** Como administrador, quiero bloquear o reactivar operadores para controlar inmediatamente su acceso.

### Criterios de aceptación

#### Escenario 1: Bloqueo

Dado que un operador está activo. Cuando el administrador lo bloquea, entonces sus sesiones se revocan y las siguientes solicitudes reciben `403 Forbidden` o `401 Unauthorized` según corresponda.

#### Escenario 2: Reactivación

Dado que un operador está bloqueado. Cuando el administrador lo reactiva, entonces podrá iniciar sesión nuevamente.

#### Escenario 3: Acceso directo no autorizado

Dado que un operador conoce una URL administrativa. Cuando intenta acceder directamente, entonces el backend rechaza la operación aunque el frontend oculte el menú.

### Reglas de negocio

- Solo `ADMIN` puede administrar usuarios.
- El administrador no puede bloquearse a sí mismo mediante esta operación.
- La autorización se valida en backend.

## US-007 — Configurar negocio

**Código:** US-007
**Título:** Configurar datos y preferencias
**Descripción:** Como administrador, quiero configurar los datos del negocio, el IGV y las reglas comerciales que utilizarán sus operaciones.

### Criterios de aceptación

#### Escenario 1: Actualización válida

Dado que el administrador modifica una configuración permitida. Cuando confirma, entonces el sistema valida, persiste y devuelve la nueva versión.

#### Escenario 2: Concurrencia

Dado que la configuración cambió desde otra sesión. Cuando se intenta guardar una versión antigua, entonces el sistema rechaza la actualización por conflicto.

### Reglas de negocio

- Solo `ADMIN` puede modificar configuración administrativa.
- La tasa inicial del IGV será 18 % y podrá configurarse según el negocio.
- Las ventas históricas conservan la configuración aplicada al confirmarse.

## US-008 — Crear grupos de productos

**Código:** US-008
**Título:** Crear y consultar grupos
**Descripción:** Como usuario autorizado, quiero crear grupos o categorías para organizar el catálogo de mi negocio.

### Criterios de aceptación

#### Escenario 1: Registro válido

Dado que el nombre no existe en el negocio. Cuando confirma el grupo, entonces se registra y queda disponible para productos.

#### Escenario 2: Nombre duplicado

Dado que ya existe un grupo equivalente ignorando mayúsculas y espacios externos. Cuando intenta registrarlo, entonces el sistema rechaza el duplicado.

### Reglas de negocio

- Los grupos pertenecen a un único negocio.
- La desactivación no debe romper el historial de productos.

## US-009 — Definir atributos del catálogo

**Código:** US-009
**Título:** Crear atributos personalizados
**Descripción:** Como administrador, quiero definir atributos personalizados para registrar productos de acuerdo con las necesidades de mi negocio.

### Criterios de aceptación

#### Escenario 1: Atributo válido

Dado que el administrador ingresa nombre, tipo y obligatoriedad. Cuando confirma, entonces el atributo queda disponible para productos del negocio.

#### Escenario 2: Valor incompatible

Dado que un producto recibe un valor que no coincide con el tipo definido. Cuando intenta guardarlo, entonces el sistema rechaza la operación.

### Reglas de negocio

- Los tipos iniciales serán `TEXT`, `NUMBER`, `BOOLEAN` y `DATE`.
- Los atributos pertenecen al negocio y no pueden utilizarse desde otro tenant.
- Un cambio de definición no debe modificar silenciosamente valores históricos.

## US-010 — Registrar y editar producto

**Código:** US-010
**Título:** Gestionar producto configurable
**Descripción:** Como usuario autorizado, quiero registrar y editar un producto con sus grupos, atributos y reglas de precio.

### Criterios de aceptación

#### Escenario 1: Registro

Dado que los datos cumplen las definiciones del negocio. Cuando confirma el producto, entonces se registra activo y se crea el stock inicial mediante un movimiento de ingreso si es mayor que cero.

#### Escenario 2: Edición

Dado que el producto existe. Cuando confirma cambios válidos, entonces se actualizan sus datos sin modificar directamente el stock.

#### Escenario 3: Producto inactivo

Dado que el producto está inactivo. Cuando se busca para una operación nueva, entonces no aparece como disponible.

### Reglas de negocio

- El producto pertenece al tenant de la sesión.
- El nombre es obligatorio.
- La edición no cambia ventas, abastecimientos ni movimientos históricos.
- Los productos con historial se desactivan mediante borrado lógico.

## US-011 — Configurar precios

**Código:** US-011
**Título:** Definir reglas de precio por cantidad
**Descripción:** Como administrador, quiero definir precios y rangos de cantidad para que el backend aplique la regla correcta.

### Criterios de aceptación

#### Escenario 1: Rango válido

Dado que un producto tiene rangos no superpuestos. Cuando el administrador los confirma, entonces quedan disponibles para futuras operaciones.

#### Escenario 2: Rango superpuesto

Dado que dos reglas se superponen o dejan una cantidad sin precio. Cuando intenta guardarlas, entonces el sistema rechaza la configuración.

### Reglas de negocio

- El precio aplicado se determina en backend según cantidad y reglas vigentes.
- Los precios no pueden ser negativos.
- Las ventas históricas conservan el precio aplicado al confirmarse.

## US-012 — Consultar stock

**Código:** US-012
**Título:** Consultar inventario
**Descripción:** Como usuario autorizado, quiero buscar productos y consultar su stock actual.

### Criterios de aceptación

#### Escenario 1: Búsqueda

Dado que existen productos. Cuando busca por nombre, grupo, atributo o medida registrada, entonces el sistema muestra coincidencias y stock actualizado.

#### Escenario 2: Bajo o agotado

Dado que un producto tiene stock menor o igual a 15, entonces se identifica como bajo; si tiene cero, se identifica como agotado.

### Reglas de negocio

- La consulta no modifica datos.
- Solo se muestran datos del negocio autenticado.
- El umbral de bajo stock es de 15 unidades en esta versión y se determina en backend; el frontend no puede cambiarlo.

## US-013 — Registrar ingreso o abastecimiento

**Código:** US-013
**Título:** Aumentar stock
**Descripción:** Como usuario autorizado, quiero registrar un ingreso o abastecimiento para aumentar el stock de forma trazable.

### Criterios de aceptación

#### Escenario 1: Ingreso directo

Dado que el producto existe. Cuando confirma una cantidad positiva, entonces se actualiza el stock y se registra un movimiento.

#### Escenario 2: Abastecimiento con proveedor

Dado que el usuario selecciona opcionalmente un proveedor y varios productos. Cuando confirma, entonces se guarda el abastecimiento y sus ingresos de stock en una transacción.

### Reglas de negocio

- La cantidad debe ser positiva y no superar el límite de la API.
- El proveedor es opcional.
- Un movimiento confirmado es inmutable.

## US-014 — Ajustar stock

**Código:** US-014
**Título:** Ajustar stock por motivo
**Descripción:** Como usuario autorizado, quiero aumentar o disminuir stock por una corrección operativa.

### Criterios de aceptación

#### Escenario 1: Disminución justificada

Dado que existe pérdida, daño o corrección. Cuando confirma una disminución con motivo obligatorio, entonces el backend valida stock suficiente y registra el movimiento.

#### Escenario 2: Aumento por corrección

Dado que se necesita corregir el stock. Cuando confirma un aumento, entonces el sistema registra la razón y actualiza el stock.

#### Escenario 3: Stock insuficiente

Dado que la disminución supera el stock disponible. Cuando confirma, entonces toda la operación es rechazada.

### Reglas de negocio

- El stock nunca puede ser negativo.
- Los ajustes no sustituyen una venta ni un abastecimiento.
- El movimiento conserva actor, fecha, delta y motivo.

## US-015 — Consultar movimientos

**Código:** US-015
**Título:** Consultar historial de inventario
**Descripción:** Como usuario autorizado, quiero consultar movimientos para conocer la trazabilidad del stock.

### Criterios de aceptación

#### Escenario 1: Historial

Dado que existen movimientos. Cuando consulta el historial, entonces observa producto, tipo, cantidad, stock anterior, stock resultante, actor, fecha y motivo cuando corresponda.

#### Escenario 2: Paginación

Dado que existen muchos movimientos. Cuando consulta una página, entonces recibe únicamente la cantidad solicitada y metadatos de paginación.

### Reglas de negocio

- Los movimientos no se eliminan ni editan desde operaciones normales.
- Las ventas canceladas generan movimientos de reversión, no modificaciones al movimiento original.

## US-016 — Gestionar proveedores

**Código:** US-016
**Título:** Crear y administrar proveedores
**Descripción:** Como usuario autorizado, quiero registrar proveedores para asociarlos opcionalmente a abastecimientos.

### Criterios de aceptación

#### Escenario 1: Crear proveedor

Dado que los datos son válidos. Cuando confirma, entonces el proveedor queda disponible para el negocio.

#### Escenario 2: Desactivar proveedor

Dado que el proveedor tiene historial. Cuando se desactiva, entonces no aparece para nuevos abastecimientos, pero su historial permanece.

### Reglas de negocio

- El proveedor pertenece a un solo negocio.
- La información de contacto debe ser mínima y protegida.
- Desactivar un proveedor no elimina abastecimientos históricos.

## US-017 — Consultar abastecimientos

**Código:** US-017
**Título:** Consultar abastecimientos
**Descripción:** Como usuario autorizado, quiero consultar abastecimientos para controlar los ingresos de mercadería y proveedores.

### Criterios de aceptación

#### Escenario 1: Consulta

Dado que existen abastecimientos. Cuando el usuario autorizado filtra por período o proveedor, entonces recibe los registros correspondientes.

#### Escenario 2: Detalle

Dado que existe un abastecimiento. Cuando lo selecciona, entonces observa sus productos, cantidades, proveedor opcional y fecha.

### Reglas de negocio

- Los usuarios autorizados pueden consultar abastecimientos operativos; los reportes administrativos agregados quedan restringidos a `ADMIN`.
- Los abastecimientos confirmados no se eliminan físicamente.

## US-018 — Calcular vista previa de operación

**Código:** US-018
**Título:** Calcular operación comercial
**Descripción:** Como usuario autorizado, quiero ingresar uno o varios productos y obtener una vista previa para informar el importe al cliente.

### Criterios de aceptación

#### Escenario 1: Varios productos

Dado que agrego productos activos. Cuando solicito calcular, entonces el backend devuelve líneas, un único subtotal, descuento, IGV y total.

#### Escenario 2: Datos modificados

Dado que existe un resultado mostrado. Cuando cambio una entrada, entonces el resultado se marca como desactualizado y debo calcular nuevamente.

#### Escenario 3: Operación inválida

Dado que existen líneas repetidas, cantidades inválidas o productos inactivos. Cuando calculo, entonces el backend rechaza la vista previa.

### Reglas de negocio

- La vista previa no se guarda ni modifica stock.
- El backend obtiene precios y reglas vigentes.
- Una operación admite como máximo 20 productos diferentes.

## US-019 — Aplicar costos adicionales y descuentos

**Código:** US-019
**Título:** Aplicar condiciones comerciales opcionales
**Descripción:** Como usuario autorizado, quiero aplicar costos adicionales y un descuento para representar las condiciones acordadas con el cliente.

### Criterios de aceptación

#### Escenario 1: Costo adicional

Dado que existe un costo activo aplicable. Cuando lo selecciono y calculo, entonces el backend aplica su regla según alcance, cantidad y multiplicador.

#### Escenario 2: Descuento porcentual

Dado que ingreso un porcentaje válido. Cuando calculo, entonces el descuento se aplica antes del IGV y se muestra su tipo, valor y monto.

#### Escenario 3: Descuento fijo

Dado que ingreso un importe fijo válido. Cuando calculo, entonces el descuento se aplica antes del IGV sin crear un segundo subtotal.

### Reglas de negocio

- Solo puede existir un tipo de descuento por operación.
- El descuento no puede generar un subtotal negativo.
- Los costos adicionales se obtienen de la configuración del negocio.
- La serigrafía se modela como un costo adicional con rangos, lotes y colores.

## US-020 — Confirmar venta

**Código:** US-020
**Título:** Registrar venta desde la operación
**Descripción:** Como usuario autorizado, quiero confirmar una operación calculada para registrar una venta y actualizar el inventario.

### Criterios de aceptación

#### Escenario 1: Venta válida

Dado que la operación fue calculada. Cuando confirmo la venta, entonces el backend recalcula, guarda venta y detalles, registra movimientos de salida y devuelve la confirmación.

#### Escenario 2: Stock insuficiente

Dado que el stock cambió desde el cálculo. Cuando confirmo, entonces el backend rechaza toda la operación sin guardar una venta parcial.

#### Escenario 3: Reintento

Dado que una solicitud se repite con la misma clave de idempotencia y contenido. Cuando llega al backend, entonces devuelve el resultado original sin duplicar la venta.

### Reglas de negocio

- La persistencia, cálculo definitivo y descuento de stock forman una única transacción.
- El frontend no puede enviar valores definitivos de confianza.
- La venta guarda una instantánea de los valores aplicados.

## US-021 — Consultar ventas

**Código:** US-021
**Título:** Consultar historial y detalle de ventas
**Descripción:** Como usuario autorizado, quiero consultar ventas confirmadas y canceladas para controlar las operaciones del negocio.

### Criterios de aceptación

#### Escenario 1: Historial

Dado que existen ventas. Cuando consulto el historial, entonces recibo paginación, estado, fecha, descripción, importe y usuario que registró la operación.

#### Escenario 2: Detalle

Dado que selecciono una venta. Cuando consulto el detalle, entonces observo productos, cantidades, costos adicionales, descuentos, subtotal, IGV y total históricos.

### Reglas de negocio

- Los precios y reglas actuales no modifican ventas históricas.
- La información se limita al negocio de la sesión.

## US-022 — Cancelar venta

**Código:** US-022
**Título:** Cancelar una venta confirmada
**Descripción:** Como administrador, quiero cancelar una venta indicando el motivo para corregir una operación y restituir el stock cuando corresponda.

### Criterios de aceptación

#### Escenario 1: Cancelación válida

Dado que la venta está confirmada. Cuando el administrador ingresa un motivo y confirma, entonces la venta cambia a cancelada y se registra la reversión de inventario.

#### Escenario 2: Venta ya cancelada

Dado que la venta ya está cancelada. Cuando se intenta cancelarla nuevamente, entonces el backend rechaza la operación sin duplicar stock.

### Reglas de negocio

- Solo `ADMIN` puede cancelar ventas en el primer release.
- La venta original no se elimina.
- La reversión se registra como un nuevo movimiento, con actor, fecha y motivo.

## US-023 — Consultar dashboard

**Código:** US-023
**Título:** Visualizar resumen del negocio
**Descripción:** Como administrador, quiero consultar indicadores y gráficos para conocer el estado del negocio.

### Criterios de aceptación

#### Escenario 1: Período

Dado que el administrador selecciona hoy, últimos siete días, último mes, todo el período o un rango válido. Cuando actualiza el dashboard, entonces los indicadores respetan el período.

#### Escenario 2: Resumen

Entonces el dashboard muestra ventas, cantidad de operaciones, productos activos, productos agotados, productos con bajo stock, movimientos recientes y gráficos útiles.

#### Escenario 3: Usuario no administrador

Dado que un operador consulta el dashboard. Cuando solicita los datos, entonces el backend rechaza el acceso.

### Reglas de negocio

- El dashboard muestra resúmenes y enlaces; no debe cargar todos los registros.
- Unidades vendidas globales no son un indicador obligatorio de la primera versión.

## US-024 — Generar reportes

**Código:** US-024
**Título:** Generar reportes operativos
**Descripción:** Como administrador, quiero generar reportes filtrados para analizar ventas, inventario, productos y abastecimientos.

### Criterios de aceptación

#### Escenario 1: Reporte válido

Dado que selecciono un tipo y período válido. Cuando genero el reporte, entonces el sistema muestra resultados del negocio autenticado.

#### Escenario 2: Exportación

Dado que existe un reporte. Cuando solicito exportarlo, entonces el sistema entrega un archivo CSV o una respuesta estructurada sin exponer datos de otros negocios.

### Reglas de negocio

- Solo `ADMIN` puede generar reportes administrativos.
- El período y zona horaria deben quedar registrados en la solicitud de reporte.
- Los reportes iniciales no reemplazan contabilidad ni facturación electrónica.

## US-025 — Ver actualizaciones de otros usuarios

**Código:** US-025
**Título:** Sincronizar cambios del negocio
**Descripción:** Como usuario autorizado, quiero ver reflejados los cambios relevantes realizados por otro usuario del mismo negocio.

### Criterios de aceptación

#### Escenario 1: Cambio confirmado

Dado que un usuario confirma una venta, abastecimiento o ajuste. Cuando otro usuario tiene abierta la aplicación, entonces recibe una señal de actualización o puede refrescar los datos sin consultar otro negocio.

#### Escenario 2: Notificación no disponible

Dado que el canal de tiempo real falla. Cuando existe un cambio confirmado, entonces los datos permanecen guardados y el frontend puede reconciliarse mediante una nueva consulta.

### Reglas de negocio

- PostgreSQL es la fuente de verdad.
- Las notificaciones se publican después del commit.
- No se confirma una operación únicamente porque se envió una notificación.

## US-026 — Auditar operaciones

**Código:** US-026
**Título:** Consultar trazabilidad administrativa
**Descripción:** Como administrador, quiero consultar eventos relevantes para conocer quién realizó cambios importantes.

### Criterios de aceptación

#### Escenario 1: Evento registrado

Dado que se confirma, cancela o modifica una operación administrativa. Cuando finaliza correctamente, entonces se registra actor, tenant, acción, entidad, fecha, resultado y trace ID.

#### Escenario 2: Datos sensibles

Dado que existe información sensible en una solicitud. Cuando se registra auditoría, entonces los secretos, contraseñas y tokens son excluidos o anonimizados.

### Reglas de negocio

- Los eventos de auditoría no se eliminan desde la aplicación.
- Solo `ADMIN` puede consultar auditoría visible.

## US-027 — Gestionar apariencia

**Código:** US-027
**Título:** Configurar tema y tamaño de fuente
**Descripción:** Como usuario autenticado, quiero configurar mi tema y tamaño de fuente para utilizar Agilora cómodamente.

### Criterios de aceptación

#### Escenario 1: Tema

Dado que el usuario cambia el switch de tema. Cuando confirma, entonces la preferencia se persiste para ese usuario y se aplica en su interfaz.

#### Escenario 2: Tamaño de fuente

Dado que selecciona un tamaño permitido. Cuando confirma, entonces la aplicación aplica y conserva la preferencia.

### Reglas de negocio

- La preferencia visual pertenece al usuario y no modifica datos del negocio.
- La caché local solo puede conservar preferencias no sensibles.

## US-028 — Mantener historial de datos

**Código:** US-028
**Título:** Conservar información confirmada
**Descripción:** Como responsable del negocio, quiero que cada operación confirmada quede almacenada para conservar trazabilidad y control.

### Criterios de aceptación

#### Escenario 1: Persistencia confirmada

Dado que una operación cambia el estado del negocio. Cuando el backend confirma el commit, entonces quedan almacenados sus datos, actor, fecha y efectos relacionados.

#### Escenario 2: Falla de persistencia

Dado que ocurre una falla antes del commit. Cuando el backend responde, entonces informa error y no muestra la operación como confirmada.

### Reglas de negocio

- Las consultas de lectura no crean operaciones de negocio.
- Las vistas previas no se almacenan.
- Las ventas, cancelaciones, abastecimientos, ingresos, ajustes, usuarios y configuraciones confirmadas sí se almacenan.
