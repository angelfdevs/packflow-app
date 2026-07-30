# ADR-003: Preferencias visuales por usuario

## Estado

Aceptada.

## Contexto

Agilora permite que varias personas trabajen en el mismo negocio al mismo tiempo. El IGV y las reglas comerciales pertenecen al negocio, pero el tema visual y el tamaño de fuente describen cómo cada persona utiliza la aplicación.

Si esas preferencias se guardaran como configuración global, un operador podría cambiar la apariencia que ve el administrador y viceversa. No aporta valor al negocio y genera una dependencia innecesaria entre sesiones.

## Decisión

Las preferencias de tema y tamaño de fuente se guardarán por usuario en `user_preferences`. Se consultarán y actualizarán mediante `/me/preferences`.

La configuración del negocio se mantendrá separada en `/account` y `/settings`. El IGV y las reglas comerciales seguirán siendo datos del negocio y solo `ADMIN` podrá modificarlos.

## Consecuencias

- Cada miembro puede elegir su propia apariencia sin afectar a los demás.
- La preferencia no modifica precios, stock, ventas ni reglas comerciales.
- El backend sigue siendo la fuente oficial; el navegador solo puede mantener una caché visual no sensible.
- El ERD, OpenAPI, requisitos y pruebas deben conservar esta separación.
