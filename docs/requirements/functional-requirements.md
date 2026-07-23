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
- Solo podrá acceder una cuenta administradora por negocio.
- Las contraseñas deben almacenarse de forma segura.
- El sistema no debe revelar si el correo o la contraseña son incorrectos, en su lugar indica que uno de los campos de inicio de sesion son incorrectos.

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
Como administrador, quiero registrar un producto, para incorporarlo al catálogo del negocio y utilizarlo en consultas, cotizaciones y ventas.
Criterios de aceptación
<br>**Escenario 1: Registro exitoso**</br>
Dado que el administrador se encuentra en el formulario de productos.
Cuando completa correctamente los datos obligatorios.
Entonces el sistema debe registrar el producto y mostrar un mensaje de confirmación.
<br>**Escenario 2: Datos obligatorios incompletos**</br>
Dado que el administrador se encuentra en el formulario de productos.
Cuando intenta guardar el producto sin completar los campos obligatorios.
Entonces el sistema debe mostrar los campos pendientes y no registrar el producto.
<br>**Escenario 3: Datos inválidos**</br>
Dado que el administrador ingresa precios o stock negativos.
Cuando intenta guardar el producto.
Entonces el sistema debe mostrar un mensaje de validación y rechazar el registro.
<br>**Reglas de negocio**</br>
- El producto debe tener categoría, nombre, medidas, material, precio minorista, precio mayorista y stock inicial.
- El stock inicial no puede ser negativo.
- Los precios no pueden ser negativos.
- El producto debe pertenecer a la cuenta del negocio.

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
<br>**Reglas de negocio**</br>
- La desactivación debe realizarse mediante borrado lógico.
- Los productos desactivados no deben eliminarse físicamente.
- Las ventas históricas relacionadas con el producto deben conservarse.

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
Como administrador, quiero ingresar directamente la cantidad de productos, para cotizar pedidos grandes de manera rápida.
Criterios de aceptación
<br>**Escenario 1: Ingreso directo de cantidad**</br>
Dado que el administrador seleccionó un producto.
Cuando ingresa una cantidad válida.
Entonces el sistema debe actualizar el cálculo de la cotización.
<br>**Escenario 2: Uso de botones auxiliares**</br>
Dado que el administrador ingresó una cantidad.
Cuando utiliza los botones de aumento o disminución.
Entonces el sistema debe actualizar la cantidad y recalcular los importes.
<br>**Escenario 3: Cantidad inválida**</br>
Dado que el administrador ingresa una cantidad igual o menor que cero.
Cuando intenta continuar.
Entonces el sistema debe mostrar un mensaje de validación.
<br>**Reglas de negocio**</br>
- La cantidad debe ser un número entero mayor que cero.
- El administrador debe poder escribir directamente la cantidad.
- La cotización no debe modificar el stock.
- La cotización es una simulación y no modifica el stock.
- La disponibilidad del producto se consulta desde el módulo Inventario.
- La cotización no debe bloquearse por falta de stock.
- Si la cantidad es 1, se aplica el precio minorista.
- Si la cantidad es igual o mayor que 2, se aplica el precio mayorista.
- El precio se aplica automáticamente según la cantidad ingresada.


<br>**US-012 — Aplicar serigrafía**</br>
Descripción:
Como administrador, quiero aplicar serigrafía de forma opcional y seleccionar la cantidad de colores, para calcular correctamente el precio solicitado por el cliente.
Criterios de aceptación
<br>**Escenario 1: Cotización sin serigrafía**</br>
Dado que el administrador no activa la serigrafía.
Cuando realiza la cotización.
Entonces el sistema no debe agregar ningún recargo.
<br>**Escenario 2: Serigrafía de un color**</br>
Dado que el administrador activa la serigrafía y selecciona la cantidad de colores.
Cuando el sistema recalcula la operación.
Entonces debe agregar el valor configurado para la cantidad de colores seleccionados.
<br>**Escenario 3: Cantidad de colores inválida**</br>
Dado que el administrador activó la serigrafía.
Cuando ingresa una cantidad de colores igual o menor que cero.
Entonces el sistema debe mostrar un mensaje de validación y no agregar el recargo.
<br>**Escenario 4: Cantidad no válida para serigrafía**</br>
Dado que el administrador ingresó una cantidad que no es múltiplo de 100.
Cuando intenta activar la serigrafía.
Entonces el sistema debe impedir la operación y mostrar un mensaje indicando que la serigrafía solo aplica a cantidades múltiplos de 100.
<br>**Reglas de negocio**</br>
- La serigrafía solo está disponible para cantidades múltiplos de 100.
- Cada bloque de 100 unidades genera un recargo de S/45 por color.
- Costo de serigrafía = bloques de 100 × cantidad de colores × valor por color.
- Si la cantidad no es múltiplo de 100, el sistema no debe permitir aplicar serigrafía.
- El recargo de serigrafía no se multiplica directamente por cada unidad.

