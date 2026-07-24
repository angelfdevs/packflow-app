# Aplicación Web PackFlow

PackFlow es una aplicación web para microempresas y pequeñas empresas dedicadas a la venta y distribución de empaques, como cajas y bolsas de diferentes categorías, medidas y materiales.

La aplicación permitirá administrar productos, consultar el stock disponible, simular cotizaciones y registrar ventas que actualicen automáticamente el inventario.

## Tecnologías

- Vue.js y JavaScript.
- ASP.NET Core y C#.
- PostgreSQL.
- Docker.

## Problem Statement

El administrador de una microempresa o pequeña empresa dedicada a la venta y distribución de empaques necesita consultar rápidamente el stock disponible y elaborar cotizaciones para sus clientes.

Actualmente debe acudir al almacén para verificar las existencias y utilizar cálculos manuales para obtener el subtotal, IGV y total de una cotización. Esta situación genera pérdida de tiempo, desplazamientos innecesarios, errores en las cantidades disponibles y posibles errores de cálculo.

Por ello, el administrador necesita un sistema centralizado, escalable, robusto y seguro que simplifique la consulta de stock y optimice el proceso de cotización.

## Hypothesis

Creemos que permitir al administrador consultar el inventario en tiempo real reducirá el tiempo empleado en las consultas de stock y los desplazamientos innecesarios al almacén.

Sabremos que esta hipótesis es válida cuando, durante el periodo de prueba, el tiempo de consulta de stock se reduzca en un 80 % y los desplazamientos innecesarios al almacén disminuyan en un 95 %.

Creemos que permitir al administrador simular cotizaciones mediante un formulario que calcule automáticamente el subtotal, IGV y total reducirá el tiempo empleado en la elaboración de cotizaciones y disminuirá los errores de cálculo.

Sabremos que esta hipótesis es válida cuando, durante el periodo de prueba, el tiempo de elaboración de una cotización se reduzca en un 80 % y no se presenten errores en los cálculos generados por el sistema.

## Módulos principales

### Dashboard

Muestra productos activos, productos con stock bajo, ventas recientes y movimientos recientes.

### Productos

Permite registrar, editar, activar y desactivar productos. Cada producto puede incluir categoría, nombre, medidas, material, precio minorista y precio mayorista.

### Inventario

Permite consultar el stock, registrar ingresos de mercadería, registrar ajustes por pérdida, daño o corrección y consultar los movimientos históricos.

### Cotizador

Permite agregar uno o varios productos, ingresar cantidades, aplicar serigrafía opcional y registrar un descuento porcentual o fijo.

La cotización calcula productos, serigrafía, descuento, subtotal, IGV y total. Las cotizaciones son simulaciones temporales: no se guardan ni modifican el stock.

### Ventas

Permite registrar una operación con uno o varios productos utilizando las mismas reglas del cotizador. Al confirmar una venta, la operación se guarda y el stock disminuye automáticamente dentro de una transacción.

### Configuración

Permite configurar los datos del negocio, la tasa del IGV, las tarifas de serigrafía, el tema visual, el tamaño de fuente y la contraseña de la cuenta.

## Reglas de negocio principales

1. Cada negocio tendrá una cuenta administradora independiente.
2. El administrador tendrá acceso completo a la aplicación.
3. El administrador registrará y mantendrá sus propios productos, categorías y materiales.
4. Los productos podrán desactivarse mediante borrado lógico.
5. El stock nunca podrá ser negativo.
6. El stock inicial se registrará mediante un movimiento de ingreso.
7. Los ingresos aumentarán el stock.
8. Las ventas confirmadas disminuirán el stock.
9. Las cotizaciones no modificarán el stock ni se guardarán.
10. Las ventas confirmadas sí se guardarán.
11. De 1 a 100 unidades se aplicará el precio minorista.
12. Desde 101 unidades se aplicará el precio mayorista.
13. La serigrafía será opcional y solo podrá aplicarse desde 20 unidades por línea de producto.
14. La serigrafía se calculará por lotes de 100 unidades, incluyendo el lote parcial.
15. De 20 a 300 unidades se cobrará S/45 por color y lote.
16. De 301 a 500 unidades se cobrará S/40 por color y lote.
17. Desde 501 unidades se cobrará S/30 por color y lote.
18. El descuento será opcional, único por operación y podrá ser porcentual o fijo.
19. El descuento se aplicará antes del IGV.
20. El IGV tendrá un valor inicial de 18 % y podrá configurarse.

## Fuera de alcance

- Facturación electrónica.
- Integración con SUNAT.
- Pagos en línea.
- Notificaciones por correo o WhatsApp, excepto el correo técnico necesario para recuperar la contraseña.
- Predicción de demanda.
- Integración con tiendas virtuales.
- Gestión de múltiples usuarios por negocio.
- Gestión de roles avanzados.
- Historial de cotizaciones.
- Gestión contable.
- Reportes financieros avanzados.
- Control de insumos de serigrafía.

