<br>**RNF-001 — Seguridad de contraseñas**</br>
Descripción:
El sistema debe proteger las contraseñas de la cuenta administradora.
Criterios de aceptación
<br>**Escenario 1: Almacenamiento seguro**</br>
Dado que el administrador registra o cambia su contraseña.
Cuando el sistema guarda la información.
Entonces la contraseña no debe almacenarse en texto plano.
<br>**Escenario 2: Protección de la contraseña**</br>
Dado que existe una contraseña registrada.
Cuando se consulta la información de la cuenta.
Entonces la contraseña no debe mostrarse.
<br>**Restricciones técnicas**</br>
- Se debe utilizar un algoritmo seguro de hash.
- Las contraseñas no deben almacenarse en logs.
- La contraseña no debe enviarse en respuestas de la API.

<br>**RNF-002 — Persistencia y protección de la sesión**</br>
Descripción:
La sesión del administrador debe permanecer activa mientras utilice la aplicación y no presione explícitamente la opción de cerrar sesión.
Criterios de aceptación
<br>**Escenario 1: Sesión persistente**</br>
Dado que el administrador inició sesión correctamente.
Cuando continúa utilizando la aplicación.
Entonces la sesión debe permanecer activa sin cerrarse automáticamente por inactividad.
<br>**Escenario 2: Registro de venta**</br>
Dado que el administrador está completando una venta.
Cuando transcurre un periodo prolongado sin interacción.
Entonces el sistema no debe cerrar la sesión ni perder la información ingresada.
<br>**Escenario 3: Cierre de sesión manual**</br>
Dado que el administrador tiene una sesión activa.
Cuando selecciona la opción de cerrar sesión.
Entonces el sistema debe finalizar la sesión y redirigirlo al inicio de sesión.
<br>**Escenario 4: Revocación por seguridad**</br>
Dado que la cuenta fue desactivada, la contraseña fue modificada o se detectó una situación de seguridad.
Cuando el sistema intenta validar la sesión.
Entonces puede invalidar la sesión y solicitar un nuevo inicio de sesión.
<br>**Restricciones técnicas**</br>
- No debe existir cierre automático por inactividad durante el uso normal.
- La sesión debe renovarse de forma segura sin interrumpir al usuario.
- Después de cerrar sesión, la sesión anterior no debe permitir acceder a módulos protegidos.
- La sesión debe poder revocarse por razones de seguridad.
- La información de formularios importantes debería conservarse temporalmente ante una interrupción de red.
- El sistema debe limitar temporalmente los intentos fallidos consecutivos de inicio de sesión.
- La sesión solo debe invalidarse por cierre manual, cambio de contraseña, desactivación de cuenta o una razón de seguridad.
- La información de formularios importantes debe conservarse temporalmente ante una interrupción de red.

<br>**RNF-003 — Separación de información por negocio**</br>
Descripción:
La información de cada negocio debe permanecer aislada de cualquier otra cuenta.
Criterios de aceptación
<br>**Escenario 1: Consulta de información propia**</br>
Dado que el administrador inició sesión.
Cuando consulta productos, ventas o movimientos.
Entonces el sistema debe mostrar únicamente información de su negocio.
<br>**Escenario 2: Acceso a información externao**</br>
Dado que una cuenta intenta acceder a un recurso de otro negocio.
Cuando realiza la solicitud.
Entonces el sistema debe rechazarla.
<br>**Restricciones técnicas**</br>
- Cada cuenta administradora debe representar a un negocio.
- Los productos, ventas, movimientos y configuraciones deben asociarse a una cuenta.
- El backend debe verificar la propiedad de cada recurso.
- Nunca se debe confiar únicamente en el identificador enviado por el frontend.

