# Contrato de API REST de PackFlow

## 1. Propósito

Este documento define el contrato entre el frontend Vue.js y el backend ASP.NET Core de PackFlow.

La API permitirá administrar productos, categorías, materiales, inventario, cotizaciones, ventas, configuración y autenticación de la cuenta administradora.

La API será parte de un monolito modular y estará organizada de acuerdo con los bounded contexts definidos para PackFlow.

## 2. Versión y URL base

Todos los endpoints se versionarán mediante la ruta:

```text
/api/v1
```

Ejemplo de URL de producción:

```text
https://api.packflow.example/api/v1
```

El dominio real se configurará mediante variables de entorno y no se escribirá directamente en el código fuente.

## 3. Convenciones generales

- El formato de intercambio será JSON.
- Las identificaciones de recursos serán UUID.
- Las cantidades de una operación serán números enteros positivos.
- `initialStock` será opcional y podrá ser cero o mayor.
- Los importes monetarios se representarán como cadenas decimales con dos posiciones, por ejemplo `"150.00"`, para evitar errores de precisión en JSON.
- La moneda será `PEN`.
- Las fechas se representarán en formato ISO 8601.
- La aplicación mostrará las fechas en la zona horaria `America/Lima`.
- Las listas utilizarán paginación.
- `pageSize` tendrá un valor predeterminado de 20 y un máximo de 100 registros.
- Una solicitud HTTP tendrá un tamaño máximo de 256 KB.
- Una operación podrá incluir como máximo 20 productos diferentes.
- La cantidad máxima por línea será de 1 000 000 unidades.
- Cada línea podrá incluir como máximo 10 colores de serigrafía.
- Cada dimensión del producto tendrá un máximo de 1 000 cm.
- Los errores utilizarán el formato `ProblemDetails`.
- El backend será la autoridad final de todas las reglas de negocio.
- El backend eliminará los espacios externos de correos, nombres de productos, categorías y materiales antes de persistirlos.
- El correo se almacenará en una forma canónica; los nombres conservarán la capitalización recortada que eligió el usuario, pero se compararán sin distinguir mayúsculas de minúsculas para evitar duplicados aparentes.
- La base de datos reforzará esta regla mediante índices únicos funcionales basados en `lower(btrim(...))`.

## 4. Encabezados

### 4.1 Encabezados comunes

```http
Content-Type: application/json
Accept: application/json
```

El frontend no debe enviar `businessAccountId`. El backend debe obtener la cuenta del negocio a partir de la sesión autenticada.

### 4.2 Autenticación

Los endpoints protegidos utilizarán:

```http
Authorization: Bearer <access-token>
```

El access token permanecerá únicamente en memoria del frontend. No se almacenará en `localStorage` ni en `sessionStorage`.

El inicio de sesión y cada renovación emitirán las cookies necesarias mediante `Set-Cookie`. La cookie de refresh token tendrá los atributos:

```text
pf_refresh: HttpOnly; Secure; SameSite=None; Path=/api/v1/auth
XSRF-TOKEN: Secure; SameSite=None; Path=/api/v1/auth
```

`pf_refresh` nunca será accesible desde JavaScript. `XSRF-TOKEN` no contendrá credenciales, pero tampoco se leerá desde `document.cookie` porque el frontend y la API se desplegarán en orígenes distintos. El frontend obtendrá el token mediante `GET /auth/csrf`, lo conservará únicamente en memoria y deberá enviarlo como `X-CSRF-TOKEN` en las solicitudes que utilicen cookies. El frontend utilizará `credentials: include`.

El usuario no será desconectado por inactividad mientras utilice la aplicación normalmente. El access token permanecerá únicamente en memoria y el refresh token será rotativo.

La sesión expirará después de 15 minutos sin interacción y no tendrá expiración absoluta. La actividad normal reiniciará el contador de inactividad. No existirá un botón “Mantener sesión activa” ni un heartbeat automático para evitar la expiración.

El backend validará el vencimiento utilizando la última actividad registrada en `sessions.last_seen_at`; cualquier contador del frontend tendrá únicamente fines informativos.