<br>**US-013 — Calcular cotización**</br>
Descripción:
Como administrador, quiero obtener el subtotal, IGV y total de una cotización, para informar correctamente el precio al cliente.
Criterios de aceptación
<br>**Escenario 1: Cálculo exitoso**</br>
Dado que el administrador seleccionó un producto e ingresó una cantidad válida.
Cuando solicita el cálculo.
Entonces el sistema debe mostrar el subtotal, IGV y total.
<br>**Escenario 2: Cálculo con serigrafía**</br>
Dado que el administrador activó la serigrafía.
Cuando solicita el cálculo.
Entonces el sistema debe incluir el recargo correspondiente.
<br>**Escenario 3: Datos incompletos**</br>
Dado que no se seleccionó un producto o cantidad.
Cuando el administrador intenta calcular.
Entonces el sistema debe solicitar la información faltante.
<br>**Reglas de negocio**</br>
- Si no se aplica serigrafía, el costo de serigrafía es S/0.
- Precio de productos = precio unitario aplicable × cantidad
- Si se aplica serigrafía, bloques de serigrafía = cantidad ÷ 100.
- Costo de serigrafía = bloques de serigrafía × colores × valor por color.
- Subtotal = precio de productos + costo de serigrafía
- IGV = subtotal × tasa configurada
- Total = subtotal + IGV
- Las cotizaciones no se guardan.
- Si la cantidad es 1, se aplica el precio minorista.
- Si la cantidad es igual o mayor que 2, se aplica el precio mayorista.
- El precio se aplica automáticamente según la cantidad ingresada.


<br>**US-014 — Registrar venta**</br>
Descripción:
Como administrador, quiero registrar una venta, para conservar un control de las operaciones realizadas por el negocio.
Criterios de aceptación
<br>**Escenario 1: Registro exitoso**</br>
Dado que el administrador seleccionó un producto y una cantidad válida.
Cuando confirma la venta.
Entonces el sistema debe registrar la venta y mostrar un mensaje de confirmación.
<br>**Escenario 2: Datos incompletos**</br>
Dado que falta seleccionar un producto o ingresar una cantidad.
Cuando el administrador intenta confirmar la venta.
Entonces el sistema debe mostrar los campos pendientes.
<br>**Escenario 3: Venta cancelada**</br>
Dado que el administrador está revisando los datos de la venta.
Cuando cancela la operación.
Entonces el sistema no debe registrar la venta ni modificar el stock.
<br>**Reglas de negocio**</br>
- Solo se deben registrar ventas confirmadas.
- La venta debe conservar producto, cantidad, precios, serigrafía, subtotal, IGV, total y fecha.
- Una venta cancelada no debe generar movimientos de stock.

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

<br>**US-017 — Configurar IGV y serigrafía**</br>
Descripción:
Como administrador, quiero configurar la tasa del IGV y el valor de la serigrafía, para mantener actualizados los cálculos de la aplicación.
Criterios de aceptación
<br>**Escenario 1: Configuración exitosa**</br>
Dado que el administrador se encuentra en la configuración.
Cuando ingresa valores válidos y confirma los cambios.
Entonces el sistema debe guardar la nueva configuración.
<br>**Escenario 2: Valores inválidos**</br>
Dado que el administrador ingresa valores negativos o inválidos.
Cuando intenta guardar la configuración.
Entonces el sistema debe mostrar un error y conservar la configuración anterior.
<br>**Reglas de negocio**</br>
- El IGV tendrá un valor inicial de 18 %.
- La serigrafía tendrá un valor inicial de S/45 por cada bloque de 100 unidades y por color.
- Los valores configurados se utilizarán en nuevas cotizaciones y ventas.
- Las ventas anteriores deben conservar sus valores originales.

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
- Todo ajuste debe registrar producto, cantidad, motivo, fecha, stock anterior y stock posterior.
- El stock nunca puede ser negativo.
