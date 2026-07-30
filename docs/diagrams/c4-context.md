workspace "Agilora - C4 Context" "Contexto del SaaS multiempresa Agilora." {

    !identifiers hierarchical

    model {
        administrador = person "Administrador" "Administra el negocio, usuarios, reglas comerciales, reportes y también las operaciones diarias."
        operador = person "Operador" "Realiza las operaciones autorizadas de catálogo, inventario, abastecimiento y ventas."

        agilora = softwareSystem "Agilora" "SaaS multiempresa para gestionar catálogo, inventario, abastecimientos y operaciones comerciales de microempresas y pequeñas empresas."

        correo = softwareSystem "Servicio de correo transaccional" "Envía invitaciones y enlaces de recuperación de contraseña."
        monitoreo = softwareSystem "Servicio de monitoreo externo" "Comprueba la disponibilidad y el estado de los servicios publicados."

        administrador -> agilora "Administra el negocio y realiza operaciones diarias." "HTTPS"
        operador -> agilora "Consulta y actualiza las operaciones permitidas de su negocio." "HTTPS"
        agilora -> correo "Solicita el envío de invitaciones y enlaces de recuperación." "HTTPS/API"
        monitoreo -> agilora "Comprueba disponibilidad y endpoints de salud." "HTTPS"
    }

    views {
        systemContext agilora "Agilora-System-Context" "Actores y sistemas externos que interactúan con Agilora." {
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
        }
    }
}
