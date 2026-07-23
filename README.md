# Aplicacion Web PackFlow

PackFlow es una aplicación web orientada a microempresas y pequeñas empresas dedicadas a la venta y distribución de empaques, como cajas y bolsas de diferentes medidas y materiales.
La aplicación permitirá administrar productos, consultar el stock disponible, simular cotizaciones y registrar ventas que actualicen automáticamente el inventario.

Para el desarrollo de PackFlow se implementaran las siguientes tecnologias:

- Vue.js
- JavaScript
- ASP.NET
- C#
- PostgreSQL

## Problem Statement

El administrador de una microempresa o pequeña empresa dedicada a la venta y distribución de empaques necesita consultar rápidamente el stock disponible y elaborar cotizaciones para sus clientes.
Actualmente, debe acudir al almacén para verificar las existencias y utilizar cálculos manuales para obtener el subtotal, IGV y total de una cotización. Esta situación genera pérdida de tiempo, desplazamientos innecesarios, errores en las cantidades disponibles y posibles errores de cálculo. Por ello necesitan un sistema centralizadado, escalable, robusto y seguro que simplifique el proceso de consulta de stock y que optimice el proceso de cotizaciones.


## Hypothesis

Creemos que permitir al administrador consultar el inventario en tiempo real reducirá el tiempo empleado en las consultas de stock y los desplazamientos innecesarios al almacén.
Sabremos que esta hipótesis es válida cuando, durante el periodo de prueba, el tiempo de consulta de stock se reduzca en un 80 % y los desplazamientos innecesarios al almacén disminuyan en un 95 %.

Creemos que permitir al administrador simular cotizaciones mediante un formulario que calcule automáticamente el subtotal, IGV y total reducirá el tiempo empleado en la elaboración de cotizaciones y disminuirá los errores de cálculo. Sabremos que esta hipótesis es válida cuando, durante el periodo de prueba, el tiempo de elaboración de una cotización se reduzca en un 80 % y no se presenten errores en los cálculos generados por el sistema.


## MVP

### Objetivo

El MVP de PackFlow tiene como objetivo validar si una aplicación web puede reducir el tiempo empleado en la consulta de stock y en la elaboración de cotizaciones para negocios dedicados a la venta y distribución de empaques.

### Publico Objetivo 

El MVP estará dirigido a propietarios y trabajadores autorizados de microempresas y pequeñas empresas dedicadas a la venta de cajas, bolsas y otros productos de empaque.

### Requisitos Funcionales

- Autenticacion de usuarios
- Registro de productos
- Incremento de Stock
- Disminucion de Sotck
- Eliminacion de productos
- Creacion de cotizaciones
- Seleccion de productos y cantidades
- Opcion a seleccionar serigrafia o impresion offset
- Calculo automatico de subtotal, IGV y total
- Consulta de cotizaciones generadas

### Fuera de Alcance 

- Facturacion electronica
- Integracion con SUNAT
- Pagos online
- Notificaciones por correo o WhatsApp
- Prediccion de demanda
- Integracion con tiendas virtuales