El access token tendrá una duración objetivo de 15 minutos. El refresh token será válido mientras la sesión tenga actividad, expirará después de 15 minutos sin interacción, será de un solo uso por rotación y podrá revocarse en cualquier momento. Los tokens de recuperación de contraseña tendrán una duración de 30 minutos y serán de un solo uso.
Si el backend detecta la reutilización de un refresh token que ya fue rotado, deberá revocar la familia de tokens de la sesión y exigir un nuevo inicio de sesión.
Cada refresh token deberá estar asociado a una sesión mediante `session_id`, que identificará la familia de tokens. El `session_id` no sustituye al secreto del refresh token: el backend deberá validar tanto la sesión como el hash del token.

La tabla `sessions` representará la familia de tokens y la tabla `session_refresh_tokens` conservará cada refresh token emitido mediante su hash, fecha de emisión, fecha de uso, revocación y eventual reemplazo. La rotación deberá ejecutarse dentro de una transacción. Si se presenta un token cuyo campo `used_at` ya tiene valor, el backend deberá considerar que existe reutilización, revocar toda la familia y rechazar la solicitud.

Las solicitudes `/auth/refresh` y `/auth/logout` deberán incluir el encabezado `X-CSRF-TOKEN`. CORS permitirá únicamente el origen configurado del frontend. El backend rechazará la solicitud si el valor del encabezado no coincide con la cookie `XSRF-TOKEN`.

Antes de renovar una sesión, el frontend deberá solicitar `GET /auth/csrf`. El endpoint generará o devolverá un token CSRF no sensible, establecerá la cookie `XSRF-TOKEN` y devolverá el mismo valor en la respuesta. El inicio de sesión y la renovación también devolverán el token CSRF no sensible cuando emitan o roten la cookie. El token no se almacenará en `localStorage` ni en `sessionStorage`.

### 4.3 Idempotencia

Las operaciones persistentes de negocio deberán recibir:

```http
Idempotency-Key: <unique-request-key>
```

Será obligatorio en:

- Creación de categorías, materiales y productos.
- Actualización de cuenta, configuración, productos y estado de productos.
- Registro de ventas.
- Ingresos de inventario.
- Ajustes de inventario.

Las operaciones de autenticación tienen semánticas propias de un solo uso o revocación y no reutilizarán esta clave como sustituto del control de sesión. Las cotizaciones no requieren idempotencia porque no persisten información.

La clave deberá ser única para la cuenta del negocio. El frontend deberá generar una clave diferente para cada operación. Si se reenvía la misma solicitud con el mismo contenido, la API debe devolver el resultado original sin repetir el movimiento. Si se reutiliza la clave con un contenido diferente, la API debe rechazar la solicitud con un conflicto.

### 4.4 Control de concurrencia

Las operaciones `PUT` y `PATCH` deberán incluir:

```http
If-Match: <etag-del-recurso>
```

El backend debe rechazar con `409 Conflict` una actualización basada en una versión desactualizada del recurso. Cuando una solicitud se reintente con la misma `Idempotency-Key`, deberá devolverse el resultado original si el contenido coincide.

Los recursos `business_accounts`, `account_settings` y `products` tendrán un campo `version` entero. El backend incrementará este valor en cada actualización y generará el ETag a partir de él, por ejemplo `"v12"`.

El frontend debe enviar el ETag recibido en `If-Match`. No se utilizará únicamente `updated_at` para resolver concurrencia.

### 4.5 Límites y rate limiting

Los límites se aplicarán por cuenta de negocio y por dirección IP. En producción con más de una instancia del backend, los contadores deberán utilizar un almacén distribuido o una política equivalente en el perímetro, nunca únicamente memoria local de una instancia.

| Grupo | Límite recomendado |
|---|---:|
| Lecturas y consultas por cuenta | 300 solicitudes por minuto, con ráfaga de 30 |
| Cotizaciones por cuenta | 120 solicitudes por minuto, con ráfaga de 20 |
| Escrituras de productos, inventario y ventas por cuenta | 60 solicitudes por minuto, con ráfaga de 10 |
| Inicio de sesión por combinación IP/correo | 5 solicitudes por minuto |
| Recuperación de contraseña por combinación IP/correo | 3 solicitudes por hora |

Cloudflare aplicará una protección perimetral adicional contra abuso y DDoS. El límite de la aplicación se mantendrá como defensa en profundidad.

Las operaciones sujetas a estos límites podrán responder `429 Too Many Requests`. El backend aplicará los límites por cuenta e IP; las solicitudes no autenticadas utilizarán principalmente la dirección IP y los identificadores disponibles de forma segura.
Cuando sea posible, una respuesta `429` incluirá el encabezado `Retry-After` con la cantidad de segundos que el cliente debe esperar antes de reintentar.

