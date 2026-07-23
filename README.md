# Aplicacion Web PackFlow

PackFlow es una aplicación web orientada a microempresas y pequeñas empresas dedicadas a la venta y distribución de empaques, como cajas y bolsas de diferentes medidas y materiales.
La aplicación permitirá administrar productos, consultar el stock disponible, simular cotizaciones y registrar ventas que actualicen automáticamente el inventario.

Para el desarrollo de PackFlow se implementaran las siguientes tecnologias:

- Vue.js
- JavaScript
- ASP.NET Core
- C#
- PostgreSQL
- Docker

## Problem Statement

El administrador de una microempresa o pequeña empresa dedicada a la venta y distribución de empaques necesita consultar rápidamente el stock disponible y elaborar cotizaciones para sus clientes.
Actualmente, debe acudir al almacén para verificar las existencias y utilizar cálculos manuales para obtener el subtotal, IGV y total de una cotización. Esta situación genera pérdida de tiempo, desplazamientos innecesarios, errores en las cantidades disponibles y posibles errores de cálculo. Por ello necesitan un sistema centralizadado, escalable, robusto y seguro que simplifique el proceso de consulta de stock y que optimice el proceso de cotizaciones.


## Hypothesis

Creemos que permitir al administrador consultar el inventario en tiempo real reducirá el tiempo empleado en las consultas de stock y los desplazamientos innecesarios al almacén.
Sabremos que esta hipótesis es válida cuando, durante el periodo de prueba, el tiempo de consulta de stock se reduzca en un 80 % y los desplazamientos innecesarios al almacén disminuyan en un 95 %.

Creemos que permitir al administrador simular cotizaciones mediante un formulario que calcule automáticamente el subtotal, IGV y total reducirá el tiempo empleado en la elaboración de cotizaciones y disminuirá los errores de cálculo. Sabremos que esta hipótesis es válida cuando, durante el periodo de prueba, el tiempo de elaboración de una cotización se reduzca en un 80 % y no se presenten errores en los cálculos generados por el sistema.

## Secciones de la Aplicacion Web

### Dashboard

Resumen del negocio, productos registrados, stock bajo, ventas recientes y movimientos recientes.

### Productos

Permite registrar, editar, activar y desactivar productos.

Cada producto puede incluir:

- Categoría.
- Nombre.
- Medidas.
- Material.
- Precio minorista.
- Precio mayorista.
- Stock inicial.

### Inventario

Permite buscar productos por nombre, medida, categoría o material, consultar el stock disponible, registrar ingresos de mercadería y consultar movimientos de inventario.

### Cotizador

Permite seleccionar un producto, ingresar la cantidad, aplicar serigrafía opcional y calcular el subtotal, IGV y total.

Las cotizaciones son simulaciones temporales. No se guardan ni modifican el stock.

### Ventas

Permite registrar una venta utilizando un flujo similar al cotizador.

Al confirmar una venta, la operación se guarda y el stock disminuye automáticamente.

### Configuración

Permite configurar los datos del negocio, la tasa del IGV, el valor de serigrafía, el tema visual, el tamaño de fuente y la contraseña de la cuenta.

## Reglas de negocio principales

1. Cada negocio tendrá una cuenta administradora independiente.
2. El administrador tendrá acceso completo a la aplicación.
3. El MVP no contempla múltiples usuarios ni roles avanzados.
4. El administrador será responsable de registrar y mantener sus propios productos.
5. Los productos podrán desactivarse mediante borrado lógico.
6. El stock nunca podrá ser negativo.
7. El ingreso de mercadería aumentará el stock.
8. Una venta confirmada disminuirá el stock.
9. Una cotización no modificará el stock.
10. Las cotizaciones no se guardarán.
11. Una venta confirmada sí se guardará.
12. La serigrafía será opcional.
13. El valor inicial de la serigrafía será de S/45 por color.
14. El valor de serigrafía se aplicará una sola vez al monto de la operación, no por cada unidad.
15. El IGV tendrá un valor inicial de 18 % y podrá configurarse.
16. Los productos tendrán precio minorista y precio mayorista.
17. La forma de aplicar el precio mayorista será definida durante el análisis detallado.



