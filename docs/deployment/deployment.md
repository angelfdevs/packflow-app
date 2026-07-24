# Despliegue de PackFlow

## Arquitectura objetivo

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
- Mínimo dos instancias del backend en producción.
- PostgreSQL administrado con alta disponibilidad, PITR y respaldos lógicos independientes.
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

## Disponibilidad y recuperación

- Objetivo de disponibilidad: 99.99 % mensual.
- RTO objetivo: máximo una hora.
- RPO objetivo: máximo 15 minutos.
- Estos valores son objetivos operativos y dependerán del plan contratado, el SLA del proveedor, el monitoreo y las pruebas de restauración.
- La alta disponibilidad de PostgreSQL debe utilizar replicación administrada y un procedimiento documentado de recuperación.

## Seguridad del despliegue

- HTTPS obligatorio en todos los componentes públicos.
- CORS limitado al origen configurado del frontend.
- Secretos fuera del repositorio.
- Escaneo de dependencias, análisis estático y análisis de imágenes Docker en CI/CD.
- Publicación únicamente desde ramas autorizadas.
- Registro de auditoría sin contraseñas, tokens ni secretos.