<br>**RNF-004 — Protección de secretos**</br>
Descripción:
Las credenciales, claves y configuraciones sensibles deben protegerse durante el desarrollo y el despliegue.
Criterios de aceptación
<br>**Escenario 1: Ejecución en producción**</br>
Dado que la aplicación se encuentra desplegada.
Cuando el backend se conecta a la base de datos.
Entonces debe utilizar variables de entorno o un gestor de secretos.
<br>**Escenario 2: Repositorio**</br>
Dado que el código fuente se encuentra almacenado en Git.
Cuando se revisan los archivos versionados.
Entonces no deben existir contraseñas ni claves reales.
<br>**Restricciones técnicas**</br>
- Los archivos .env no deben subirse al repositorio.
- Debe existir un archivo de ejemplo sin valores reales.
- La aplicación debe utilizar HTTPS en producción.
- Los secretos no deben almacenarse en logs.

<br>**RNF-005 — Validación de datos**</br>
Descripción:
La aplicación debe validar toda la información ingresada por el administrador.
Criterios de aceptación
<br>**Escenario 1: Datos inválidos**</br>
Dado que el administrador ingresa datos fuera del formato permitido.
Cuando intenta guardar la información.
Entonces el sistema debe mostrar un mensaje de validación y rechazar la operación.
<br>**Escenario 2: Datos incompletos**</br>
Dado que existen campos obligatorios vacíos.
Cuando el administrador intenta confirmar la operación.
Entonces el sistema debe indicar los campos pendientes.
<br>**Restricciones técnicas**</br>
- La validación debe realizarse en frontend y backend.
- Las consultas a la base de datos deben utilizar parámetros seguros.
- Los errores internos no deben mostrarse al usuario.
- Los precios, cantidades, medidas y porcentajes deben validar sus rangos permitidos.

<br>**RNF-006 — Integridad del inventario**</br>
Descripción:
Las operaciones de ingreso, venta y ajuste deben mantener el stock consistente.
Criterios de aceptación
<br>**Escenario 1: Venta con stock suficiente**</br>
Dado que el producto tiene stock suficiente.
Cuando el administrador confirma una venta.
Entonces el sistema debe registrar la venta y disminuir el stock correctamente.
<br>**Escenario 2: Venta con stock insuficiente**</br>
Dado que la cantidad solicitada supera el stock disponible.
Cuando el administrador intenta confirmar la venta.
Entonces el sistema debe rechazar la operación y no modificar el stock.
<br>**Restricciones técnicas**</br>
- La venta, el movimiento de salida y la disminución del stock deben ejecutarse como una sola operación.
- El sistema nunca debe permitir stock negativo.
- El backend debe verificar el stock al confirmar la venta.
- Una misma solicitud de venta no debe registrarse dos veces si se reenvía accidentalmente.
- Las operaciones de inventario deben ejecutarse mediante transacciones.

<br>**RNF-007 — Precisión de cálculos monetarios**</br>
Descripción:
Los cálculos de precios, serigrafía, subtotal, IGV y total deben ser exactos y consistentes.
Criterios de aceptación
<br>**Escenario 1: Cálculo consistente**</br>
Dado que el administrador selecciona un producto y una cantidad.
Cuando realiza una cotización o venta.
Entonces el frontend y el backend deben obtener el mismo resultado.
<br>**Escenario 2: Redondeo**</br>
Dado que el sistema calcula importes monetarios.
Cuando muestra los resultados.
Entonces debe utilizar dos decimales.
<br>**Restricciones técnicas**</br>
- Si la cantidad es 1, debe utilizarse el precio minorista.
- Si la cantidad es igual o mayor que 2, debe utilizarse el precio mayorista.
- La serigrafía solo puede aplicarse cuando la cantidad sea múltiplo de 100.
- El costo de serigrafía debe ser: bloques de 100 × colores × valor configurado.
- Si la cantidad no es múltiplo de 100, la serigrafía debe permanecer deshabilitada.
- La base de datos debe utilizar tipos decimales para los importes.
- No se deben utilizar números de punto flotante para almacenar dinero.
- El backend debe validar el cálculo final.