## 5. Reglas de seguridad para todos los endpoints

1. Todo endpoint protegido debe validar la autenticación.
2. El backend debe aplicar aislamiento por `businessAccountId`.
3. Nunca se debe confiar únicamente en un identificador enviado por el frontend.
4. El frontend no enviará como valores definitivos el precio, stock, subtotal, IGV, descuento calculado ni total.
5. El backend debe obtener precios y configuraciones actuales y recalcular la operación.
6. Las respuestas no deben incluir contraseñas, tokens de recuperación, refresh tokens ni secretos.
7. Los errores internos no deben revelar SQL, rutas, stack traces ni detalles de infraestructura.
8. Los endpoints sensibles deben aplicar rate limiting.
9. CORS debe permitir únicamente el origen configurado del frontend.
10. No se debe utilizar `Access-Control-Allow-Origin: *` junto con credenciales.
11. Las operaciones con cookies deben contar con protección CSRF/antiforgery.
12. Las consultas deben utilizar parámetros seguros mediante Entity Framework Core.
13. Los logs no deben contener contraseñas, tokens, secretos ni información sensible del negocio.
14. La API debe establecer límites de tamaño para cuerpos, búsquedas y paginación.
15. La API debe limitar las operaciones a 20 líneas de productos, 1 000 000 unidades por línea, 10 colores por línea y 1 000 cm por dimensión.
16. Los límites de solicitudes deben aplicarse por cuenta e IP, con contadores distribuidos o protección perimetral cuando existan varias instancias.
17. Swagger/OpenAPI debe estar protegido o deshabilitado públicamente en producción.
18. Las operaciones de stock deben utilizar control de concurrencia y una actualización atómica que verifique el stock disponible.
19. La verificación de stock y su disminución no debe ejecutarse como pasos independientes sin protección transaccional.

## 6. Autenticación y cuenta

### 6.0 Provisionamiento de cuentas

La API no expondrá un endpoint público para crear cuentas administradoras. Cada cuenta de negocio será provisionada mediante un comando administrativo o job controlado ejecutado durante la preparación del entorno.

El proceso deberá:

1. Recibir el nombre del negocio, correo y contraseña mediante un gestor de secretos o entrada segura, nunca mediante valores escritos en el código fuente.
2. Crear la cuenta con la contraseña procesada por el mecanismo estándar de hash de ASP.NET Core.
3. Crear la configuración inicial del negocio.
4. Verificar o sembrar los tipos de precio globales `RETAIL` y `WHOLESALE`.
5. Crear los rangos iniciales de serigrafía: `20..300`, `301..500` y `501..NULL`.
6. Ser idempotente y rechazar la creación si el correo ya está asociado a una cuenta.
7. No mostrar ni registrar la contraseña proporcionada.

La creación de cuentas adicionales para nuevos negocios utilizará el mismo procedimiento controlado. No se agregará un registro público durante el alcance actual.

### 6.1 Iniciar sesión

```http
POST /api/v1/auth/login
```

Solicitud:

```json
{
  "email": "admin@negocio.com",
  "password": "password-not-real"
}
```

Respuesta `200 OK`:

```json
{
  "accessToken": "access-token-temporal",
  "expiresIn": 900,
  "csrfToken": "csrf-token-no-sensible",
  "account": {
    "businessAccountId": "account-uuid",
    "businessName": "Negocio de ejemplo",
    "email": "admin@negocio.com"
  }
}
```

La respuesta no debe revelar si el correo o la contraseña fueron el dato incorrecto. Los intentos fallidos deben estar limitados temporalmente.

Errores posibles:

- `400 Bad Request`: datos incompletos o formato inválido.
- `401 Unauthorized`: credenciales incorrectas.
- `429 Too Many Requests`: demasiados intentos.

### 6.2 Renovar sesión

```http
POST /api/v1/auth/refresh
```

La solicitud utilizará la cookie de refresh token. El token será rotado y la sesión se mantendrá activa si no fue revocada ni expiró por 15 minutos de inactividad.

Respuesta `200 OK`:

```json
{
  "accessToken": "new-access-token",
  "expiresIn": 900,
  "csrfToken": "csrf-token-no-sensible"
}
```

### 6.2.1 Obtener token CSRF

```http
GET /api/v1/auth/csrf
```

Respuesta `200 OK`:

