# User flows de Agilora

## Inicio de sesión

```text
Abrir Agilora
  -> Obtener CSRF
  -> Intentar renovar sesión
  -> Si no existe sesión, mostrar login
  -> Validar credenciales
  -> Cargar membresía, rol y negocio
  -> Redirigir según rol
```

## Invitar operador

```text
Administrador
  -> Usuarios
  -> Invitar operador
  -> Ingresar correo y confirmar rol
  -> Backend crea invitación con token de un solo uso
  -> Operador acepta invitación
  -> Define contraseña
  -> Membresía queda activa
```

## Registrar producto

```text
Usuario autorizado
  -> Catálogo
  -> Crear grupo o seleccionar grupo
  -> Seleccionar atributos
  -> Ingresar valores del producto
  -> Configurar reglas de precio
  -> Confirmar
  -> Producto y stock inicial se persisten transaccionalmente
```

## Operación comercial

```text
Usuario autorizado
  -> Operaciones
  -> Buscar productos
  -> Agregar líneas y cantidades
  -> Seleccionar costos adicionales opcionales
  -> Aplicar descuento opcional
  -> Calcular vista previa
  -> Cancelar o confirmar venta
  -> Si confirma: persistir venta, detalles y movimientos de stock
```

## Cancelar venta

```text
Administrador
  -> Historial de ventas
  -> Seleccionar venta confirmada
  -> Cancelar venta
  -> Ingresar motivo obligatorio
  -> Confirmar
  -> Persistir cancelación y movimiento de reversión
```
