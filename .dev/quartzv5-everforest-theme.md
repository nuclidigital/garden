# Tema Everforest light/dark para Quartz V5

## Objetivo

Esta customización recupera el selector nativo claro/oscuro de Quartz y sustituye Nord por Everforest `medium`. Mantiene los fondos cálidos y los siete acentos de la paleta (rojo, naranja, amarillo, verde, aqua, azul y púrpura), distribuidos por función para evitar una interfaz monocroma.

## Implementación

- `garden/quartz.config.yaml`: activa `darkmode`, define colores Quartz distintos para `lightMode` y `darkMode`, selecciona `everforest-light` y `everforest-dark` para Shiki y asigna a Giscus una hoja por modo.
- `garden/quartz/components/Head.tsx`: anuncia `color-scheme: light dark` al navegador.
- `garden/quartz/styles/custom.scss`: contiene los tokens completos de Everforest medium, superficies, marca, navegación, estados, sintaxis y reglas adaptativas de Mermaid.
- `garden/quartz/styles/callouts.scss`: asigna un color semántico y una superficie compatible a cada familia de callout.
- `garden/quartz/static/giscus/light.css` y `dark.css`: trasladan la paleta al iframe de comentarios.
- `garden/scripts/audit-theme-contrast.mjs`: comprueba texto, botones sólidos y etiquetas Mermaid en ambos modos.

## Criterio de accesibilidad

Los acentos originales de Everforest light están diseñados principalmente para sintaxis y varios no alcanzan 4.5:1 como texto sobre `#fdf6e3`. Por ello se conservan como tokens `--ef-*-vivid` para fondos, halos y ornamento, mientras los tokens de texto usan variantes más oscuras. El modo dark utiliza los acentos oficiales sin adaptación porque ya alcanzan AA sobre `#2d353b`.

Mermaid no depende únicamente del tema generado por Quartz: se fuerzan superficies y tinta con tokens CSS, incluida la corrección de `classDef` inline procedente de notas antiguas. Se contemplan estados `start`, `decision`, `repair` y `success`, además de nodos, clusters, aristas, flechas y etiquetas.

Mermaid convierte cada `classDef` en estilo inline con `!important`, que no puede sobrescribirse de forma fiable desde una hoja externa. Los dos workflows WSL conservan las asignaciones de clase (`start`, `decision`, `diagnostic`, `repair`, `success`), pero delegan su representación en `custom.scss`; así mantienen la semántica y cambian con el selector sin duplicar el diagrama.

## Publicación y mantenimiento

La fuente de esta documentación vive en `.dev/` junto al repositorio. `garden/scripts/publish-garden.sh` la sincroniza a `garden/.dev/`, ejecuta la auditoría de contraste, construye Quartz y añade todas las rutas customizadas al commit. Por tanto no hay que copiar manualmente hojas, componentes ni documentación.

Si se modifica cualquier token que funcione como texto, debe actualizarse el contrato en `audit-theme-contrast.mjs`. La publicación se detendrá si un par baja de WCAG AA.

## Referencias

- https://github.com/sainnhe/everforest
- https://github.com/sainnhe/everforest/blob/master/palette.md
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