```json
{
  "csrfToken": "csrf-token-no-sensible"
}
```

El endpoint establecerá o renovará la cookie `XSRF-TOKEN`. El frontend conservará el valor recibido únicamente en memoria y lo enviará como `X-CSRF-TOKEN` en `/auth/refresh` y `/auth/logout`.

### 6.3 Consultar sesión actual

```http
GET /api/v1/auth/me
```

Respuesta `200 OK`:

```json
{
  "businessAccountId": "uuid",
  "businessName": "Negocio de ejemplo",
  "email": "admin@negocio.com"
}
```

### 6.4 Cerrar sesión

```http
POST /api/v1/auth/logout
```

La API debe revocar la sesión, invalidar el refresh token, invalidar los access tokens asociados mediante el identificador de sesión y limpiar la cookie correspondiente. Los endpoints protegidos deben comprobar que la sesión asociada al token no haya sido revocada.

Respuesta `204 No Content`.

### 6.5 Cambiar contraseña

```http
POST /api/v1/auth/password/change
```

Solicitud:

```json
{
  "currentPassword": "current-password-not-real",
  "newPassword": "new-password-not-real",
  "confirmPassword": "new-password-not-real"
}
```

La nueva contraseña debe cumplir los requisitos de seguridad. Después del cambio, las sesiones anteriores deberán revocarse.

### 6.6 Solicitar recuperación de contraseña

```http
POST /api/v1/auth/password/forgot
```

Solicitud:

```json
{
  "email": "admin@negocio.com"
}
```

Respuesta `202 Accepted` para correos registrados y no registrados:

```json
{
  "message": "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña."
}
```

La respuesta debe ser idéntica para evitar descubrir si una cuenta existe.

El token debe ser aleatorio, de un solo uso, tener expiración limitada, no almacenarse en texto plano y no registrarse en logs.

### 6.7 Restablecer contraseña

```http
POST /api/v1/auth/password/reset
```

Solicitud:

```json
{
  "token": "recovery-token",
  "newPassword": "new-password-not-real",
  "confirmPassword": "new-password-not-real"
}
```

Respuesta `204 No Content`.

El token debe invalidarse después del uso. Las sesiones activas anteriores deben revocarse.

## 7. Cuenta y configuración

### 7.1 Consultar datos del negocio

```http
GET /api/v1/account
```

### 7.2 Actualizar datos del negocio

```http
PATCH /api/v1/account
```

Solo se podrán modificar los datos permitidos del negocio. El identificador de la cuenta no se podrá modificar desde el frontend.

### 7.3 Consultar configuración

```http
GET /api/v1/settings
```

Respuesta `200 OK`:

```json
{
  "igvRate": 0.18,
  "minimumScreenPrintingQuantity": 20,
  "version": 3,
  "screenPrintingTiers": [
      { "from": 20, "to": 300, "ratePerColor": "45.00" },
      { "from": 301, "to": 500, "ratePerColor": "40.00" },
      { "from": 501, "to": null, "ratePerColor": "30.00" }
  ],
  "theme": "LIGHT",
  "fontSize": "MEDIUM"
}
```

### 7.4 Actualizar configuración

```http
PATCH /api/v1/settings
```

La API debe validar que existan exactamente los rangos `20..300`, `301..500` y `501..NULL`, evitar tarifas negativas y asegurar que no se superpongan. El administrador podrá modificar las tarifas, pero no el mínimo de 20 unidades ni los límites de los rangos.

La configuración actualizada se utilizará en nuevas cotizaciones y ventas. Las ventas históricas conservarán los valores utilizados al momento de registrarse.

## 8. Categorías y materiales

### 8.1 Listar categorías

```http
GET /api/v1/categories
```

### 8.2 Registrar categoría

```http
POST /api/v1/categories
```

Solicitud:

```json
{
  "name": "Caja dúo"
}
```

No se permitirán nombres duplicados dentro del mismo negocio.

### 8.3 Listar materiales

```http
GET /api/v1/materials
```

### 8.4 Registrar material

```http
POST /api/v1/materials
```

Solicitud:

```json
{
  "name": "Cartón corrugado"
}
```

No se permitirán nombres duplicados dentro del mismo negocio.

La edición o desactivación de categorías y materiales no forma parte del contrato actual porque no existe una historia de usuario específica para esas operaciones.

## 9. Productos

### 9.1 Listar y buscar productos

