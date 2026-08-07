# Personalización vigente de Garden Digital sobre Quartz v5

## Propósito

Inventario operativo de la personalización activa, preparado para extraerla a un repositorio GitHub reusable sin incluir contenido editorial ni historial de pruebas.

Referencia actual: `Garden Digital`, `garden.nuclidigital.com`, `locale: es-ES`, Quartz v5, tema Nord y GitHub Pages.

## Inventario de archivos

| Área                                  | Fuente                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| Configuración, plugins y colores base | `quartz.config.yaml`                                                                  |
| Popup GDPR                            | `quartz/components/CookieConsent.tsx`                                                 |
| Frames                                | `quartz/components/frames/DefaultFrame.tsx`, `FullWidthFrame.tsx`, `MinimalFrame.tsx` |
| Consent Mode, GA4 y recursos globales | `quartz/plugins/emitters/componentResources.ts`                                       |
| Layout y estilos propios              | `quartz/styles/custom.scss`                                                           |
| Mermaid nativo                        | `quartz/components/scripts/mermaid.inline.ts`                                         |
| Tema remoto Giscus                    | `quartz/static/giscus/light.css`, `dark.css`                                          |

No extraer `content/`, `public/`, el vault ni assets editoriales al repositorio de personalización.

## Tipografía y configuración

```yaml
pageTitle: Garden Digital
locale: es-ES
enableSPA: true
enablePopovers: true
analytics:
  provider: google
  tagId: G-71RJ704J8T
```

Fuentes: `Schibsted Grotesk` para encabezados, `Source Sans Pro` para lectura e `IBM Plex Mono` para código. El plugin de tema externo `quartz-themes` permanece desactivado para no sobrescribir Nord.

## Paleta Nord vigente

| Variable   | Hex       | Uso                      |
| ---------- | --------- | ------------------------ |
| `--nord0`  | `#2e3440` | centro dark              |
| `--nord1`  | `#3b4252` | laterales y paneles dark |
| `--nord2`  | `#434c5e` | divisores dark           |
| `--nord3`  | `#4c566a` | gris de soporte          |
| `--nord4`  | `#d8dee9` | divisores light          |
| `--nord5`  | `#e5e9f0` | laterales light          |
| `--nord6`  | `#eceff4` | centro light             |
| `--nord7`  | `#8fbcbb` | Frost teal               |
| `--nord8`  | `#88c0d0` | Frost cyan               |
| `--nord9`  | `#81a1c1` | Frost azul claro         |
| `--nord10` | `#5e81ac` | Frost principal y código |
| `--nord11` | `#bf616a` | Aurora rojo              |
| `--nord12` | `#d08770` | Aurora naranja           |
| `--nord13` | `#ebcb8b` | Aurora amarillo          |
| `--nord14` | `#a3be8c` | Aurora verde             |
| `--nord15` | `#b48ead` | Aurora púrpura           |

Superficies activas: light usa centro `#eceff4`, laterales `#e5e9f0` y divisor `#d8dee9`; dark usa centro `#2e3440`, laterales `#3b4252` y divisor `#434c5e`. El lateral derecho tiene reglas específicas para conservarlas aunque su contenido termine antes que el artículo.

## Layout responsive

La personalización elimina el ancho máximo estrecho de Quartz y aprovecha el viewport:

- desktop: laterales entre `240px` y `300px`, centro flexible;
- tablet: lateral izquierdo entre `220px` y `25vw`, centro flexible;
- móvil: una sola columna;
- `min-width: 0` en centro y sidebars para evitar overflow;
- padding fluido con `clamp()`;
- títulos equilibrados con `text-wrap: balance` y reducción en tablet/móvil.

No sustituir estas columnas por anchos fijos: conservar `minmax(0, 1fr)` y `clamp()`.

## TOC, backlinks y Explorer

El lateral derecho usa `height: fit-content`, `max-height: none` y `overflow: visible`. Solo `.toc-content` tiene scroll interno, limitado en desktop a `min(20rem, calc(100vh - 30rem))`; backlinks queda debajo y visible. El scrollbar usa el color secundario Nord.

El Explorer y el TOC comparten estados `hover`, `focus-visible` y activo con borde lateral, fondo translúcido y colores Nord. Los breadcrumbs limitan el último elemento con ellipsis. El título usa `max-width: 34ch`, `text-wrap: balance`, `2.35rem` en desktop, `2rem` en tablet y `1.65rem` en móvil. El primer H1 del cuerpo se centra.

## Código

Los lenguajes `bash`, `sh`, `shell`, `zsh`, `fish`, `powershell` y `console` tienen fondo Snow Storm `#e5e9f0` en light y Polar Night `#3b4252` en dark. El texto terminal e inline usa Frost `#5e81ac`; el ancho es completo y se conserva `white-space: pre`.

Los tokens Shiki mantienen diferenciación: funciones Frost cyan, strings Aurora verde, valores Aurora naranja, operadores Frost teal y puntuación gris.

## Mermaid

`mermaid.inline.ts` procesa `code.mermaid` y `code[data-language="mermaid"]` en cliente. Usa la librería `mermaid`, `startOnLoad: false`, ejecución explícita, rerender al cambiar light/dark, `securityLevel: loose` y variables Nord por modo. La configuración Markdown no debe convertir esos bloques a texto normal si el renderer local está activo.

## Tags, propiedades y previews

Tags del body, propiedades y popovers usan flex-wrap, gap `0.35rem`, borde y fondo derivados de `var(--secondary)`, texto secundario y `white-space: nowrap`. Las reglas `.popover` son imprescindibles porque Quartz monta los previews fuera del frame; estilizar solo `.page .tags` no basta.

## Giscus

Configuración vigente: repositorio `nuclidigital/garden`, categoría `Announcements`, mapeo `pathname`, títulos estrictos, reacciones activadas, idioma `es`, `inputPosition: bottom` y orden después de `Recent notes`. `quartz/static/giscus/light.css` y `dark.css` sobrescriben las variables Primer del iframe remoto con Nord; no se pueden sustituir por reglas del host.

## Método de extracción

1. Crear repositorio con `package.json`, metadata Quartz y compatibilidad `5.x`.
2. Separar popup, script Consent Mode y SCSS en un plugin parametrizable.
3. Extraer bloques Nord, layout, TOC, código, Mermaid y Giscus sin copiar estilos obsoletos.
4. Convertir valores fijos en opciones YAML: `tagId`, `privacyUrl`, `storageKey`, textos y colores.
5. Añadir tests de HTML, consentimiento, SPA, accesibilidad y responsive.
6. Ejecutar `tsc`, Prettier, build Quartz y comprobar bundles generados.
7. Publicar release GitHub y probar instalación en un Quartz limpio.

El script local `../publish-garden.sh` debe incluir `quartz/plugins/emitters` en su `git add` si se publican cambios del emitter. En un plugin independiente esa lógica debe viajar dentro del plugin, sin modificar el script del consumidor.