<br>**RNF-008 — Trazabilidad de operaciones**</br>
Descripción:
El sistema debe conservar información suficiente sobre las operaciones que modifican el inventario y las ventas realizadas.
Criterios de aceptación
<br>**Escenario 1: Movimiento registrado**</br>
Dado que se registra un ingreso, venta o ajuste.
Cuando la operación finaliza correctamente.
Entonces el sistema debe guardar producto, cantidad, tipo, fecha y motivo cuando corresponda.
<br>**Escenario 2: Consulta histórica**</br>
Dado que existen movimientos registrados.
Cuando el administrador consulta el historial.
Entonces debe visualizar la información de cada movimiento.
<br>**Restricciones técnicas**</br>
- Los movimientos y ventas confirmadas no deben eliminarse físicamente.
- Los registros históricos no deben modificarse desde operaciones comunes.
- Los productos desactivados deben conservar sus relaciones históricas.
- Los ajustes deben conservar el motivo registrado.

<br>**RNF-009 — Rendimiento**</br>
Descripción:
Las operaciones frecuentes deben responder rápidamente durante el uso normal de la aplicación.
Criterios de aceptación
<br>**Escenario 1: Búsqueda de productos**</br>
Dado que existen productos registrados.
Cuando el administrador realiza una búsqueda.
Entonces los resultados deberían mostrarse en aproximadamente dos segundos bajo condiciones normales.
<br>**Escenario 2: Cálculo de operación**</br>
Dado que el administrador completa los datos de una cotización o venta.
Cuando solicita el cálculo.
Entonces los importes deben mostrarse sin retrasos perceptibles.
<br>**Restricciones técnicas**</br>
- Las consultas deben estar optimizadas.
- Las búsquedas deben utilizar filtros adecuados.
- No deben cargarse datos innecesarios en cada pantalla.
- Las listas extensas deben utilizar paginación o carga progresiva cuando sea necesario.
- Las búsquedas y cálculos deberían responder en aproximadamente dos segundos bajo condiciones normales de operación.
- El tiempo debe medirse considerando frontend, backend y base de datos.

<br>**RNF-010 — Manejo de errores**</br>
Descripción:
La aplicación debe informar claramente cuando una operación no puede completarse.
Criterios de aceptación
<br>**Escenario 1: Error controlado**</br>
Dado que ocurre un error durante una operación.
Cuando el sistema procesa la solicitud.
Entonces debe mostrar un mensaje comprensible para el administrador.
<br>**Escenario 2: Error interno**</br>
Dado que ocurre una falla interna del servidor.
Cuando el sistema responde al usuario.
Entonces no debe mostrar detalles técnicos sensibles.
<br>**Restricciones técnicas**</br>
- Los errores deben registrarse internamente.
- Las respuestas de error deben utilizar códigos HTTP adecuados.
- La aplicación no debe mostrar trazas técnicas al usuario.
- Los errores de una operación no deben dejar datos parcialmente guardados.

<br>**RNF-011 — Copias de seguridad y recuperación**</br>
Descripción:
La información de productos, inventario, ventas y configuraciones debe contar con mecanismos de respaldo.
Criterios de aceptación
<br>**Escenario 1: Copia de seguridad**</br>
Dado que la aplicación se encuentra en producción.
Cuando llega el periodo configurado para el respaldo.
Entonces el sistema debe generar una copia de seguridad válida.
<br>**Escenario 2: Restauración**</br>
Dado que ocurre una pérdida o corrupción de datos.
Cuando se ejecuta el procedimiento de recuperación.
Entonces la información debe poder restaurarse desde una copia válida.
<br>**Restricciones técnicas**</br>
- Las copias deben realizarse como mínimo diariamente.
- Los respaldos deben conservarse durante al menos siete días.
- Debe definirse un tiempo máximo de recuperación.
- Debe definirse la cantidad máxima de información que podría perderse.

<br>**RNF-012 — Diseño responsive**</br>
Descripción:
La aplicación debe poder utilizarse correctamente desde computadoras, tablets y teléfonos.
Criterios de aceptación
<br>**Escenario 1: Pantalla grande**</br>
Dado que el administrador utiliza una computadora.
Cuando accede a cualquier módulo.
Entonces la interfaz debe mostrar correctamente sus elementos.
<br>**Escenario 2: Pantalla pequeña**</br>
Dado que el administrador utiliza un teléfono o tablet.
Cuando accede a cualquier módulo.
Entonces la interfaz debe adaptarse sin perder funcionalidad.
<br>**Restricciones técnicas**</br>
- La interfaz debe utilizar diseño responsive.
- Los botones y formularios deben ser utilizables en pantallas táctiles.
- Las tablas deben adaptarse o permitir desplazamiento horizontal.
- Las acciones principales deben permanecer disponibles en pantallas pequeñas.