```http
GET /api/v1/products
```

Parámetros:

```text
search
categoryId
materialId
active
page
pageSize
```

Ejemplo:

```text
GET /api/v1/products?search=caja&categoryId=category-uuid&materialId=material-uuid&active=true&page=1&pageSize=20
```

La búsqueda debe permitir nombre, medidas, categoría y material. Los productos inactivos no se mostrarán como disponibles para cotizaciones o ventas.

### 9.2 Registrar producto

```http
POST /api/v1/products
```

Solicitud:

```json
{
  "categoryId": "category-uuid",
  "materialId": "material-uuid",
  "name": "Caja dúo",
  "dimensions": {
    "lengthCm": 20.00,
    "widthCm": 20.00,
    "heightCm": 10.00
  },
  "retailPrice": "1.00",
  "wholesalePrice": "0.80",
  "initialStock": 100
}
```

El backend debe crear el producto y, si `initialStock` es mayor que cero, registrar un movimiento de ingreso inicial dentro de la misma transacción. Si `initialStock` es cero, el producto se creará con stock cero y no se registrará ningún movimiento inicial. El stock no se debe actualizar mediante una asignación directa al producto.

Las dimensiones deben ser mayores que cero y no superar `1000.00 cm` en ninguno de sus ejes. El stock inicial no podrá superar `1 000 000` unidades.

Si la creación del producto o del movimiento falla, no debe persistirse ninguna de las dos operaciones.

No podrán existir dos productos activos del mismo negocio con la misma combinación de categoría, material, nombre y medidas. Los precios no forman parte de la identidad del producto. Un producto inactivo no impedirá registrar otro producto activo con esa combinación; al reactivarlo, el backend deberá volver a validar la unicidad.

### 9.3 Consultar producto

```http
GET /api/v1/products/{productId}
```

### 9.4 Editar producto

```http
PUT /api/v1/products/{productId}
```

Solicitud:

```json
{
  "categoryId": "category-uuid",
  "materialId": "material-uuid",
  "name": "Caja dúo actualizada",
  "dimensions": {
    "lengthCm": 20.00,
    "widthCm": 20.00,
    "heightCm": 10.00
  },
  "retailPrice": "1.10",
  "wholesalePrice": "0.85"
}
```

El campo `stock` no forma parte de esta solicitud. La modificación de precios no debe cambiar ventas históricas. El backend y la base de datos deben impedir que existan dos productos activos del mismo negocio con la misma categoría, material, nombre y medidas. Los precios no forman parte de la identidad del producto.

### 9.5 Activar o desactivar producto

```http
PATCH /api/v1/products/{productId}/status
```

Solicitud:

```json
{
  "active": false
}
```

La desactivación será lógica. Los productos con historial no se eliminarán físicamente. Al activar nuevamente un producto, el backend deberá volver a validar la unicidad de su categoría, material, nombre y medidas; si existe otro producto activo con esa identidad, la API responderá `409 Conflict`.

## 10. Inventario

### 10.1 Consultar stock

```http
GET /api/v1/inventory/stock
```

Parámetros:

```text
search
categoryId
materialId
active
page
pageSize
```

Respuesta `200 OK`:

```json
{
  "items": [
    {
      "productId": "product-uuid",
      "name": "Caja dúo",
      "dimensions": {
        "lengthCm": 20.00,
        "widthCm": 20.00,
        "heightCm": 10.00
      },
      "categoryName": "Cajas",
      "materialName": "Cartón corrugado",
      "currentStock": 150,
      "active": true
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 1
}
```

La consulta no debe modificar ningún dato.

### 10.2 Registrar ingreso de stock

```http
POST /api/v1/inventory/receipts
```

Solicitud:

```json
{
  "productId": "product-uuid",
  "quantity": 100,
  "reason": "Ingreso de mercadería"
}
```

El backend debe aumentar el stock, registrar el movimiento y conservar el stock anterior y posterior.

### 10.3 Registrar ajuste de stock

```http
POST /api/v1/inventory/adjustments
```

Solicitud para pérdida o daño:

```json
{
  "productId": "product-uuid",
  "adjustmentType": "DAMAGE",
  "direction": "DECREASE",
  "quantity": 5,
  "reason": "Cajas dañadas durante el almacenamiento"
}
```

Solicitud para corrección:

```json
{
  "productId": "product-uuid",
  "adjustmentType": "CORRECTION",
  "direction": "INCREASE",
  "quantity": 10,
  "reason": "Corrección de conteo físico"
}
```

