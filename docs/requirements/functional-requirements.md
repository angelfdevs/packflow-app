<br>**US-001 — Iniciar sesión** </br>
Descripción:
Como administrador, quiero iniciar sesión con mi correo y contraseña, para acceder de forma segura a la cuenta de mi negocio. </br>
Criterios de aceptación
<br>**Escenario 1:** Credenciales correctas</br>
Dado que el administrador tiene una cuenta registrada.
Cuando ingresa correctamente su correo y contraseña.
Entonces el sistema debe permitirle acceder al Dashboard.
<br>**Escenario 2:** Credenciales incorrectas</br>
Dado que el administrador se encuentra en el formulario de inicio de sesión.
Cuando ingresa credenciales incorrectas.
Entonces el sistema debe mostrar un mensaje de error y no permitir el acceso.
<br>**Escenario 3:** Campos incompletos</br>
Dado que el administrador deja campos vacíos.
Cuando intenta iniciar sesión.
Entonces el sistema debe solicitar la información faltante.
<br>**Reglas de negocio**</br>
- Cada cuenta administradora será dueña de un único negocio y solo podrá existir una cuenta administradora por negocio.
- Las cuentas serán provisionadas mediante un procedimiento administrativo controlado; no existirá registro público durante el alcance actual.
- Las contraseñas deben almacenarse de forma segura.
- El sistema no debe revelar si el correo o la contraseña son incorrectos; en su lugar, debe indicar que las credenciales de inicio de sesión son incorrectas.

<br>**US-002 — Cerrar sesión**</br>
Descripción:
Como administrador, quiero cerrar sesión, para proteger el acceso a la cuenta del negocio.
Criterios de aceptación
<br>**Escenario 1: Cierre de sesión exitoso**</br>
Dado que el administrador tiene una sesión activa.
Cuando selecciona la opción de cerrar sesión.
Entonces el sistema debe finalizar la sesión y redirigirlo al inicio de sesión.
<br>**Escenario 2: Acceso después de cerrar sesión**</br>
Dado que el administrador cerró sesión.
Cuando intenta acceder a un módulo protegido.
Entonces el sistema debe solicitarle iniciar sesión nuevamente.
<br>**Reglas de negocio**</br>
- Una sesión cerrada no debe permitir acceder a información protegida.
- El token de sesión debe invalidarse correctamente.

<br>**US-003 — Cambiar contraseña**</br>
Descripción:
Como administrador, quiero cambiar la contraseña de mi cuenta, para mantener seguro el acceso al negocio.
Criterios de aceptación
<br>**Escenario 1: Cambio exitoso**</br>
Dado que el administrador ingresó su contraseña actual correctamente.
Cuando registra y confirma una nueva contraseña válida.
Entonces el sistema debe actualizar la contraseña.
<br>**Escenario 2: Contraseña actual incorrecta**</br>
Dado que el administrador ingresa una contraseña actual incorrecta.
Cuando intenta guardar una nueva contraseña.
Entonces el sistema debe rechazar la operación.
<br>**Reglas de negocio**</br>
- La nueva contraseña debe cumplir los requisitos mínimos de seguridad.
- La contraseña debe almacenarse mediante un hash seguro.
- La contraseña actual nunca debe mostrarse en pantalla.

<br>**US-004 — Registrar producto**</br>
Descripción:
Como administrador, quiero registrar un producto con sus características y precios, para incorporarlo al catálogo del negocio y utilizarlo en consultas, cotizaciones y ventas.
Criterios de aceptación
<br>**Escenario 1: Registro exitoso sin stock inicial**</br>
Dado que el administrador se encuentra en el formulario de productos.
Cuando completa correctamente la categoría, nombre, medidas, material, precio minorista y precio mayorista.
Entonces el sistema debe registrar el producto activo con stock cero.
<br>**Escenario 2: Registro exitoso con stock inicial**</br>
Dado que el administrador registra un producto e ingresa una cantidad inicial.
Cuando confirma la operación.
Entonces el sistema debe registrar el producto y generar un movimiento de ingreso inicial con la cantidad indicada.
<br>**Escenario 3: Datos obligatorios incompletos**</br>
Dado que el administrador deja campos obligatorios vacíos.
Cuando intenta registrar el producto.
Entonces el sistema debe mostrar los campos pendientes y rechazar la operación.
<br>**Escenario 4: Datos inválidos**</br>
Dado que el administrador ingresa precios negativos, cantidades inválidas o información incorrecta.
Cuando intenta registrar el producto.
Entonces el sistema debe mostrar un mensaje de validación y no guardar la información.
<br>**Escenario 5: Producto activo duplicado**</br>
Dado que ya existe un producto activo con la misma categoría, material, nombre y medidas dentro del negocio.
Cuando el administrador intenta registrarlo nuevamente.
Entonces el sistema debe informar el conflicto y evitar el duplicado.
<br>**Reglas de negocio**</br>
- El producto debe pertenecer a la cuenta del negocio autenticado.
- El producto debe tener categoría, nombre, medidas, material, precio minorista y precio mayorista.
- No podrán existir dos productos activos del mismo negocio con la misma categoría, material, nombre y medidas. Los precios no forman parte de la identidad del producto.
- Los precios no pueden ser negativos.
- Cada dimensión debe ser mayor que cero y no superar 1 000 cm.
- El stock inicial no podrá superar 1 000 000 unidades.
- El stock inicial no se modificará directamente en la entidad producto.
- El stock inicial se registrará mediante un movimiento de ingreso.
- Todo movimiento inicial debe guardar producto, cantidad, fecha y tipo de movimiento.
- La edición del producto no debe modificar directamente el stock.
- El producto se registrará activo por defecto.
- El backend debe validar toda la información recibida.

