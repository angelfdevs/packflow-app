Diagrama C4 Context
```dsl
workspace "PackFlow - C4 Context" "Diagrama de contexto del sistema PackFlow." {

    !identifiers hierarchical

    model {
        administrador = person "Administrador" "Propietario o trabajador autorizado que administra el negocio."

        packflow = softwareSystem "PackFlow" "Aplicación web para administrar productos, consultar stock, simular cotizaciones y registrar ventas."

        monitoreo = softwareSystem "Servicio de monitoreo externo" "Verifica la disponibilidad del frontend y del Backend API."

        correo = softwareSystem "Servicio de correo transaccional" "Envía enlaces para recuperar la contraseña de la cuenta administradora."

        administrador -> packflow "Administra productos, inventario, cotizaciones, ventas y configuración." "HTTPS"

        monitoreo -> packflow "Verifica la disponibilidad de la aplicación." "HTTPS"

        packflow -> correo "Solicita el envío de enlaces de recuperación de contraseña." "HTTPS/API"
    }

    views {
        systemContext packflow "PackFlow-System-Context" "Contexto del sistema PackFlow." {
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
        }
    }
}
```
