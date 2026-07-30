# Contexto de producto de Agilora

## Producto

Agilora es un SaaS multiempresa orientado a microempresas y pequeñas empresas que necesitan administrar productos, inventario, abastecimientos y operaciones comerciales sin depender de hojas de cálculo.

Cada negocio funciona como un tenant independiente. Un negocio puede tener un administrador y uno o varios operadores. Una misma aplicación puede atender negocios de empaques, bodegas, bazares, insumos gráficos u otras actividades que requieran catálogo e inventario.

## Product Goal

Permitir que un negocio registre y administre sus productos con la estructura que necesita, controle sus existencias y confirme operaciones comerciales de forma rápida, segura y trazable.

## Usuarios

### Administrador

Puede realizar todas las operaciones del negocio y, además:

- Invitar, bloquear y reactivar operadores.
- Configurar el negocio, precios, impuestos y costos adicionales.
- Consultar dashboard y reportes.
- Gestionar proveedores y reglas operativas.

### Operador

Puede realizar las operaciones autorizadas del día a día:

- Consultar y modificar inventario.
- Gestionar productos según las políticas del negocio.
- Registrar abastecimientos.
- Preparar operaciones comerciales y confirmar ventas.

No puede gestionar usuarios, configuración administrativa, dashboard ni reportes administrativos.

## Flujo comercial principal

1. El usuario busca y agrega uno o varios productos.
2. Ingresa cantidades y costos adicionales opcionales.
3. Aplica un descuento opcional.
4. Solicita una vista previa.
5. El backend obtiene precios y configuración actuales y recalcula los importes.
6. El usuario puede cancelar la operación o confirmar una venta.
7. Una venta confirmada se persiste y actualiza el stock dentro de una transacción.

La vista previa no se almacena. La venta confirmada sí.

## Catálogo

El negocio puede crear grupos, atributos y reglas de precio. No se imponen campos específicos de empaques. La serigrafía se implementará como un costo adicional configurable, no como una regla exclusiva del sistema.

## Inventario y abastecimiento

Todo cambio de stock debe originarse en un ingreso, abastecimiento, venta, cancelación de venta o ajuste justificado. El stock no puede ser negativo y los movimientos confirmados son inmutables.

## Datos y privacidad

El sistema debe almacenar únicamente los datos necesarios para operar. Las descripciones de ventas no deben utilizarse para registrar contraseñas, tarjetas ni información sensible innecesaria.
