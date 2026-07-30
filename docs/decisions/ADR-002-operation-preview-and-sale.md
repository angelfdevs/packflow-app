# ADR-002 — Vista previa y confirmación de venta

## Estado

Aceptada.

## Decisión

La interfaz tendrá una única operación comercial. El backend ofrecerá una vista previa no persistente y un comando separado para confirmar la venta.

## Motivo

Cotizar y vender comparten entradas y cálculos, pero solo la venta cambia el estado del negocio.

## Consecuencia

La vista previa no requiere idempotencia ni genera stock. La venta requiere idempotencia, transacción, auditoría y movimientos de inventario.
