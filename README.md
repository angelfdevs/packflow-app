# Aplicacion Web PackFlow

PackFlow es una aplicacion web orientada a servir de apoyo a microempresas y pequeñas empresas dedicadas al rubro de la venta y distribucion de empaques (cajas y bolsas de diferentes medidades y materiales de fabricacion) personalizables usando serigrafia e impresion offset. La aplicacion le dara la capacidad al usuario de poder consultar, disminuir e incrementar las cantidades de stock que posee en su negocio acerca de un producto en especifico. Ademas, el usuario podra simular cotizaciones de productos para obtener el subtotal, IGV y total de cada cotizacion. 

Para el desarrollo de PackFlow se implementaran las siguientes tecnologias:

- Vue.js
- JavaScript
- ASP.NET
- C#
- PostgreSQL

## Problem Statement

Los trabajadores y propietarios de microempresas y pequeñas empresas tienen dificultades al momento de consultar su inventario, debido a que deben acudir a su almacen y verificar si realmente tienen o no el producto en stock solicitado por sus clientes. Ademas, cuando el propietario o trabajador desean realizar cotizaciones acerca de los productos solicitados por el cliente, estos deben recurrir a utilizar una hoja de papel y calcular manualmente el subtotal, IGV y total de la cotizacion. Esto genera errores en las cantidades disponibles de productos, perdida de informacion, vulnerabilidad ante malos calculos, desgaste fisico innecesario y perdida de tiempo para el propietario y el cliente. Por ello necesitan un sistema centralizadado, escalable, robusto y seguro que simplifique el proceso de consulta de stock y que optimice el proceso de cotizaciones.


## Hypothesis

Creo que permitir a los propietarios o trabajadores consultar su inventario en tiempo real reducira el tiempo y desplazamientos innecesarios al almacén por consulta. Sabre que la hipotesis es valida cuando los usuarios de la aplicacion manifiesten haber reducido el tiempo de consultas de stock en un 80% y el desgaste fisico producido por acudir al almacen se haya reducido en un 95%.

Creo que permitir a los propietarios o trabajadores realizar cotizaciones de productos sin tener que recurrir a la revision del costo de productos o calculos realizados manualmente reducira el tiempo de cada cotizacion. Sabre que la hipotesis es valida cuando los usuarios de la aplicacion manifiesten haber reducido el tiempo de cotizacion en un 80%.


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



