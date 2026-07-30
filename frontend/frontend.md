# Frontend de PackFlow

## Requisitos

- Node.js 24.x o compatible con la versión fijada en `package-lock.json`.
- npm.

## Instalación

Desde esta carpeta:

```bash
npm install
```

## Ejecución local

Terminal 1:

```bash
npm run mock
```

Terminal 2:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Cuenta de demostración

```text
Correo: admin@packflow.local
Contraseña: PackFlowDemo123!
```

La cuenta y los datos de demostración pertenecen únicamente al mock local.

## Mock de la API

`mock/db.seed.json` contiene los datos iniciales. `mock/db.local.json` se crea localmente y está excluido de Git.

Para reiniciar los datos:

```bash
npm run mock:reset
```

La fake API utiliza el prefijo `http://localhost:3001/api/v1` y reproduce las respuestas principales del contrato OpenAPI. No reemplaza la seguridad real del backend ASP.NET Core.

## Variables de entorno

Copiar `.env.example` a `.env.local` cuando sea necesario:

```text
VITE_API_MODE=mock
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

En producción:

```text
VITE_API_MODE=real
VITE_API_BASE_URL=https://dominio-real-de-la-api/api/v1
```

No colocar secretos en variables `VITE_*`; Vite las expone al navegador.

## Arquitectura

Cada bounded context contiene sus propias capas:

```text
src/
├── identity-account/
├── catalog/
├── inventory/
├── commercial-operations/
├── dashboard/
└── shared/
```

Dentro de los contextos se utilizan `presentation`, `application`, `domain` e `infrastructure`. `Shared` es transversal y no contiene reglas específicas del negocio.

## Capacidades implementadas

- Productos con categorías, materiales, precios, stock inicial y borrado lógico.
- Creación de categorías y materiales desde el módulo de productos.
- Búsqueda de productos por nombre, medida, categoría o material dentro de productos, inventario, cotizaciones y ventas.
- Inventario con ingresos, disminuciones justificadas, stock bajo y consulta paginada de movimientos.
- Cotizaciones y ventas con hasta 20 productos, descuentos, IGV y serigrafía por línea.
- Serigrafía habilitada únicamente desde 20 unidades y hasta 10 colores.
- Historial paginado y detalle histórico de ventas con serigrafía y descuentos.
- Productos e inventario muestran 6 registros por página; el historial completo de movimientos muestra 15.
- El cotizador puede limpiarse sin recargar la página y el historial de ventas permite abrir el detalle completo de cada operación.
- Sesión en memoria, expiración por inactividad, CSRF y renovación controlada.

## Verificación

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```