Valores permitidos:

```text
adjustmentType: LOSS | DAMAGE | CORRECTION
direction: INCREASE | DECREASE
```

Pérdida y daño solo podrán disminuir el stock. Corrección podrá aumentarlo o disminuirlo. El stock resultante nunca podrá ser negativo.

### 10.4 Consultar movimientos

```http
GET /api/v1/inventory/movements
```

Parámetros:

```text
productId
movementType
from
to
page
pageSize
```

Los movimientos serán inmutables desde operaciones comunes y conservarán producto, cantidad, tipo, motivo, fecha, stock anterior y stock posterior.

Tipos de movimiento:

```text
INITIAL_RECEIPT
RECEIPT
SALE_OUT
LOSS
DAMAGE
CORRECTION
```

## 11. Cotizaciones

### 11.1 Calcular cotización

```http
POST /api/v1/quotes/preview
```

Esta operación será temporal. No creará una cotización persistente, no generará un identificador histórico y no modificará el stock.

Solicitud:

```json
{
  "items": [
    {
      "productId": "box-product-uuid",
      "quantity": 150,
      "screenPrinting": {
        "enabled": true,
        "colors": 1
      }
    },
    {
      "productId": "bag-product-uuid",
      "quantity": 50,
      "screenPrinting": {
        "enabled": false,
        "colors": 0
      }
    }
  ],
  "discount": {
    "type": "PERCENTAGE",
    "value": "10.00"
  }
}
```

El backend debe:

1. Validar que exista al menos una línea.
2. Validar que la operación tenga como máximo 20 líneas de productos diferentes.
3. Validar que todos los productos estén activos.
4. Validar que cada producto aparezca una sola vez en `items`.
5. Validar que cada línea tenga entre 1 y 1 000 000 unidades.
6. Validar que los colores estén entre 0 y 10 y sean positivos cuando la serigrafía esté activa.
7. Obtener los precios actuales de cada producto.
8. Seleccionar precio minorista de 1 a 100 unidades.
9. Seleccionar precio mayorista desde 101 unidades.
10. Calcular serigrafía por cada línea.
11. Aplicar como máximo un descuento.
12. Aplicar el descuento antes del IGV.
13. Obtener la tasa de IGV de la configuración del negocio.
14. Devolver el resultado sin verificar ni modificar el stock.

Respuesta `200 OK`:

```json
{
  "items": [
    {
      "productId": "box-product-uuid",
      "quantity": 150,
      "unitPrice": "0.80",
      "priceType": "WHOLESALE",
      "productAmount": "120.00",
      "screenPrinting": {
        "enabled": true,
        "colors": 1,
        "lots": 2,
        "ratePerColor": "45.00",
        "amount": "90.00"
      },
      "lineAmount": "210.00"
    },
    {
      "productId": "bag-product-uuid",
      "quantity": 50,
      "unitPrice": "1.00",
      "priceType": "RETAIL",
      "productAmount": "50.00",
      "screenPrinting": {
        "enabled": false,
        "colors": 0,
        "lots": 0,
        "ratePerColor": "0.00",
        "amount": "0.00"
      },
      "lineAmount": "50.00"
    }
  ],
  "discount": {
    "type": "PERCENTAGE",
    "value": "10.00",
    "amount": "26.00"
  },
  "subtotal": "234.00",
  "igvRate": 0.18,
  "igv": "42.12",
  "total": "276.12",
  "currency": "PEN"
}
```

La serigrafía se calculará por línea de producto. No se sumarán cantidades de productos diferentes para determinar lotes, precios o tarifas.

Fórmulas:

```text
Lotes = ceil(cantidad / 100)
Costo de serigrafía = lotes × colores × tarifa
Importe de línea = importe de productos + serigrafía de la línea
Subtotal = suma de los importes de línea - descuento aplicado
IGV = subtotal × tasa de IGV
Total = subtotal + IGV
```

El resultado expone un único `subtotal`. Cuando existe un descuento, el campo `discount` informa su tipo, valor y monto aplicado; no se expone un subtotal previo ni un segundo subtotal.
Si no se aplica descuento, el descuento aplicado se considera `0.00` y el subtotal corresponde a la suma de los importes de línea.

Reglas de serigrafía:

