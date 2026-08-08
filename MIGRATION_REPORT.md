# Informe de migración — Garden Digital

Fecha: 2026-08-08. Rama: `refactor/garden-classification`.

## Cambios aplicados

- Se introdujeron las cuatro cajas: `cuaderno`, `temporadas`, `estudio` y `colecciones`, con landings públicas.
- Las dos notas técnicas se movieron a `content/cuaderno/`, se preservaron sus `permalink` y se añadió metadata canónica (`space`, `area`, `kind`, `project`, `season`, `phase`, `created`, `publish`, `cssclasses`).
- Se añadió la plantilla de entrada, gobernanza, vocabulario controlado y cinco Bases de control en `content/governance/`; esa carpeta queda excluida de Quartz porque son herramientas internas, no contenido editorial.
- Se añadió una landing editorial para el área Digital.
- El menú principal ahora expresa las cuatro cajas; Tags queda como exploración temática.
- NoteProperties muestra las properties estructurales canónicas sin duplicar los tags.

## Política de publicación

Se mantiene la compatibilidad: `draft: true` sigue excluyendo una nota. `publish` se registra desde ahora como decisión editorial; una futura activación de `explicit-publish` deberá precederse de una auditoría completa y de completar `publish: true` en todo el contenido destinado al sitio.

## Rollback

Volver al commit base `a3362bf` o restaurar las rutas anteriores desde Git. Los enlaces públicos de las dos notas no han cambiado porque sus `permalink` permanecen intactos.

## Pendiente editorial

Clasificar las notas que se añadan a las carpetas locales aún vacías antes de publicarlas; no se movieron directorios vacíos ni se inventarió contenido fuera de `garden/content`.