<br>**US-005 — Editar producto**</br>
Descripción:
Como administrador, quiero editar los datos de un producto, para mantener actualizada la información del catálogo.
Criterios de aceptación
<br>**Escenario 1: Edición exitosa**</br>
Dado que el producto existe y está activo.
Cuando el administrador modifica sus datos y confirma la operación.
Entonces el sistema debe guardar los nuevos datos.
<br>**Escenario 2: Cancelar edición**</br>
Dado que el administrador modificó los datos de un producto.
Cuando cancela la operación.
Entonces el sistema no debe guardar los cambios.
<br>**Escenario 3: Datos inválidos**</br>
Dado que el administrador ingresa información inválida.
Cuando intenta confirmar la edición.
Entonces el sistema debe mostrar los errores y conservar los datos anteriores.
<br>**Reglas de negocio**</br>
- La edición de un producto debe requerir confirmación.
- Modificar el precio no debe alterar las ventas anteriores.
- El stock no debe modificarse directamente desde la edición del producto.
- Los cambios de stock se realizarán mediante ingresos, ventas o ajustes manuales.

<br>**US-006 — Activar o desactivar producto**</br>
Descripción:
Como administrador, quiero activar o desactivar productos, para controlar cuáles están disponibles en las operaciones del negocio.
Criterios de aceptación
<br>**Escenario 1: Desactivar producto**</br>
Dado que el producto está activo.
Cuando el administrador confirma su desactivación.
Entonces el producto debe dejar de aparecer como disponible para nuevas cotizaciones y ventas.
<br>**Escenario 2: Activar producto**</br>
Dado que el producto está desactivado.
Cuando el administrador confirma su activación.
Entonces el producto debe volver a estar disponible.
<br>**Escenario 3: Reactivación conflictiva**</br>
Dado que existe otro producto activo con la misma categoría, material, nombre y medidas.
Cuando el administrador intenta activar el producto desactivado.
Entonces el sistema debe rechazar la activación e informar el conflicto.
<br>**Reglas de negocio**</br>
- La desactivación debe realizarse mediante borrado lógico.
- Los productos desactivados no deben eliminarse físicamente.
- Las ventas históricas relacionadas con el producto deben conservarse.
- La activación debe volver a validar la unicidad de la identidad activa del producto.

<br>**US-007 — Consultar stock**</br>
Descripción:
Como administrador, quiero consultar el stock de mis productos, para responder rápidamente a las consultas de los clientes.
Criterios de aceptación
<br>**Escenario 1: Búsqueda exitosa**</br>
Dado que existen productos registrados.
Cuando el administrador busca por nombre, medida, categoría o material.
Entonces el sistema debe mostrar los productos coincidentes y su stock actual.
<br>**Escenario 2: Producto no encontrado**</br>
Dado que no existe un producto coincidente.
Cuando el administrador realiza una búsqueda.
Entonces el sistema debe mostrar un mensaje indicando que no se encontraron resultados.
<br>**Reglas de negocio**</br>
- La consulta debe mostrar el stock actualizado.
- Los productos desactivados no deben aparecer como disponibles.
- La consulta de stock no debe modificar ningún dato.

