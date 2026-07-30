# Despliegue de Agilora

## 1. Ambientes

Agilora utilizará ambientes separados para evitar que pruebas o cambios incompletos afecten a los negocios reales.

| Ambiente | Uso | Datos |
|---|---|---|
| Development | Desarrollo local y mock | Ficticios |
| QA | Pruebas automáticas y manuales | Ficticios controlados |
| Staging | Validación similar a producción y UAT | Ficticios anonimizados |
| Production | Uso real de los negocios | Reales y protegidos |

Cada ambiente tendrá sus propias variables, base de datos, cookies, credenciales de servicio y reglas de acceso.

## 2. Perfil inicial

El primer despliegue podrá utilizar:

- Vue como sitio estático en Cloudflare Pages.
- Una instancia stateless del backend ASP.NET Core en Render o proveedor equivalente.
- PostgreSQL administrado.
- Servicio de correo transaccional para invitaciones y recuperación de contraseña.
- Rate limiting en backend y protección perimetral disponible.
- Health checks y monitoreo externo.
- Backups y migraciones controladas.

Una instancia backend puede atender múltiples negocios y usuarios. No significa que solo exista una cuenta. Sí significa que no existe redundancia completa si la instancia falla.

El perfil inicial es `best effort`; no representa una garantía formal de 99.9 %.

## 3. Perfil objetivo

```text
Usuario
    |
    | HTTPS
    v
Cloudflare Pages + CDN + WAF/DDoS
    |
    | HTTPS
    v
Balanceador del proveedor
    |-----------------------------|
    v                             v
Backend stateless 1          Backend stateless 2
    |                             |
    |------------- TLS ------------|
                  v
        PostgreSQL administrado HA
                  |
                  v
       Redis/servicio distribuido
```

El almacén distribuido se utilizará para rate limiting y backplane de SignalR cuando existan varias instancias. No almacenará la información principal del negocio.

## 4. Despliegue continuo

El pipeline deberá ejecutar:

1. Validación de formato.
2. Lint.
3. Pruebas unitarias.
4. Pruebas de integración.
5. Validación de OpenAPI.
6. Análisis de dependencias y secretos.
7. Build frontend y backend.
8. Construcción y escaneo de imagen Docker.
9. Migraciones controladas.
10. Despliegue a staging.
11. Smoke tests y health checks.
12. Aprobación UAT.
13. Despliegue a producción.
14. Verificación posterior y rollback si corresponde.

## 5. Migraciones y datos

- Las migraciones se versionan junto con el backend.
- No se ejecutan cambios manuales en producción.
- Las migraciones destructivas requieren un plan de compatibilidad y recuperación.
- Production nunca utiliza la base de datos de development, QA o staging.
- Los datos de prueba son ficticios o anonimizados.

## 6. Salud y observabilidad

- `/health/live` comprueba que el proceso esté activo.
- `/health/ready` comprueba que las dependencias necesarias estén disponibles.
- Un monitor externo verifica frontend y backend.
- Las alertas se activan ante errores críticos, saturación, fallas de health check o aumento anormal de latencia.
- Los logs no contienen contraseñas, tokens, secretos ni datos innecesarios de clientes.

## 7. Disponibilidad y recuperación

- Objetivo operativo del perfil de alta disponibilidad: 99.9 % mensual.
- RTO objetivo: una hora.
- RPO objetivo: 15 minutos.
- El objetivo depende del proveedor, plan contratado, configuración, monitoreo y pruebas de restauración.
- Deben existir backups administrados, respaldo lógico independiente y restauraciones verificadas.
- Durante el perfil inicial se medirá disponibilidad real antes de prometer un SLA.

## 8. Seguridad del despliegue

- HTTPS obligatorio.
- CORS limitado al frontend configurado.
- Secretos administrados fuera del repositorio.
- Variables `VITE_*` nunca contienen secretos.
- Base de datos no expuesta públicamente salvo necesidad controlada.
- Swagger protegido o deshabilitado en producción.
- Publicación únicamente desde ramas autorizadas y pipelines validados.
- Acceso de producción limitado y auditado.
