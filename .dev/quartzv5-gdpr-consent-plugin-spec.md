# Especificación: plugin GDPR para Quartz v5

## Objetivo

Extraer el gestor GDPR/Consent Mode vigente de Garden Digital y convertirlo en un plugin reutilizable para Quartz v5, compatible con GitHub Pages y con la navegación SPA de Quartz.

El plugin debe mostrar consentimiento sin decisión, permitir aceptar, rechazar y configurar analítica, recordar la elección, cargar GA4 solo tras aceptación, respetar GPC/DNT y permitir reabrir preferencias desde el footer.

## Fuentes actuales

| Función                           | Archivo                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| Marcado del diálogo               | `quartz/components/CookieConsent.tsx`                                                 |
| Script global, Consent Mode y GA4 | `quartz/plugins/emitters/componentResources.ts`                                       |
| Inclusión en frames               | `quartz/components/frames/DefaultFrame.tsx`, `FullWidthFrame.tsx`, `MinimalFrame.tsx` |
| Estilos                           | `quartz/styles/custom.scss`                                                           |
| Enlace de reapertura e ID GA4     | `quartz.config.yaml`                                                                  |

No extraer `content/`, `public/`, el vault ni assets editoriales al repositorio del plugin.

## Configuración propuesta

```yaml
plugins:
  - source: github:ORG/quartz-gdpr-consent
    enabled: true
    options:
      storageKey: garden-consent
      privacyUrl: https://example.com/privacy.html
      locale: es-ES
      analytics:
        provider: google
        tagId: G-XXXXXXXXXX
      respectGlobalPrivacyControl: true
      respectDoNotTrack: true
      reopenHref: "#cookie-settings"
```

La configuración actual es `tagId: G-71RJ704J8T` y `locale: es-ES`. Nunca publicar un ID ficticio.

## Estado persistido

Clave actual: `garden-consent`. El formato versionado contiene `v`, `ts`, `necessary` y `analytics`, por ejemplo: `{"v":1,"ts":"2026-08-08T12:00:00.000Z","necessary":true,"analytics":false}`.

JSON ausente, inválido o con otra versión equivale a ausencia de decisión. `necessary` siempre es `true`; `analytics` controla GA4; `ts` es informativo y no renueva el consentimiento.

## Flujo

1. El frame renderiza `#garden-consent`.
2. El script lee `localStorage` dentro de `try/catch`.
3. Sin decisión válida, el diálogo es visible; con decisión, usa `hidden`.
4. GPC o DNT fuerzan analítica desactivada.
5. Aceptar guarda `analytics: true`, oculta el diálogo, emite `garden-consent-changed` y actualiza Consent Mode.
6. Rechazar guarda `analytics: false`, oculta el diálogo y no solicita Google.
7. Configurar expande las preferencias “Necesarias” y “Analítica”.

El footer usa `href="#cookie-settings"`. El listener delegado debe buscar el banner actual en cada click porque Quartz reemplaza el DOM durante SPA.

## Contrato DOM

Selectores vigentes: `#garden-consent`, `#garden-consent-preferences`, `#garden-consent-analytics`, `.cookie-consent__reject`, `.cookie-consent__configure`, `.cookie-consent__accept` y `a[href="#cookie-settings"]`.

Conservar `role="dialog"`, `aria-labelledby`, `aria-describedby`, botones `button` y etiqueta visible del checkbox.

## SPA

El plugin debe inicializarse en carga inicial y en `nav` y `render`:

```js
document.addEventListener("nav", init)
document.addEventListener("render", init)
init()
```

`init()` debe ser idempotente: localizar el banner nuevo, aplicar `hidden`, actualizar el checkbox y enlazar botones una sola vez mediante `data-bound`.

## Consent Mode v2

Antes de GA4 se debe configurar `ad_storage`, `ad_user_data`, `ad_personalization` y `analytics_storage` como `denied`. Con aceptación se actualiza `analytics_storage` a `granted` y se configura GA4 con `send_page_view: false` y `anonymize_ip: true`.

Usar una marca como `window.__gardenGoogleAnalyticsLoaded`; `nav` puede enviar vistas, pero no duplicar el script. El punto probado en Garden es `componentResources.afterDOMLoaded`, no `Head.tsx`.

## Extracción a GitHub

```text
quartz-gdpr-consent/
├── src/index.ts
├── src/components/CookieConsent.tsx
├── src/components/styles/consent.scss
├── src/components/scripts/consent.inline.ts
├── test/consent.test.ts
├── README.md
├── package.json
└── LICENSE
```

El README debe incluir instalación GitHub, YAML, storage key, eventos, legal, GA4 y compatibilidad Quartz `5.x`.

## Pruebas

Probar carga sin decisión, aceptar, rechazar, configurar desmarcado, reapertura desde footer, navegación SPA, borrado de storage, storage bloqueado, GPC/DNT, teclado, foco visible y móvil sin overflow.

## Legal

Los textos parten de la plantilla pública de [NucliDigital](https://nuclidigital.com/privacitat.html): no hay rastreo por defecto, storage local técnico y GA4 solo con consentimiento. Son referencia técnica, no asesoramiento jurídico; cada sitio debe revisar su política.