<br>**RNF-013 — Accesibilidad y preferencias visuales**</br>
Descripción:
La aplicación debe facilitar una interacción cómoda y accesible para el administrador.
Criterios de aceptación
<br>**Escenario 1: Tema visual**</br>
Dado que el administrador selecciona el tema claro u oscuro.
Cuando confirma la preferencia.
Entonces la interfaz debe actualizarse correctamente.
<br>**Escenario 2: Tamaño de fuente**</br>
Dado que el administrador modifica el tamaño de fuente.
Cuando guarda la preferencia.
Entonces la aplicación debe conservarla.
<br>**Restricciones técnicas**</br>
- Los controles principales deben tener etiquetas claras.
- La interfaz debe mantener contraste suficiente.
- Los errores no deben comunicarse únicamente mediante colores.
- Los elementos principales deben poder utilizarse mediante teclado.
- Las preferencias visuales no deben modificar los datos del negocio.

<br>**RNF-014 — Mantenibilidad**</br>
Descripción:
El código debe organizarse de manera que pueda mantenerse, probarse y ampliarse.
Criterios de aceptación
<br>**Escenario 1: Separación de responsabilidades**</br>
Dado que se agrega una nueva funcionalidad.
Cuando se implementa en el sistema.
Entonces debe ubicarse en el módulo y capa correspondiente.
<br>**Escenario 2: Modificación de un módulos**</br>
Dado que se modifica un módulo.
Cuando se ejecuta la aplicación.
Entonces los demás módulos no deben verse afectados innecesariamente.
<br>**Restricciones técnicas**</br>
- El backend debe organizarse mediante capas o módulos.
- Las reglas de negocio deben estar en el backend.
- Las migraciones deben mantenerse versionadas.
- Las decisiones técnicas importantes deben documentarse.
- Debe evitarse duplicar reglas de cálculo entre frontend y backend.

<br>**RNF-015 — Pruebas**</br>
Descripción:
Las reglas críticas de PackFlow deben verificarse mediante pruebas automatizadas y manuales.
Criterios de aceptación
<br>**Escenario 1: Pruebas de cálculos**</br>
Dado que existen diferentes cantidades, precios y colores de serigrafía.
Cuando se ejecutan las pruebas.
Entonces los resultados deben coincidir con las reglas definidas.
<br>**Escenario 2: Pruebas de inventario**</br>
Dado que existen ingresos, ventas y ajustes.
Cuando se ejecutan las pruebas.
Entonces el stock debe actualizarse correctamente y nunca ser negativo.
<br>**Restricciones técnicas**</br>
- Las reglas críticas deben contar con pruebas unitarias.
- Los flujos principales deben contar con pruebas de integración.
- Las historias de usuario deben verificarse mediante sus criterios de aceptación.
- Deben probarse los escenarios exitosos y los escenarios de error.

<br>**RNF-016 — Documentación técnica**</br>
Descripción:
El sistema debe contar con documentación suficiente para facilitar su desarrollo, despliegue y mantenimiento.
Criterios de aceptación
<br>**Escenario 1: Documentación de la API**</br>
Dado que existe una funcionalidad disponible en el backend.
Cuando se consulta la documentación técnica.
Entonces debe encontrarse su endpoint, parámetros y respuestas.
<br>**Escenario 2: Ejecución del proyecto**</br>
Dado que un desarrollador obtiene el código fuente.
Cuando sigue la documentación del proyecto.
Entonces debe poder ejecutar la aplicación localmente.
<br>**Restricciones técnicas**</br>
- La API debe documentarse mediante OpenAPI/Swagger.
- Las variables de entorno deben documentarse.
- El proceso de despliegue debe documentarse.
- La documentación debe mantenerse junto con el código.
- Las instrucciones deben mantenerse actualizadas.

