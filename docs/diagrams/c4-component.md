workspace "Agilora - C4 Component" "Componentes principales del Backend API de Agilora." {

    !identifiers hierarchical

    model {
        administrador = person "Administrador" "Administra el negocio y realiza operaciones diarias."
        operador = person "Operador" "Realiza las operaciones autorizadas del negocio."

        agilora = softwareSystem "Agilora" "SaaS multiempresa para gestionar catálogo, inventario, abastecimientos y operaciones comerciales." {
            frontend = container "Aplicación web" "Interfaz para administración y operación." "Vue 3, JavaScript, Vite, CoreUI"

            backend = container "Backend API" "Modular monolith que expone la API, ejecuta casos de uso y publica eventos después del commit." "ASP.NET Core, C#, .NET 10" {
                interfaces = component "Interfaces HTTP y tiempo real" "Expone endpoints REST, SignalR, ProblemDetails, autenticación técnica, versionado y límites de solicitudes." "ASP.NET Core"
                identity = component "Identity and Access" "Gestiona credenciales, sesiones, recuperación de contraseña, membresías, preferencias visuales y autorización por tenant y rol." "C#"
                tenant = component "Tenant and Business" "Resuelve el negocio de la sesión y protege el contexto multiempresa." "C#"
                catalog = component "Catalog and Pricing" "Gestiona grupos, atributos personalizados, productos y reglas de precio." "C#"
                inventory = component "Inventory and Supply" "Gestiona stock, ingresos, abastecimientos, ajustes y movimientos inmutables." "C#"
                commercial = component "Commercial Operations" "Calcula vistas previas, descuentos, costos adicionales, IGV y ventas confirmadas o canceladas." "C#"
                reporting = component "Reporting" "Genera reportes administrativos por período de ventas, inventario, productos y abastecimientos." "C#"
                dashboard = component "Dashboard" "Compone indicadores y resúmenes para el administrador." "C#"
                settings = component "Business Settings" "Gestiona datos del negocio, IGV y reglas comerciales." "C#"
                audit = component "Audit" "Registra eventos relevantes, actor, tenant, resultado y trace ID sin exponer secretos." "C#"
                realtime = component "Outbox and Realtime" "Persiste eventos en outbox y los publica después del commit para sincronizar sesiones." "C#, SignalR"
                persistence = component "Persistence adapters" "Implementa repositorios, transacciones, concurrencia optimista e idempotencia." "Entity Framework Core, Npgsql"
                shared = component "Shared" "Contiene tipos comunes, errores, validaciones técnicas, paginación, trazabilidad y contratos compartidos." "C#"
            }

            database = container "Base de datos transaccional" "Almacena el estado persistente del negocio." "PostgreSQL 18.x" {
                tags "Database"
            }

            redis = container "Cache y coordinación" "Soporta rate limiting distribuido y el backplane de SignalR." "Redis 8" {
                tags "Cache"
            }
        }

        correo = softwareSystem "Servicio de correo transaccional" "Envía invitaciones y enlaces de recuperación de contraseña."
        monitoreo = softwareSystem "Servicio de monitoreo externo" "Comprueba disponibilidad y salud de los servicios."

        administrador -> agilora.frontend "Utiliza Agilora." "HTTPS"
        operador -> agilora.frontend "Utiliza Agilora." "HTTPS"
        agilora.frontend -> agilora.backend.interfaces "Consume REST y recibe eventos SignalR." "HTTPS/JSON"
        monitoreo -> agilora.frontend "Comprueba disponibilidad del frontend." "HTTPS"
        monitoreo -> agilora.backend.interfaces "Consulta los endpoints de salud." "HTTPS"

        agilora.backend.interfaces -> agilora.backend.identity "Delega autenticación y sesiones." "C#"
        agilora.backend.interfaces -> agilora.backend.tenant "Resuelve el contexto del negocio." "C#"
        agilora.backend.interfaces -> agilora.backend.catalog "Delega operaciones de catálogo." "C#"
        agilora.backend.interfaces -> agilora.backend.inventory "Delega operaciones de inventario y abastecimiento." "C#"
        agilora.backend.interfaces -> agilora.backend.commercial "Delega operaciones comerciales." "C#"
        agilora.backend.interfaces -> agilora.backend.reporting "Delega reportes administrativos." "C#"
        agilora.backend.interfaces -> agilora.backend.dashboard "Delega el resumen del dashboard." "C#"
        agilora.backend.interfaces -> agilora.backend.settings "Delega configuración administrativa." "C#"

        agilora.backend.identity -> agilora.backend.tenant "Valida membresía, negocio y rol." "C#"
        agilora.backend.identity -> agilora.backend.persistence "Persiste credenciales, sesiones e invitaciones." "C#"
        agilora.backend.identity -> correo "Solicita invitaciones y recuperación." "HTTPS/API"
        agilora.backend.tenant -> agilora.backend.persistence "Consulta negocio y membresías." "C#"
        agilora.backend.catalog -> agilora.backend.tenant "Valida el tenant de la operación." "C#"
        agilora.backend.catalog -> agilora.backend.persistence "Persiste grupos, atributos, productos y precios." "C#"
        agilora.backend.inventory -> agilora.backend.tenant "Valida el tenant y permisos operativos." "C#"
        agilora.backend.inventory -> agilora.backend.catalog "Obtiene productos activos." "C#"
        agilora.backend.inventory -> agilora.backend.persistence "Actualiza stock y movimientos en transacciones." "C#"
        agilora.backend.commercial -> agilora.backend.tenant "Valida el tenant y permisos operativos." "C#"
        agilora.backend.commercial -> agilora.backend.catalog "Obtiene catálogo y precios vigentes." "C#"
        agilora.backend.commercial -> agilora.backend.settings "Obtiene IGV y costos adicionales." "C#"
        agilora.backend.commercial -> agilora.backend.inventory "Valida y actualiza stock al confirmar venta." "C#"
        agilora.backend.commercial -> agilora.backend.persistence "Persiste ventas, detalles e instantáneas históricas." "C#"
        agilora.backend.reporting -> agilora.backend.tenant "Valida rol ADMIN y tenant." "C#"
        agilora.backend.reporting -> agilora.backend.persistence "Consulta datos agregables sin alterar el historial." "C#"
        agilora.backend.dashboard -> agilora.backend.tenant "Valida rol ADMIN y tenant." "C#"
        agilora.backend.dashboard -> agilora.backend.persistence "Consulta indicadores y últimos eventos." "C#"
        agilora.backend.settings -> agilora.backend.tenant "Valida rol ADMIN y tenant." "C#"
        agilora.backend.settings -> agilora.backend.persistence "Persiste configuración con concurrencia optimista." "C#"

        agilora.backend.identity -> agilora.backend.audit "Registra accesos y cambios de sesión." "C#"
        agilora.backend.catalog -> agilora.backend.audit "Registra cambios administrativos del catálogo." "C#"
        agilora.backend.inventory -> agilora.backend.audit "Registra movimientos y ajustes." "C#"
        agilora.backend.commercial -> agilora.backend.audit "Registra ventas y cancelaciones." "C#"
        agilora.backend.settings -> agilora.backend.audit "Registra cambios de configuración." "C#"
        agilora.backend.audit -> agilora.backend.persistence "Guarda eventos de auditoría." "C#"
        agilora.backend.commercial -> agilora.backend.realtime "Publica cambios de stock después del commit." "C#"
        agilora.backend.inventory -> agilora.backend.realtime "Publica ingresos y ajustes después del commit." "C#"
        agilora.backend.realtime -> agilora.backend.persistence "Lee y marca eventos outbox." "C#"
        agilora.backend.realtime -> agilora.redis "Coordina distribución entre instancias." "Redis protocol/TLS"
        agilora.backend.persistence -> agilora.database "Lee y escribe información transaccional." "SQL/TLS"

        agilora.backend.interfaces -> agilora.backend.shared "Utiliza contratos y errores comunes." "C#"
        agilora.backend.identity -> agilora.backend.shared "Utiliza validaciones y tipos comunes." "C#"
        agilora.backend.catalog -> agilora.backend.shared "Utiliza paginación, validaciones y errores." "C#"
        agilora.backend.inventory -> agilora.backend.shared "Utiliza idempotencia y contratos comunes." "C#"
        agilora.backend.commercial -> agilora.backend.shared "Utiliza importes, validaciones y ProblemDetails." "C#"
    }

    views {
        component agilora.backend "Agilora-Backend-Components" "Componentes internos del Backend API de Agilora." {
            include *
            autolayout lr
        }

        styles {
            element "Person" {
                background #315C55
                color #FFFFFF
                shape person
            }

            element "Software System" {
                background #1F6F66
                color #FFFFFF
            }

            element "Container" {
                background #6D9F97
                color #FFFFFF
            }

            element "Component" {
                background #B7D1CB
                color #0F172A
            }

            element "Database" {
                background #567C76
                color #FFFFFF
                shape cylinder
            }

            element "Cache" {
                background #8D7664
                color #FFFFFF
                shape hexagon
            }
        }
    }
}
