workspace "Agilora - C4 Container" "Contenedores principales del SaaS multiempresa Agilora." {

    !identifiers hierarchical

    model {
        administrador = person "Administrador" "Administra el negocio, usuarios, reglas comerciales, reportes y operaciones."
        operador = person "Operador" "Realiza las operaciones autorizadas del negocio."

        agilora = softwareSystem "Agilora" "SaaS multiempresa para gestionar catálogo, inventario, abastecimientos y operaciones comerciales." {
            frontend = container "Aplicación web" "Interfaz responsive para la operación diaria y la administración." "Vue 3, JavaScript, Vite, CoreUI"
            backend = container "Backend API" "Expone REST y SignalR, aplica autenticación, autorización, reglas de negocio y transacciones." "ASP.NET Core, C#, .NET 10"
            database = container "Base de datos transaccional" "Almacena negocios, membresías, catálogo, stock, abastecimientos, ventas, auditoría y outbox." "PostgreSQL 18.x" {
                tags "Database"
            }
            redis = container "Cache y coordinación" "Centraliza rate limiting, datos efímeros y backplane de SignalR cuando hay varias instancias." "Redis 8" {
                tags "Cache"
            }
        }

        correo = softwareSystem "Servicio de correo transaccional" "Envía invitaciones y enlaces de recuperación de contraseña."
        monitoreo = softwareSystem "Servicio de monitoreo externo" "Comprueba disponibilidad y endpoints de salud."

        administrador -> agilora.frontend "Utiliza el panel administrativo y operativo." "HTTPS"
        operador -> agilora.frontend "Utiliza los módulos operativos autorizados." "HTTPS"
        agilora.frontend -> agilora.backend "Consume la API REST y recibe eventos de actualización." "HTTPS, JSON, SignalR"
        agilora.backend -> agilora.database "Lee y escribe información transaccional." "SQL/TLS"
        agilora.backend -> agilora.redis "Coordina rate limiting, sesiones efímeras y eventos distribuidos." "Redis protocol/TLS"
        agilora.backend -> correo "Solicita invitaciones y recuperación de contraseña." "HTTPS/API"
        monitoreo -> agilora.frontend "Comprueba la aplicación web publicada." "HTTPS"
        monitoreo -> agilora.backend "Consulta liveness y readiness." "HTTPS"
    }

    views {
        container agilora "Agilora-Containers" "Contenedores de la solución Agilora." {
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
