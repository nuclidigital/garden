# Discovery de migración — Garden Digital

Fecha: 2026-08-08. Base de referencia: `a3362bf` en la rama original `v5`.

## Entorno encontrado

- Quartz `5.0.0`, Vault publicado en `content/`.
- Configuración activa: `quartz.config.yaml`; layout y componentes personalizados, incluido el menú en `quartz/components/garden.site.ts`.
- Publicación actual: `remove-draft` bloquea exclusivamente `draft: true`; `explicit-publish` está instalado pero desactivado.
- Ya activos: TagPage, TagList, Search, Backlinks, Graph, BasesPage y NoteProperties. Las Bases de control viven en `content/governance/` y Quartz las excluye por ser herramientas internas del Vault.
- El Vault no contiene `.obsidian/` ni archivos `.base` antes de esta migración.

## Inventario inicial

| Ruta                        | Notas | Metadata inicial                                          | URL pública                      |
| --------------------------- | ----: | --------------------------------------------------------- | -------------------------------- |
| `content/Digital/Sistemas/` |     2 | title, date, description, tags, permalink, aliases, draft | `ithings/...` mediante permalink |
| `content/index.md`          |     1 | title, unlisted                                           | portada                          |

Los directorios vacíos existentes (`Bitacora`, `Juegos`, `Lecturas`, `Perro`, `PodSplot`, `Temporadas`, `Digital`) no contienen notas y no se eliminan para evitar alterar el Vault local fuera de la clasificación publicada.

## Mapa de equivalencias

| Actual               | Objetivo             | Acción                        | Riesgo/mitigación                     |
| -------------------- | -------------------- | ----------------------------- | ------------------------------------- |
| `Digital/Sistemas/*` | `cuaderno/*`         | mover; `area: [digital]`      | URL preservada por `permalink`        |
| `Digital` en menú    | navegación editorial | sustituir por cuatro espacios | landings públicas impiden enlaces 404 |
| `date`               | `created`            | conservar y añadir `created`  | no se elimina metadata existente      |
| `draft: false`       | `publish: true`      | mantener ambos                | filtro real no cambia                 |

## Decisión

No se activa `explicit-publish`: hacerlo ahora ocultaría toda nota sin `publish: true` y cambiaría la política de publicación. Se adopta el campo de forma gradual y verificable.
