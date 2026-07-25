Diagrama C4 Container
```dsl
workspace "PackFlow - C4 Container" "Diagrama de contenedores del sistema PackFlow." {

    !identifiers hierarchical

    model {
        administrador = person "Administrador" "Administra productos, inventario, cotizaciones, ventas y configuración."

        packflow = softwareSystem "PackFlow" "Aplicación web para administrar productos, consultar stock, simular cotizaciones y registrar ventas." {

            frontend = container "Aplicación web" "Interfaz para productos, inventario, cotizaciones, ventas, dashboard y configuración." "Vue.js, JavaScript"

            backend = container "Backend API" "Expone la API REST, autentica al administrador y aplica las reglas de negocio." "ASP.NET Core, C#"

            database = container "Base de datos" "Almacena cuentas, sesiones, refresh tokens, productos, precios, ventas, movimientos y configuraciones." "PostgreSQL" {
                tags "Database"
            }
        }

        monitoreo = softwareSystem "Servicio de monitoreo externo" "Verifica la disponibilidad del frontend y del Backend API."

        correo = softwareSystem "Servicio de correo transaccional" "Envía enlaces para recuperar la contraseña."

        administrador -> packflow.frontend "Utiliza PackFlow" "HTTPS"

        packflow.frontend -> packflow.backend "Consume la API REST" "HTTPS/JSON"

        packflow.backend -> packflow.database "Lee y escribe información transaccional." "SQL/TLS"

        packflow.backend -> correo "Solicita enlaces de recuperación de contraseña." "HTTPS/API"

        monitoreo -> packflow.frontend "Verifica la disponibilidad del frontend." "HTTPS"

        monitoreo -> packflow.backend "Consulta los endpoints de salud." "HTTPS"
    }

    views {
        container packflow "PackFlow-Containers" "Contenedores principales de PackFlow." {
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

            element "Database" {
                background #438DD5
                color #FFFFFF
                shape cylinder
            }
        }
    }
}
```
