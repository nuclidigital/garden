# Quartz V5 · regresión funcional y responsive

## Objetivo

Esta customización protege las rutas críticas del jardín antes de cada publicación. La suite usa Playwright sobre el resultado estático de Quartz y prueba la experiencia real en Chromium, no solo la presencia de HTML.

## Contratos cubiertos

- desktop de 1440 px, tablet táctil de 1024 px y móvil táctil de 390 px;
- ausencia de desbordamiento horizontal;
- dark como tema inicial y persistencia de una elección light;
- ausencia completa del antiguo botón y atributo de modo lectura;
- navegación nativa del selector de áreas y de los enlaces bajo «Relacionado»;
- explorador móvil/tablet visible, operable y cerrable mediante Escape y el botón «Cerrar»;
- tres columnas en desktop;
- marca «Garden Digital», búsqueda, selector de tema y hamburguesa en una misma línea tanto en tablet como en móvil, con controles táctiles de al menos 44 px.

Los fallos conservan captura de pantalla y traza en `test-results/`; el informe HTML se genera en `playwright-report/`. Ambas carpetas son artefactos locales y están ignoradas por Git.

## Ejecución

`npm run test:e2e` levanta temporalmente `public/` en `127.0.0.1:4173` mediante `serve-handler`, el mismo motor usado por el servidor de Quartz. Así reproduce las clean URLs de producción (`/ruta` resuelve `ruta.html`). Debe ejecutarse después de construir Quartz. `garden/scripts/publish-garden.sh` ya respeta este orden:

1. auditoría cromática WCAG;
2. build de Quartz;
3. regresión Playwright;
4. commit y push únicamente si todo lo anterior termina correctamente.

La configuración busca Chromium en `PLAYWRIGHT_CHROMIUM_PATH`, `/usr/sbin/chromium`, `/usr/bin/chromium` y `/usr/bin/google-chrome`, por ese orden. Si no encuentra ninguno, Playwright usa su navegador administrado; puede instalarse con `npx playwright install chromium`.

## Archivos

- `garden/playwright.config.ts`: navegadores, viewports, servidor y artefactos.
- `garden/tests/e2e/garden.spec.ts`: contratos funcionales y responsive.
- `garden/scripts/serve-regression.mjs`: servidor local con clean URLs.
- `garden/scripts/publish-garden.sh`: puerta de publicación.
