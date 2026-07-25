# Despliegue de PackFlow

## Perfil inicial

El primer despliegue podrá utilizar una configuración reducida para iniciar operaciones con pocos negocios:

- Vue.js como sitio estático en Cloudflare Pages.
- Una instancia stateless del backend ASP.NET Core en Render.
- PostgreSQL administrado sin nodo standby.
- Rate limiting por cuenta e IP en el backend, reforzado por la protección perimetral disponible.
- Health checks, backups, monitoreo y migraciones controladas.

Este perfil no contiene redundancia completa ni representa una garantía formal de 99.9 % de disponibilidad. Su objetivo es poner en operación la aplicación y medir el uso real antes de habilitar la infraestructura objetivo.

## Arquitectura objetivo de alta disponibilidad

```text
Administrador
    |
    | HTTPS
    v
Cloudflare Pages + CDN + WAF/DDoS
    |
    | HTTPS
    v
Render Load Balancer
    |-----------------------------|
    v                             v
Backend ASP.NET Core          Backend ASP.NET Core
Instancia stateless 1         Instancia stateless 2
    |                             |
    |------------- TLS ------------|
                  v
        Render PostgreSQL HA
          Principal + standby
```

## Componentes

- Vue.js desplegado como sitio estático en Cloudflare Pages.
- Backend ASP.NET Core desplegado como contenedor Docker stateless.
- Mínimo dos instancias stateless del backend en el perfil objetivo.
- PostgreSQL administrado con alta disponibilidad, PITR y respaldos lógicos independientes.
- Rate limiting perimetral mediante Cloudflare y un almacén distribuido administrado compatible con Redis para mantener límites por cuenta entre las dos instancias del backend. Este almacén no contendrá datos de negocio.
- Variables de entorno y secretos administrados por el proveedor de despliegue.
- Monitoreo externo de frontend, backend y base de datos.

## Reglas operativas

- El backend no utilizará discos persistentes ni estado local de sesión.
- Las migraciones se ejecutarán de forma controlada antes de habilitar la nueva versión.
- Los despliegues utilizarán health checks, apagado controlado y rollback.
- `/health/live` comprobará que el proceso esté activo.
- `/health/ready` comprobará que el backend y PostgreSQL estén disponibles.
- Swagger/OpenAPI permanecerá protegido o deshabilitado en producción.
- La base de datos no estará expuesta públicamente.
- Los contadores de rate limiting no dependerán únicamente de la memoria local del backend cuando existan varias instancias.

## Disponibilidad y recuperación

- Objetivo de disponibilidad: 99.9 % mensual en el perfil objetivo de alta disponibilidad.
- RTO objetivo: máximo una hora.
- RPO objetivo: máximo 15 minutos.
- Estos valores son objetivos operativos y dependerán del plan contratado, el SLA del proveedor, el monitoreo y las pruebas de restauración. Durante el perfil inicial, la disponibilidad se considerará best effort y se medirá para decidir cuándo ampliar la infraestructura.
- La alta disponibilidad de PostgreSQL debe utilizar replicación administrada y un procedimiento documentado de recuperación.

## Seguridad del despliegue

- HTTPS obligatorio en todos los componentes públicos.
- CORS limitado al origen configurado del frontend.
- Secretos fuera del repositorio.
- Escaneo de dependencias, análisis estático y análisis de imágenes Docker en CI/CD.
- Publicación únicamente desde ramas autorizadas.
- Registro de auditoría sin contraseñas, tokens ni secretos.