```text
20 a 300 unidades: S/45 por color y lote
301 a 500 unidades: S/40 por color y lote
501 unidades a más: S/30 por color y lote
```

La serigrafía estará deshabilitada para cantidades menores a 20 unidades. La cantidad de colores debe ser un entero positivo cuando la serigrafía esté activa.

## 12. Ventas

### 12.1 Registrar venta

```http
POST /api/v1/sales
```

La solicitud tendrá la misma estructura de cálculo que una cotización:

```json
{
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 150,
      "screenPrinting": {
        "enabled": true,
        "colors": 1
      }
    }
  ],
  "discount": {
    "type": "FIXED",
    "value": "20.00"
  }
}
```

El backend no aceptará como definitivos los precios ni los totales del frontend. Deberá recalcular la operación y ejecutar en una única transacción:

1. Validar autenticación y pertenencia de todos los productos.
2. Validar que todos los productos estén activos.
3. Validar que cada producto aparezca una sola vez en `items`.
4. Obtener precios y configuración del negocio.
5. Recalcular cada línea.
6. Validar descuento e IGV.
7. Verificar stock suficiente para todas las líneas.
8. Crear la venta y sus detalles con valores históricos.
9. Disminuir el stock de todos los productos.
10. Crear un movimiento `SALE_OUT` por cada línea.
11. Confirmar la transacción.

La implementación deberá evitar condiciones de carrera mediante bloqueo o control de concurrencia y una actualización atómica equivalente a verificar que el stock actual sea mayor o igual a la cantidad solicitada antes de descontarla.

Si una línea no tiene stock suficiente, toda la operación debe rechazarse y no debe registrarse ninguna parte de la venta.

Respuesta `201 Created`:

```json
{
  "saleId": "sale-uuid",
  "status": "CONFIRMED",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 150,
      "unitPrice": "0.80",
      "priceType": "WHOLESALE",
      "productAmount": "120.00",
      "screenPrinting": {
        "enabled": true,
        "colors": 1,
        "lots": 2,
        "ratePerColor": "45.00",
        "amount": "90.00"
      },
      "lineAmount": "210.00"
    }
  ],
  "discount": {
    "type": "FIXED",
    "value": "20.00",
    "amount": "20.00"
  },
  "subtotal": "190.00",
  "igvRate": 0.18,
  "igv": "34.20",
  "total": "224.20",
  "currency": "PEN",
  "createdAt": "2026-07-24T10:00:00-05:00"
}
```

### 12.2 Consultar ventas

```http
GET /api/v1/sales
```

Parámetros:

```text
from
to
page
pageSize
```

Solo se mostrarán ventas confirmadas. La respuesta debe conservar los valores históricos de cada operación.

### 12.3 Consultar detalle de venta

```http
GET /api/v1/sales/{saleId}
```

La respuesta incluirá productos, cantidades, precios, tipo de precio, serigrafía, descuento, un único subtotal, IGV, total y fecha.

No se incluye un endpoint para eliminar o editar ventas confirmadas, porque las historias actuales no contemplan esa operación y los registros deben conservarse para trazabilidad.

## 13. Dashboard

### 13.1 Consultar resumen

```http
GET /api/v1/dashboard/summary
```

La respuesta incluirá como mínimo:

- Cantidad de productos activos.
- Cantidad de productos con stock bajo.
- Detalle de los productos con stock bajo y su stock actual.
- Ventas recientes.
- Movimientos recientes.
- Umbral utilizado para considerar bajo stock: 15 unidades o menos.

El backend devolverá como máximo 100 productos con stock bajo, 10 ventas recientes y 10 movimientos recientes para evitar respuestas innecesariamente grandes.

Respuesta `200 OK`:

```json
{
  "activeProducts": 12,
  "lowStockProducts": 2,
  "lowStockThreshold": 15,
  "lowStockItems": [
    {
      "productId": "product-uuid",
      "name": "Caja dúo",
      "currentStock": 8
    }
  ],
  "recentSales": [
    {
      "saleId": "sale-uuid",
      "total": "276.12",
      "createdAt": "2026-07-24T10:00:00-05:00"
    }
  ],
  "recentMovements": [
    {
      "movementId": "movement-uuid",
      "productId": "product-uuid",
      "movementType": "SALE_OUT",
      "quantityDelta": -5,
      "createdAt": "2026-07-24T10:00:00-05:00"
    }
  ]
}
```

Todos los indicadores deben pertenecer exclusivamente al negocio autenticado y la consulta no debe modificar datos.

