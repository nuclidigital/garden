# Quartz V5 · regresión funcional y responsive

## Objetivo

Esta customización protege las rutas críticas del jardín antes de cada publicación. La suite usa Playwright sobre el resultado estático de Quartz y prueba la experiencia real en Chromium, no solo la presencia de HTML.

## Contratos cubiertos

- desktop de 1440 px, tablet táctil de 1024 px y móvil táctil de 390 px;
- ausencia de desbordamiento horizontal;
- dark como tema inicial y persistencia de una elección light;
- ausencia completa del antiguo botón y atributo de modo lectura;
- navegación nativa determinista del selector de áreas y de los enlaces bajo «Relacionado»: un clic primario usa `window.location.assign`, mientras modificadores, `_blank` y descargas conservan el comportamiento estándar del navegador;
- explorador móvil/tablet visible, operable y cerrable mediante Escape y el botón «Cerrar»;
- foco inicial en «Cerrar», ciclo de foco dentro del overlay y devolución del foco a la hamburguesa;
- búsqueda y consentimiento operables mediante teclado, con devolución de foco al cerrar;
- ausencia de infracciones Axe `critical` o `serious` para WCAG 2 A/AA, 2.1 A/AA y 2.2 AA;
- respeto de `prefers-reduced-motion`;
- tres columnas en desktop;
- marca «Garden Digital», búsqueda, selector de tema y hamburguesa en una misma línea tanto en tablet como en móvil, con controles táctiles de al menos 44 px.

Los fallos conservan captura de pantalla y traza en `test-results/`; el informe HTML se genera en `playwright-report/`. Ambas carpetas son artefactos locales y están ignoradas por Git.

## Arquitectura responsive protegida

### Desktop · desde 1201 px

- tres columnas: exploración, contenido y contexto;
- buscador y selector de tema permanecen en el rail izquierdo;
- TOC, backlinks y grafo permanecen visibles como tarjetas del lateral derecho;
- no se muestra la hamburguesa responsive.

### Tablet · de 801 a 1200 px

- una columna principal, sin rail izquierdo comprimido;
- cabecera horizontal de ancho completo;
- orden estable: `Garden Digital` → búsqueda → light/dark → hamburguesa;
- explorador en overlay de pantalla completa;
- redes sociales en una segunda fila y tarjetas contextuales después del artículo;
- «Entradas recientes» se omite para evitar duplicar navegación y alargar la cabecera.

### Móvil · hasta 800 px

- conserva la misma fila principal y el mismo orden que tablet;
- los botones de búsqueda, tema y explorador mantienen al menos 44 × 44 px;
- redes sociales ocupan una fila independiente;
- por debajo de 360 px desaparece el símbolo de la marca, pero nunca el texto «Garden Digital»;
- el explorador bloquea el scroll de fondo y puede cerrarse con su botón, Escape o navegación.

El modo lectura no forma parte de ninguno de los layouts. Se retiró su plugin, su entrada de lock y sus estilos porque ocultaba TOC, backlinks y grafo sin ampliar la columna central, reduciendo funcionalidad sin ofrecer una vista de lectura completa.

## Ejecución

`npm run test:e2e` levanta temporalmente `public/` en `127.0.0.1:4173` mediante `serve-handler`, el mismo motor usado por el servidor de Quartz. Así reproduce las clean URLs de producción (`/ruta` resuelve `ruta.html`). Debe ejecutarse después de construir Quartz. `garden/scripts/publish-garden.sh` ya respeta este orden:

1. instalación y customización reproducible de plugins;
2. auditoría cromática WCAG;
3. build de Quartz;
4. presupuestos deterministas de rendimiento;
5. regresión Playwright funcional, responsive y Axe;
6. informe Lighthouse;
7. commit y push únicamente si todo lo anterior termina correctamente.

La configuración busca Chromium en `PLAYWRIGHT_CHROMIUM_PATH`, `/usr/sbin/chromium`, `/usr/bin/chromium` y `/usr/bin/google-chrome`, por ese orden. Si no encuentra ninguno, Playwright usa su navegador administrado; puede instalarse con `npx playwright install chromium`.

La prueba de cabecera mide posiciones reales mediante `boundingBox`: exige que los centros verticales de marca, búsqueda, tema y hamburguesa difieran como máximo 6 px, comprueba su orden horizontal y verifica 44 px mínimos en los tres controles interactivos. Este contrato se ejecuta en tablet y móvil y se omite intencionadamente en desktop.

## Archivos

- `garden/playwright.config.ts`: navegadores, viewports, servidor y artefactos.
- `garden/tests/e2e/garden.spec.ts`: contratos funcionales y responsive.
- `garden/tests/e2e/accessibility.spec.ts`: Axe, teclado, foco y movimiento reducido.
- `garden/scripts/serve-regression.mjs`: servidor local con clean URLs.
- `garden/scripts/publish-garden.sh`: puerta de publicación.

`publish-garden.sh` incluye `tests/` entre sus raíces publicables y `playwright.config.ts` en su allowlist de metadatos. Si una futura prueba o configuración quedara fuera del staging, la publicación abortaría antes del commit en lugar de desplegar una protección incompleta.