<br>**US-008 — Registrar ingreso de stock**</br>
Descripción:
Como administrador, quiero registrar el ingreso de nueva mercadería, para aumentar correctamente el stock de un producto.
Criterios de aceptación
<br>**Escenario 1: Ingreso exitoso**</br>
Dado que el producto existe y está activo.
Cuando el administrador ingresa una cantidad válida y confirma la operación.
Entonces el sistema debe aumentar el stock y registrar el movimiento.
<br>**Escenario 2: Cantidad inválida**</br>
Dado que el administrador ingresa una cantidad igual o menor que cero.
Cuando intenta confirmar el ingreso.
Entonces el sistema debe mostrar un mensaje de error y no modificar el stock.
<br>**Reglas de negocio**</br>
- La cantidad ingresada debe ser mayor que cero.
- La cantidad ingresada no podrá superar 1 000 000 unidades por operación.
- Todo ingreso debe registrar fecha, cantidad y producto.
- El stock debe actualizarse de forma segura.

<br>**US-009 — Consultar movimientos de inventario**</br>
Descripción:
Como administrador, quiero consultar los movimientos de inventario, para conocer cuándo y por qué cambió el stock.
Criterios de aceptación
<br>**Escenario 1: Consulta de movimientos**</br>
Dado que existen movimientos registrados.
Cuando el administrador accede al historial.
Entonces el sistema debe mostrar producto, tipo de movimiento, cantidad y fecha.
<br>**Escenario 2: Sin movimientos**</br>
Dado que un producto no tiene movimientos registrados.
Cuando el administrador consulta su historial.
Entonces el sistema debe mostrar un mensaje informativo.
<br>**Reglas de negocio**</br>
- Los movimientos deben conservarse como historial.
- Los movimientos principales serán ingresos de stock, salidas por ventas y ajustes manuales.
- Un movimiento no debe modificarse después de ser registrado.
- Los ajustes deben conservar el motivo registrado.

<br>**US-010 — Buscar y seleccionar producto para cotizar**</br>
Descripción:
Como administrador, quiero buscar y seleccionar un producto, para iniciar una cotización para un cliente.
Criterios de aceptación
<br>**Escenario 1: Selección exitosa**</br>
Dado que existen productos activos.
Cuando el administrador busca y selecciona un producto.
Entonces el sistema debe mostrar su nombre, medida, material, precio minorista y precio mayorista.
<br>**Escenario 2: Búsqueda sin resultados**</br>
Dado que no existe un producto coincidente.
Cuando el administrador realiza una búsqueda.
Entonces el sistema debe mostrar un mensaje indicando que no se encontraron productos.
<br>**Reglas de negocio**</br>
- La búsqueda debe permitir utilizar nombre, medida, categoría o material.
- Solo deben seleccionarse productos activos.
- Seleccionar un producto no debe modificar el stock.

<br>**US-011 — Ingresar cantidad para cotizar**</br>
Descripción:
Como administrador, quiero ingresar la cantidad de productos solicitada para que el sistema aplique automáticamente el precio minorista o mayorista correspondiente.
Criterios de aceptación:
<br>**Escenario 1: Aplicar precio minorista**</br>
Dado que seleccioné un producto.
Cuando ingreso una cantidad entre 1 y 100 unidades. 
Entonces el sistema debe aplicar el precio minorista.
<br>**Escenario 2: Aplicar precio mayorista**</br>
Dado que seleccioné un producto. 
Cuando ingreso una cantidad igual o superior a 101 unidades. 
Entonces el sistema debe aplicar el precio mayorista.
<br>**Escenario 3: Cantidad inválida**</br>
Dado que seleccioné un producto.
Cuando ingreso una cantidad menor o igual a cero.
Entonces el sistema debe mostrar un mensaje de validación y no permitir continuar.
<br>**Reglas de negocio**</br>
- De 1 a 100 unidades se aplicará el precio minorista.
- Desde 101 unidades se aplicará el precio mayorista.
- La cantidad debe ser un número entero positivo.
- La cantidad no podrá superar 1 000 000 unidades por línea.
- El precio aplicado debe obtenerse del producto seleccionado.
- La cotización no modifica el stock.