## 14. Health checks

### 14.1 Estado de ejecución

```http
GET /health/live
```

Indica si el proceso del backend está ejecutándose. No debe exponer información sensible.

### 14.2 Estado de disponibilidad

```http
GET /health/ready
```

Debe comprobar la disponibilidad del backend y la conexión con PostgreSQL. No debe devolver credenciales, cadenas de conexión ni detalles internos.

Estos endpoints podrán ser consultados por el monitor externo de disponibilidad.

## 15. Formato de errores

Las respuestas de error utilizarán `application/problem+json`.

Ejemplo:

```json
{
  "type": "https://api.packflow.example/problems/insufficient-stock",
  "title": "Stock insuficiente",
  "status": 409,
  "detail": "No existe stock suficiente para completar la operación.",
  "errorCode": "INSUFFICIENT_STOCK",
  "traceId": "trace-uuid"
}
```

La propiedad `detail` nunca debe incluir SQL, stack traces, secretos ni datos de otros negocios.

Códigos principales:

| Código HTTP | Uso |
|---:|---|
| 400 | Solicitud malformada o campos incompletos |
| 401 | Sesión ausente, inválida, revocada o access token vencido |
| 403 | Operación no autorizada |
| 404 | Recurso no encontrado dentro del negocio |
| 409 | Conflicto, stock insuficiente o solicitud duplicada |
| 422 | Regla de negocio o validación inválida |
| 429 | Límite de solicitudes excedido |
| 500 | Error interno controlado |
| 503 | Servicio no disponible |

## 16. Reglas de consistencia

- Una cotización nunca se persistirá.
- Una cotización nunca modificará el stock.
- Una operación debe contener al menos una línea.
- Un producto no puede aparecer más de una vez en la misma operación.
- Una venta confirmada siempre se persistirá.
- Una venta confirmada siempre generará movimientos de salida.
- Una venta y sus movimientos se confirmarán dentro de una transacción.
- El stock nunca podrá ser negativo.
- Los movimientos históricos serán inmutables.
- Los precios y totales históricos de una venta no cambiarán al editar un producto.
- El stock inicial mayor que cero será un movimiento de ingreso; un stock inicial igual a cero no generará movimiento.
- La edición del producto no modificará el stock.
- El descuento será opcional y solo podrá existir uno por operación.
- Las cotizaciones y ventas expondrán un único subtotal después de aplicar el descuento, cuando corresponda.
- Un descuento fijo no podrá superar el importe antes del descuento.
- El porcentaje de descuento estará entre 0 % y 100 %.
- El descuento se aplicará antes del IGV.
- Los productos inactivos no podrán utilizarse en nuevas cotizaciones ni ventas.
- Cada negocio solo podrá acceder a sus propios recursos.

## 17. Trazabilidad con requisitos

| Requisito | Endpoints relacionados |
|---|---|
| US-001 a US-003 | `/auth/login`, `/auth/logout`, `/auth/password/change` |
| US-004 a US-006 | `/products` |
| US-007 a US-009 | `/inventory/stock`, `/inventory/movements` |
| US-010 a US-013 | `/products`, `/quotes/preview` |
| US-014 y US-015 | `/sales` |
| US-016 | `/sales` |
| US-017 y US-018 | `/settings` |
| US-019 | `/dashboard/summary` |
| US-020 y US-021 | `/categories`, `/materials` |
| US-022 | `/inventory/adjustments` |
| US-023 | `/quotes/preview`, `/sales` |
| US-024 y US-025 | `/auth/password/forgot`, `/auth/password/reset` |
| US-026 | `/quotes/preview`, `/sales` |

La operación con múltiples productos se encuentra contemplada por este contrato mediante `items[]`. Cada producto se procesa como una línea independiente y no puede repetirse dentro de la misma operación.

## 18. OpenAPI

La especificación OpenAPI versionada será la fuente técnica principal del contrato HTTP:

[OpenAPI de PackFlow](./openapi.yaml)

El archivo deberá mantenerse sincronizado con los endpoints implementados e incluir:

- Esquemas de solicitud y respuesta.
- Reglas de validación.
- Esquema de autenticación.
- Códigos de respuesta.
- Ejemplos.
- Requisitos de seguridad por endpoint.

Swagger UI deberá utilizarse para desarrollo y pruebas, pero no debe quedar expuesto sin protección en producción.
