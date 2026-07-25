Diagrama C4 Component
```dsl
workspace "PackFlow - C4 Component" "Diagrama de componentes del Backend API de PackFlow." {

    !identifiers hierarchical

    model {
        administrador = person "Administrador" "Administra productos, inventario, cotizaciones, ventas y configuración."

        packflow = softwareSystem "PackFlow" "Aplicación web para administrar productos, inventario, cotizaciones y ventas." {

            frontend = container "Aplicación web" "Interfaz para administrar productos, inventario, cotizaciones, ventas y configuración." "Vue.js, JavaScript"

            backend = container "Backend API" "Expone los endpoints REST y contiene las reglas de negocio." "ASP.NET Core, C#" {

                api = component "API REST" "Recibe solicitudes HTTP, valida el acceso y delega los casos de uso." "ASP.NET Core"

                auth = component "Autenticación y sesión" "Gestiona inicio de sesión, cierre de sesión, renovación y recuperación de contraseña." "ASP.NET Core, C#"

                catalogo = component "Catálogo de productos" "Gestiona productos, categorías, materiales, precios y activación de productos." "C#"

                inventario = component "Inventario" "Gestiona stock, ingresos, ajustes, movimientos y validación de stock no negativo." "C#"

                cotizaciones = component "Cotizaciones" "Calcula cotizaciones temporales con múltiples productos sin guardarlas ni modificar el stock." "C#"

                ventas = component "Ventas" "Registra ventas confirmadas y actualiza transaccionalmente el inventario." "C#"

                reglas = component "Reglas comerciales" "Calcula precios minoristas, mayoristas, serigrafía, descuentos, IGV y totales." "C#"

                configuracion = component "Configuración" "Gestiona IGV, tarifas de serigrafía, tema visual y tamaño de fuente." "C#"

                dashboard = component "Dashboard" "Obtiene indicadores de productos, stock, movimientos y ventas." "C#"

                persistencia = component "Persistencia" "Implementa repositorios, transacciones e idempotencia." "Entity Framework Core, C#"

                shared = component "Shared" "Contiene validaciones, errores, identificadores y contratos comunes." "C#"
            }

            database = container "Base de datos" "Almacena cuentas, sesiones, productos, precios, ventas, movimientos y configuraciones." "PostgreSQL" {
                tags "Database"
            }
        }

        monitoreo = softwareSystem "Servicio de monitoreo externo" "Verifica la disponibilidad de PackFlow."

        correo = softwareSystem "Servicio de correo transaccional" "Envía enlaces de recuperación de contraseña."

        administrador -> packflow.frontend "Utiliza PackFlow" "HTTPS"

        packflow.frontend -> packflow.backend "Consume la API REST" "HTTPS/JSON"

        monitoreo -> packflow.frontend "Verifica la disponibilidad del frontend" "HTTPS"

        monitoreo -> packflow.backend "Consulta los endpoints de salud" "HTTPS"

        packflow.backend.api -> packflow.backend.auth "Delega solicitudes de autenticación" "C#"

        packflow.backend.api -> packflow.backend.catalogo "Delega solicitudes del catálogo" "C#"

        packflow.backend.api -> packflow.backend.inventario "Delega solicitudes de inventario" "C#"

        packflow.backend.api -> packflow.backend.cotizaciones "Delega solicitudes de cotización" "C#"

        packflow.backend.api -> packflow.backend.ventas "Delega solicitudes de venta" "C#"

        packflow.backend.api -> packflow.backend.configuracion "Delega solicitudes de configuración" "C#"

        packflow.backend.api -> packflow.backend.dashboard "Delega consultas del dashboard" "C#"

        packflow.backend.auth -> packflow.backend.persistencia "Guarda y consulta cuentas, sesiones y tokens de recuperación" "C#"

        packflow.backend.auth -> correo "Solicita enlaces de recuperación de contraseña" "HTTPS/API"

        packflow.backend.catalogo -> packflow.backend.persistencia "Guarda y consulta productos, categorías, materiales y precios" "C#"

        packflow.backend.inventario -> packflow.backend.persistencia "Guarda movimientos y actualiza el stock mediante transacciones" "C#"

        packflow.backend.cotizaciones -> packflow.backend.catalogo "Obtiene productos y precios activos" "C#"

        packflow.backend.cotizaciones -> packflow.backend.reglas "Calcula subtotal, serigrafía, descuento, IGV y total" "C#"

        packflow.backend.cotizaciones -> packflow.backend.configuracion "Obtiene tarifas e IGV configurados" "C#"

        packflow.backend.ventas -> packflow.backend.catalogo "Obtiene productos y precios activos" "C#"

        packflow.backend.ventas -> packflow.backend.reglas "Calcula importes comerciales" "C#"

        packflow.backend.ventas -> packflow.backend.inventario "Solicita validación y disminución transaccional del stock" "C#"

        packflow.backend.ventas -> packflow.backend.persistencia "Guarda ventas y detalles históricos" "C#"

        packflow.backend.ventas -> packflow.backend.configuracion "Obtiene tarifas e IGV configurados" "C#"

        packflow.backend.dashboard -> packflow.backend.persistencia "Consulta productos, stock, movimientos y ventas" "C#"

        packflow.backend.auth -> packflow.backend.shared "Utiliza validaciones y errores comunes" "C#"

        packflow.backend.catalogo -> packflow.backend.shared "Utiliza contratos comunes" "C#"

        packflow.backend.inventario -> packflow.backend.shared "Utiliza errores e idempotencia" "C#"

        packflow.backend.cotizaciones -> packflow.backend.shared "Utiliza DTOs y validaciones comunes" "C#"

        packflow.backend.ventas -> packflow.backend.shared "Utiliza transacciones e idempotencia" "C#"

        packflow.backend.persistencia -> packflow.database "Lee y escribe información" "SQL"
    }

    views {
        component packflow.backend "PackFlow-Backend-Components" "Componentes internos del Backend API de PackFlow." {
            include *
            autolayout lr
        }

        styles {
            element "Person" {
                background #084B83
                color #FFFFFF
                shape person
            }

            element "Software System" {
                background #1168BD
                color #FFFFFF
            }

            element "Container" {
                background #438DD5
                color #FFFFFF
            }

            element "Component" {
                background #85BBF0
                color #000000
            }

            element "Database" {
                background #438DD5
                color #FFFFFF
                shape cylinder
            }
        }
    }
}
```