<br>**US-012 — Aplicar serigrafía**</br>
Descripción:
Como administrador, quiero aplicar serigrafía opcional a los productos para calcular correctamente el costo adicional según la cantidad de unidades y colores seleccionados.
Criterios de aceptación:
<br>**Escenario 1: Cotización sin serigrafía**</br>
Dado que la serigrafía está desactivada.
Cuando realizo una cotización
Entonces el sistema no debe agregar ningún costo por serigrafía.
<br>**Escenario 2: Cantidad insuficiente**</br>
Dado que ingreso una cantidad menor a 20 unidades
Cuando intento activar la serigrafía.
Entonces el sistema debe impedirlo y mostrar un mensaje informativo.
<br>**Escenario 3: Serigrafía entre 20 y 300 unidades**</br>
Dado que ingreso entre 20 y 300 unidades. 
Cuando selecciono uno o más colores. 
Entonces el sistema debe aplicar S/45 por lote de 100 unidades y por color.
<br>**Escenario 4: Serigrafía entre 301 y 500 unidades**</br>
Dado que ingreso entre 301 y 500 unidades.
Cuando selecciono uno o más colores.
Entonces el sistema debe aplicar S/40 por lote de 100 unidades y por color.
<br>**Escenario 5: Serigrafía desde 501 unidades**</br>
Dado que ingreso 501 unidades o más.
Cuando selecciono uno o más colores.
Entonces el sistema debe aplicar S/30 por lote de 100 unidades y por color.
<br>**Escenario 6: Cantidad con remanente**</br>
Dado que ingreso 150 unidades y selecciono un color. 
Entonces el sistema debe considerar dos lotes: 100 y 50 unidades, aplicando el costo de serigrafía a ambos lotes.
<br>**Escenario 7: Cantidad de colores inválida**</br>
Dado que activo la serigrafía.
Cuando ingreso una cantidad de colores menor o igual a cero.
Entonces el sistema debe mostrar un mensaje de validación.
<br>**Escenario 8: Exceso de colores**</br>
Dado que activo la serigrafía.
Cuando ingreso más de 10 colores.
Entonces el sistema debe rechazar la cantidad e informar el límite permitido.
<br>**Reglas de negocio**</br>
- La serigrafía es opcional.
- Solo puede aplicarse desde 20 unidades.
- Los lotes se calcularán mediante la fórmula: Lotes = REDONDEAR HACIA ARRIBA(cantidad / 100)
- El costo se calculará mediante: Costo de serigrafía = lotes × colores × tarifa
- De 20 a 300 unidades, la tarifa será S/45.
- De 301 a 500 unidades, la tarifa será S/40.
- Desde 501 unidades, la tarifa será S/30.
- Un remanente también se considera un lote.
- La cantidad de colores debe ser un número entero positivo.
- La cantidad máxima de colores será 10 por línea de producto.

<br>**US-013 — Calcular cotización**</br>
Descripción:
Como administrador, quiero obtener el subtotal, IGV y total de una cotización con uno o varios productos, para informar correctamente el precio al cliente.
Criterios de aceptación
<br>**Escenario 1: Cálculo exitoso**</br>
Dado que el administrador seleccionó uno o varios productos e ingresó una cantidad válida para cada línea.
Cuando solicita el cálculo.
Entonces el sistema debe mostrar el subtotal, IGV y total.
<br>**Escenario 2: Cálculo con serigrafía**</br>
Dado que el administrador activó la serigrafía.
Cuando solicita el cálculo.
Entonces el sistema debe incluir el recargo correspondiente.
<br>**Escenario 3: Datos incompletos**</br>
Dado que no se seleccionó ningún producto o falta la cantidad de una línea.
Cuando el administrador intenta calcular.
Entonces el sistema debe solicitar la información faltante.
<br>**Reglas de negocio**</br>
- El subtotal base se calculará usando el precio minorista o mayorista correspondiente.
- La serigrafía se agregará al subtotal base cuando corresponda.
- El descuento será opcional.
- Solo podrá aplicarse un descuento por operación.
- El descuento podrá ser porcentual o de monto fijo.
- La cotización podrá contener uno o varios productos y mostrará: Subtotal base, Costo de serigrafía, Descuento aplicado, Subtotal final, IGV y Total.
- Las cotizaciones no se guardarán.
- Las cotizaciones no modifican el stock.


<br>**US-014 — Registrar venta**</br>
Descripción:
Como administrador, quiero registrar una venta, para conservar un control de las operaciones realizadas por el negocio.
Criterios de aceptación
<br>**Escenario 1: Registro exitoso**</br>
Dado que el administrador seleccionó uno o varios productos e ingresó una cantidad válida para cada línea.
Cuando confirma la venta.
Entonces el sistema debe registrar la venta y mostrar un mensaje de confirmación.
<br>**Escenario 2: Datos incompletos**</br>
Dado que falta seleccionar un producto o ingresar la cantidad de una línea.
Cuando el administrador intenta confirmar la venta.
Entonces el sistema debe mostrar los campos pendientes.
<br>**Escenario 3: Venta cancelada**</br>
Dado que el administrador está revisando los datos de la venta.
Cuando cancela la operación.
Entonces el sistema no debe registrar la venta ni modificar el stock.
<br>**Escenario 4: Registrar venta con descuento porcentual**</br>
Dado que ingreso un descuento porcentual válido. 
Cuando confirmo la venta.
Entonces el sistema debe calcular el descuento y guardar la venta con sus valores correspondientes.
<br>**Escenario 5: Registrar venta con descuento fijo**</br>
Dado que ingreso un descuento fijo válido.
Cuando confirmo la venta.
Entonces el sistema debe calcular el descuento y guardar la venta con sus valores correspondientes.
<br>**Escenario 6: Ingresar dos tipos de descuento**</br>
Dado que ingreso simultáneamente un descuento porcentual y uno fijo.
Cuando intento confirmar la venta. 
Entonces el sistema debe impedirlo y mostrar un mensaje de validación.
<br>**Reglas de negocio**</br>
- Solo se deben registrar ventas confirmadas.
- La venta debe conservar todos sus productos, cantidades, precios, serigrafía, subtotal, IGV, total y fecha.
- Una venta cancelada no debe generar movimientos de stock.
- El descuento es opcional.
- Solo se permite un tipo de descuento por venta.
- La venta debe guardar el tipo, valor y monto real del descuento aplicado.
- La venta confirmada debe disminuir el stock automáticamente.