<br>**RNF-017 — Configuración regional**</br>
Descripción:
La aplicación debe utilizar formatos adecuados para el contexto del negocio.
Criterios de aceptación
<br>**Escenario 1: Valores monetarios**</br>
Dado que el sistema muestra precios o totales.
Cuando el administrador consulta la información.
Entonces los importes deben mostrarse en soles peruanos.
<br>**Escenario 2: Fechas y horarios**</br>
Dado que el sistema registra una venta o movimiento.
Cuando muestra la fecha y hora.
Entonces debe utilizar la zona horaria configurada para el negocio.
<br>**Restricciones técnicas**</br>
- La moneda principal será el sol peruano.
- La interfaz utilizará el idioma español.
- Las fechas utilizarán la zona horaria `America/Lima`.

<br>**RNF-018 — Monitoreo y registros**</br>
Descripción:
El sistema debe permitir detectar errores y revisar el estado de la aplicación en producción.
Criterios de aceptación
<br>**Escenario 1: Estado de la aplicación**</br>
Dado que la aplicación se encuentra desplegada.
Cuando se consulta su estado.
Entonces debe poder verificarse si el backend está disponible.
<br>**Escenario 2: Error de aplicación**</br>
Dado que ocurre un error inesperado.
Cuando el sistema procesa la operación.
Entonces debe registrar información suficiente para investigarlo sin incluir datos sensibles.
<br>**Restricciones técnicas**</br>
- El backend debe contar con un endpoint de health check.
- Los logs deben incluir fecha, nivel y contexto del error.
- Los logs no deben incluir contraseñas, tokens ni secretos.
- Deben existir mecanismos para revisar errores de producción.
- El monitoreo debe comprobar frontend, backend y base de datos.
- La aplicación debe considerarse no disponible si cualquiera de sus componentes esenciales no responde.
- La medición debe realizarse mediante un monitor externo.

<br>**RNF-019 — Privacidad de la información**</br>
Descripción:
La información real del negocio debe mantenerse privada y no debe exponerse en el código fuente, repositorios públicos, logs ni demostraciones.
Criterios de aceptación
<br>**Escenario 1: Datos de producción**</br>
Dado que existen productos, ventas y movimientos reales.
Cuando se publica documentación o código del proyecto.
Entonces no deben incluirse datos reales del negocio.
<br>**Escenario 2: Demostración pública**</br>
Dado que se crea una versión pública para el portafolio.
Cuando se configura la demostración.
Entonces debe utilizar datos ficticios y credenciales de demostración.
<br>**Restricciones técnicas**</br>
- No se deben almacenar datos reales en el repositorio público.
- Los logs no deben contener información sensible.
- La base de datos de demostración debe estar separada de producción.
- Las credenciales reales nunca deben compartirse.
- Los secretos deben eliminarse inmediatamente si son expuestos accidentalmente.

<br>**RNF-020 — Disponibilidad de la aplicación**</br>
Descripción:
PackFlow debe estar disponible para el administrador al menos el 99.99 % del tiempo durante cada mes.
Criterios de aceptación
<br>**Escenario 1: Aplicación disponible**</br>
Dado que el administrador intenta acceder a PackFlow.
Cuando el frontend, backend y base de datos están operativos.
Entonces la aplicación debe permitir el acceso y uso de sus funciones principales.
<br>**Escenario 2: Interrupción del servicio**</br>
Dado que ocurre una interrupción en la aplicación.
Cuando el sistema de monitoreo detecta la falla.
Entonces debe registrar el incidente y notificarlo para iniciar su recuperación.
<br>**Restricciones técnicas**</br>
- La aplicación debe alcanzar una disponibilidad mensual mínima del 99.99 %.
- La medición debe considerar el funcionamiento completo del frontend, backend y base de datos.
- La aplicación no debe considerarse disponible si el frontend carga, pero la API o la base de datos no responden.
- Los despliegues deben minimizar la interrupción del servicio.
- El monitoreo debe comprobar frontend, backend y base de datos.
- La aplicación debe considerarse no disponible si cualquiera de sus componentes esenciales no responde.
- La medición debe realizarse mediante un monitor externo.
