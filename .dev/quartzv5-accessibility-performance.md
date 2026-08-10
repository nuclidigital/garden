# Quartz V5 · accesibilidad y presupuestos de rendimiento

## Objetivo

Esta capa convierte accesibilidad, interacción por teclado y peso inicial en puertas de publicación. Lighthouse conserva su papel diagnóstico: sus puntuaciones dependen del navegador, CPU y red, mientras que los presupuestos sobre el artefacto estático son deterministas y sí bloquean regresiones.

## Accesibilidad automatizada

`garden/tests/e2e/accessibility.spec.ts` ejecuta `@axe-core/playwright` en portada, una nota editorial y un área automática, en desktop 1440, tablet táctil 1024 y móvil táctil 390. Se analizan las reglas WCAG 2 A/AA, 2.1 A/AA y 2.2 AA; cualquier infracción `critical` o `serious` detiene la publicación y el informe Axe completo queda adjunto al resultado Playwright.

La prueba funcional adicional comprueba búsqueda, consentimiento, `prefers-reduced-motion` y el explorador responsive. El overlay recibe el foco en «Cerrar», contiene Tab y Shift+Tab, se cierra con Escape y devuelve el foco a la hamburguesa.

Las correcciones visuales asociadas usan `--soft-ink` en textos pequeños sobre superficies Everforest, conservando la variedad cromática en fondos y bordes. Los enlaces del explorador alcanzan al menos 28 px de alto y el desplazamiento horizontal de código pertenece al `pre` enfocable, no a un segundo contenedor inaccesible. `explorer-overlay.inline.ts` elimina además el `aria-expanded` inválido que el plugin comunitario asigna a elementos `div` y mantiene el estado en el botón controlador.

La automatización no sustituye una revisión manual periódica con lector de pantalla, zoom, alto contraste y navegación solo por teclado; protege de forma repetible los fallos detectables y los recorridos críticos.

## Presupuestos de rendimiento

`garden/performance-budgets.json` define páginas representativas y límites comprimidos para HTML, CSS, JavaScript, total inicial, mayor recurso, peticiones locales y orígenes externos. `garden/scripts/audit-performance-budgets.mjs` resuelve los recursos realmente enlazados por cada HTML de `public/`, los deduplica, calcula gzip y falla si cualquiera supera el contrato.

Los límites iniciales parten del build validado el 10 de agosto de 2026 y dejan margen deliberado para pequeños cambios, no para duplicar el coste:

- HTML gzip: 16 KiB;
- CSS gzip: 34 KiB;
- JavaScript gzip: 6 KiB;
- total gzip: 55 KiB;
- 32 recursos locales, 5 orígenes externos y 20 KiB para el mayor recurso.

Una ampliación intencionada debe justificar y actualizar el presupuesto en el mismo cambio. No se deben subir límites para silenciar una regresión accidental.

## Lighthouse y grafo responsive

`garden/scripts/run-lighthouse-report.mjs` levanta `public/` con clean URLs, compresión y caché equivalentes a hosting estático, ejecuta Lighthouse móvil y escribe `reports/lighthouse.html` y `reports/lighthouse.json`. `reports/` está ignorado: el informe es un artefacto local de diagnóstico, no contenido desplegable.

El primer diagnóstico descubrió que el plugin Graph descargaba y evaluaba D3 y Pixi incluso cuando el lateral estaba oculto en tablet/móvil. Pixi por sí solo transfería aproximadamente 434 KB y bloqueaba el hilo principal durante más de un segundo. `garden/scripts/patch-quartz-plugins.mjs` aplica sobre la revisión limpia instalada del plugin una carga condicionada a `min-width: 1201px`, recompila su distribución y preserva el grafo desktop. Al ampliar una ventana desde responsive a desktop, el `MediaQueryList` activa la carga una sola vez.

La customización no se edita dentro de `.quartz`, porque esa carpeta es caché ignorada y se reemplaza al instalar plugins. El script versionado es la fuente de verdad, aborta si cambia el bloque upstream esperado y se ejecuta tras `npm run install-plugins` en el publicador canónico. Esto elevó la medición local de rendimiento de 35 a 82, manteniendo 100 en accesibilidad, buenas prácticas y SEO.

## Publicación

`garden/scripts/publish-garden.sh` ejecuta, en orden, instalación de plugins, customización, contraste, build, presupuestos, toda la suite Playwright y Lighthouse antes de preparar el commit. `performance-budgets.json` figura expresamente en la allowlist raíz; `scripts/`, `tests/`, workflows y `.dev` ya son raíces publicables.

Comandos individuales:

```bash
npm run customize:plugins
npm run audit:performance
npm run test:e2e
npm run report:lighthouse
```

La ejecución habitual sigue siendo desde la raíz compartida:

```bash
./publish-garden.sh
```

## Referencias

- https://playwright.dev/docs/accessibility-testing
- https://github.com/GoogleChrome/lighthouse
- https://web.dev/articles/use-lighthouse-for-performance-budgets