<br>**US-015 — Disminuir stock automáticamente por venta**</br>
Descripción:
Como administrador, quiero que el stock disminuya automáticamente al confirmar una venta, para evitar modificarlo manualmente.
Criterios de aceptación
<br>**Escenario 1: Stock suficiente**</br>
Dado que el producto tiene stock suficiente.
Cuando el administrador confirma una venta.
Entonces el sistema debe registrar la venta y disminuir el stock correspondiente.
<br>**Escenario 2: Stock insuficiente**</br>
Dado que la cantidad solicitada supera el stock disponible.
Cuando el administrador intenta confirmar la venta.
Entonces el sistema debe rechazar la operación y mostrar un mensaje informativo.
<br>**Reglas de negocio**</br>
- El stock nunca puede ser negativo.
- La venta y la disminución de stock deben realizarse como una operación segura.
- Si no se puede actualizar el stock, la venta no debe registrarse.
- La disminución debe generar un movimiento de salida.

<br>**US-016 — Consultar historial de ventas**</br>
Descripción:
Como administrador, quiero consultar las ventas registradas, para controlar las operaciones realizadas por el negocio.
Criterios de aceptación
<br>**Escenario 1: Historial con ventas**</br>
Dado que existen ventas confirmadas.
Cuando el administrador accede al historial.
Entonces el sistema debe mostrar las ventas registradas.
<br>**Escenario 2: Visualizar detalle**</br>
Dado que el administrador observa una venta registrada.
Cuando selecciona la venta.
Entonces el sistema debe mostrar sus productos, cantidades, precios, serigrafía, subtotal, IGV y total.
<br>**Escenario 3: Historial vacío**</br>
Dado que no existen ventas registradas.
Cuando el administrador accede al historial.
Entonces el sistema debe mostrar un mensaje informativo.
<br>**Reglas de negocio**</br>
- Solo deben mostrarse ventas confirmadas.
- Las ventas históricas deben conservar sus precios y totales originales.
- Una modificación posterior del precio del producto no debe alterar ventas anteriores.
- El historial debe mostrar el descuento aplicado, si existiera.
- Debe indicar si el descuento fue porcentual o fijo.
- Debe mostrar el subtotal final, IGV y total de la venta.
- Debe conservar los valores utilizados al momento de registrar la venta.

<br>**US-017 — Configurar IGV y serigrafía**</br>
Descripción:
Como administrador, quiero configurar la tasa del IGV y las tarifas de serigrafía para que los cálculos de cotizaciones y ventas se adapten a las reglas comerciales del negocio.
Criterios de aceptación:
<br>**Escenario 1: Configurar IGV**</br>
Dado que accedo a configuración. 
Cuando ingreso una tasa de IGV válida. 
Entonces el sistema debe guardar la nueva tasa.
<br>**Escenario 2: Configurar tarifas de serigrafía**</br>
Dado que accedo a configuración.
Cuando registro las tarifas correspondientes.
Entonces el sistema debe guardar:
De 20 a 300 unidades: S/45.
De 301 a 500 unidades: S/40.
Desde 501 unidades: S/30.
<br>**Escenario 3: Configurar valores inválidos**</br>
Dado que ingreso una tasa o tarifa inválida. 
Cuando intento guardar. 
Entonces el sistema debe mostrar un mensaje de validación.
<br>**Reglas de negocio**</br>
- El IGV tendrá inicialmente un valor de 18 %.
- La serigrafía tendrá un mínimo de 20 unidades.
- Las tarifas se aplicarán por lote de 100 unidades y por color.
- El administrador podrá modificar las tarifas.
- La configuración será utilizada tanto por cotizaciones como por ventas.

<br>**US-018 — Configurar apariencia de la aplicación**</br>
Descripción:
Como administrador, quiero configurar el tema visual y el tamaño de fuente, para utilizar la aplicación de forma cómoda y accesible.
Criterios de aceptación
<br>**Escenario 1: Cambiar tema**</br>
Dado que el administrador se encuentra en configuración.
Cuando selecciona el tema claro u oscuro.
Entonces la interfaz debe actualizarse visualmente.
<br>**Escenario 2: Cambiar tamaño de fuente**</br>
Dado que el administrador selecciona un tamaño de fuente.
Cuando confirma la preferencia.
Entonces la aplicación debe utilizar el tamaño seleccionado.
<br>**Escenario 3: Mantener preferencias**</br>
Dado que el administrador configuró sus preferencias.
Cuando cierra y vuelve a abrir la aplicación.
Entonces el sistema debe conservarlas.
<br>**Reglas de negocio**</br>
- Las preferencias corresponden únicamente a la cuenta del negocio.
- El cambio de apariencia no debe afectar los datos ni las operaciones del negocio.

<br>**US-019 — Consultar resumen del negocio**</br>
Descripción:
Como administrador, quiero visualizar un resumen del negocio, para conocer rápidamente el estado del inventario y las ventas.
Criterios de aceptación
<br>**Escenario 1: Dashboard con información**</br>
Dado que existen productos, movimientos o ventas registradas.
Cuando el administrador accede al Dashboard.
Entonces el sistema debe mostrar los principales indicadores del negocio.
<br>**Escenario 2: Dashboard sin información**</br>
Dado que aún no existen productos ni ventas.
Cuando el administrador accede al Dashboard.
Entonces el sistema debe mostrar un estado vacío con indicaciones para comenzar.
<br>**Reglas de negocio**</br>
- El Dashboard debe mostrar información actualizada.
- Los indicadores deben pertenecer únicamente a la cuenta del negocio.
- El Dashboard no debe modificar información.
- Un producto se considerará con bajo stock cuando su stock actual sea menor o igual a 15 unidades.

<br>**US-020 — Registrar categoría**</br>
Descripción:
Como administrador, quiero registrar una categoría, para organizar los productos del negocio.
Criterios de aceptación
<br>**Escenario 1: Registro exitoso**</br>
Dado que el administrador se encuentra en el formulario de categorías.
Cuando ingresa un nombre válido y confirma el registro.
Entonces el sistema debe guardar la categoría.
<br>**Escenario 2: Categoría duplicada**</br>
Dado que ya existe una categoría con el mismo nombre.
Cuando el administrador intenta registrarla nuevamente.
Entonces el sistema debe mostrar un mensaje de error y no duplicarla.
<br>**Reglas de negocio**</br>
- El nombre de la categoría es obligatorio.
- No pueden existir categorías duplicadas dentro del mismo negocio.
- La categoría debe pertenecer a la cuenta del negocio.

<br>**US-021 — Registrar material**</br>
Descripción:
Como administrador, quiero registrar un material, para asociarlo a los productos y facilitar su búsqueda y organización.
Criterios de aceptación
<br>**Escenario 1: Registro exitoso**</br>
Dado que el administrador se encuentra en el formulario de materiales.
Cuando ingresa un nombre válido y confirma el registro.
Entonces el sistema debe guardar el material.
<br>**Escenario 2: Material duplicado**</br>
Dado que ya existe un material con el mismo nombre.
Cuando el administrador intenta registrarlo nuevamente.
Entonces el sistema debe mostrar un mensaje de error y no duplicarlo.
<br>**Reglas de negocio**</br>
- El nombre del material es obligatorio.
- No pueden existir materiales duplicados dentro del mismo negocio.
- El material debe pertenecer a la cuenta del negocio.

<br>**US-022 — Ajustar stock**</br>
Descripción:
Como administrador, quiero ajustar el stock por pérdida, daño o corrección, para mantener actualizado el inventario real del negocio.
Criterios de aceptación
<br>**Escenario 1: Ajuste exitoso**</br>
Dado que el producto existe.
Cuando el administrador selecciona el tipo de ajuste, ingresa una cantidad y registra el motivo.
Entonces el sistema debe actualizar el stock y guardar el movimiento.
<br>**Escenario 2: Stock insuficiente**</br>
Dado que el ajuste disminuye el stock por debajo de cero.
Cuando el administrador intenta confirmarlo.
Entonces el sistema debe rechazar la operación.
<br>**Escenario 3: Motivo incompleto**</br>
Dado que el administrador no selecciona un motivo.
Cuando intenta confirmar el ajuste.
Entonces el sistema debe solicitar la información faltante.
<br>**Reglas de negocio**</br>
- Los motivos permitidos serán pérdida, daño y corrección.
- La pérdida y el daño disminuirán el stock.
- La corrección podrá aumentar o disminuir el stock.
- La cantidad de ajuste no podrá superar 1 000 000 unidades por operación.
- Todo ajuste debe registrar producto, cantidad, motivo, fecha, stock anterior y stock posterior.
- El stock nunca puede ser negativo.

<br>**US-023 — Aplicar descuento**</br>
Descripción:
Como administrador, quiero aplicar un descuento opcional a una cotización o venta para ofrecer condiciones comerciales especiales a un cliente.
Criterios de aceptación:
<br>**Escenario 1: Operación sin descuento**</br>
Dado que no ingreso ningún descuento.
Cuando calculo una cotización o venta.
Entonces el sistema debe mantener el importe original.
<br>**Escenario 2: Descuento porcentual**</br>
Dado que selecciono el tipo porcentual.
Cuando ingreso un porcentaje válido.
Entonces el sistema debe calcular y mostrar el monto descontado.
<br>**Escenario 3: Descuento fijo**</br>
Dado que selecciono el tipo fijo.
Cuando ingreso un monto válido.
Entonces el sistema debe calcular y mostrar el descuento aplicado.
<br>**Escenario 4: Descuento superior al importe**</br>
Dado que ingreso un descuento fijo mayor al importe de la operación.
Cuando intento continuar. 
Entonces el sistema debe impedirlo.
<br>**Escenario 5: Dos descuentos simultáneos**</br>
Dado que ingreso un descuento porcentual y uno fijo.
Cuando intento continuar.
Entonces el sistema debe impedirlo.
<br>**Reglas de negocio**</br>
- El descuento es opcional.
- Solo se permite un descuento por operación.
- El descuento puede ser porcentual o fijo.
- El porcentaje debe estar entre 0 % y 100 %.
- El descuento fijo no puede ser negativo ni superar el importe permitido.
- Las cotizaciones no guardan el descuento.
- Las ventas deben guardar el tipo, valor y monto del descuento.

<br>**US-024 — Solicitar recuperación de contraseña**</br>
Descripción:
Como administrador, quiero solicitar la recuperación de mi contraseña mediante mi correo electrónico, para volver a acceder a la cuenta de mi negocio si olvidé mis credenciales.
Criterios de aceptación
<br>**Escenario 1: Correo registrado**</br>
Dado que el administrador se encuentra en el formulario de recuperación de contraseña.
Cuando ingresa un correo electrónico registrado y solicita la recuperación.
Entonces el sistema debe mostrar un mensaje genérico e iniciar el envío de un enlace de recuperación.
<br>**Escenario 2: Correo no registrado**</br>
Dado que el administrador ingresa un correo electrónico que no pertenece a una cuenta registrada.
Cuando solicita la recuperación.
Entonces el sistema debe mostrar el mismo mensaje genérico y no debe revelar si el correo existe.
<br>**Escenario 3: Correo inválido o incompleto**</br>
Dado que el administrador ingresa un correo vacío o con formato inválido.
Cuando intenta solicitar la recuperación.
Entonces el sistema debe mostrar un mensaje de validación y no debe iniciar el proceso.
<br>**Escenario 4: Solicitudes excesivas**</br>
Dado que se realizan varias solicitudes de recuperación en un periodo corto.
Cuando el administrador intenta solicitar otra recuperación.
Entonces el sistema debe limitar temporalmente la operación y mostrar un mensaje genérico.
<br>**Reglas de negocio**</br>
- El sistema no debe revelar si un correo está registrado.
- El enlace de recuperación debe enviarse únicamente por correo electrónico.
- El token debe ser aleatorio, de un solo uso y tener una expiración limitada.
- El token no debe almacenarse en texto plano ni registrarse en logs.
- El enlace debe utilizar HTTPS.
- El sistema debe limitar las solicitudes repetitivas.
- El correo no debe contener la contraseña actual.
- Una nueva solicitud podrá invalidar tokens anteriores.

<br>**US-025 — Restablecer contraseña**</br>
Descripción:
Como administrador, quiero establecer una nueva contraseña utilizando un enlace válido de recuperación, para recuperar el acceso seguro a la cuenta de mi negocio.
Criterios de aceptación
<br>**Escenario 1: Restablecimiento exitoso**</br>
Dado que el administrador posee un enlace de recuperación válido y vigente.
Cuando ingresa una nueva contraseña válida y la confirma correctamente.
Entonces el sistema debe actualizar la contraseña, invalidar el token y mostrar un mensaje de confirmación.
<br>**Escenario 2: Token inválido o expirado**</br>
Dado que el enlace de recuperación es inválido, fue utilizado o expiró.
Cuando el administrador intenta establecer una nueva contraseña.
Entonces el sistema debe rechazar la operación y solicitar una nueva recuperación.
<br>**Escenario 3: Contraseña no válida**</br>
Dado que el administrador ingresa una contraseña que no cumple los requisitos de seguridad.
Cuando intenta confirmar el cambio.
Entonces el sistema debe mostrar los requisitos incumplidos y no actualizar la contraseña.
<br>**Escenario 4: Contraseñas diferentes**</br>
Dado que el administrador ingresa dos contraseñas diferentes.
Cuando intenta confirmar el restablecimiento.
Entonces el sistema debe mostrar un mensaje de validación y no actualizar la contraseña.
<br>**Escenario 5: Uso repetido del token**</br>
Dado que el token ya fue utilizado correctamente.
Cuando el administrador intenta utilizarlo nuevamente.
Entonces el sistema debe rechazar la operación.
<br>**Reglas de negocio**</br>
- El token solo podrá utilizarse una vez.
- El token debe expirar después de un periodo definido.
- La nueva contraseña debe almacenarse mediante un hash seguro.
- La contraseña nunca debe enviarse en respuestas de la API ni registrarse en logs.
- Después de restablecer la contraseña, las sesiones activas anteriores deben revocarse.
- El administrador deberá iniciar sesión nuevamente después de restablecer la contraseña.
- El sistema no debe mostrar información técnica del token.

<br>**US-026 — Registrar una operación con múltiples productos**</br>
Descripción:
Como administrador, quiero agregar varios productos a una cotización o venta, para calcular o registrar una operación completa solicitada por el cliente.
Criterios de aceptación
<br>**Escenario 1: Agregar varios productos**</br>
Dado que el administrador se encuentra en el formulario de cotización o venta.
Cuando selecciona varios productos activos e ingresa una cantidad para cada uno.
Entonces el sistema debe mostrar cada producto como una línea independiente de la operación.
<br>**Escenario 2: Aplicar precios por producto**</br>
Dado que la operación contiene varios productos.
Cuando se calcula la operación.
Entonces el sistema debe aplicar el precio minorista o mayorista según la cantidad de cada producto.
<br>**Escenario 3: Cotización con múltiples productos**</br>
Dado que el administrador agregó varios productos a una cotización.
Cuando solicita el cálculo.
Entonces el sistema debe mostrar el subtotal, serigrafía, descuento, IGV y total de toda la operación sin modificar el stock ni guardar la cotización.
<br>**Escenario 4: Venta con stock suficiente**</br>
Dado que todos los productos tienen stock suficiente.
Cuando el administrador confirma la venta.
Entonces el sistema debe guardar la venta, registrar sus detalles y disminuir el stock de todos los productos correspondientes.
<br>**Escenario 5: Stock insuficiente en un producto**</br>
Dado que uno de los productos no tiene stock suficiente.
Cuando el administrador intenta confirmar la venta.
Entonces el sistema debe rechazar toda la operación y no modificar ningún producto ni registrar parcialmente la venta.
<br>**Escenario 6: Producto inactivo**</br>
Dado que uno de los productos seleccionados está desactivado.
Cuando el administrador intenta continuar con la cotización o venta.
Entonces el sistema debe impedir su selección o solicitar que sea reemplazado por un producto activo.
<br>**Escenario 7: Cancelar operación**</br>
Dado que el administrador agregó varios productos.
Cuando cancela la cotización o venta antes de confirmarla.
Entonces el sistema no debe guardar la operación ni modificar el stock.
<br>**Reglas de negocio**</br>
- Una operación debe contener al menos un producto.
- Una operación podrá contener como máximo 20 productos diferentes.
- Cada producto debe aparecer una sola vez dentro de la operación.
- Cada línea debe tener una cantidad entera mayor que cero.
- La cantidad máxima será de 1 000 000 unidades por línea.
- El precio minorista o mayorista se determinará por la cantidad de cada línea.
- La serigrafía se calculará por cada línea de producto y no se mezclarán cantidades de productos diferentes.
- Solo se podrán seleccionar productos activos.
- Una cotización no se guardará ni modificará el stock.
- Una venta confirmada guardará todos sus detalles.
- La venta y todos sus movimientos de inventario deben ejecutarse dentro de una única transacción.
- Si un producto no tiene stock suficiente, toda la venta debe rechazarse.
- El descuento será único para toda la operación.
- El descuento se aplicará antes del IGV.
- El backend debe recalcular todos los importes y no confiar en los valores enviados por el frontend.
