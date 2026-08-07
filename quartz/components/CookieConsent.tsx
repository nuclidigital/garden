import { QuartzComponent, QuartzComponentConstructor } from "./types"

const CookieConsent: QuartzComponent = () => (
  <section
    id="garden-consent"
    class="cookie-consent"
    role="dialog"
    aria-modal="false"
    aria-labelledby="cookie-consent-title"
    aria-describedby="cookie-consent-description"
  >
    <div class="cookie-consent__panel">
      <div>
        <h2 id="cookie-consent-title">Privacidad y cookies</h2>
        <p id="cookie-consent-description">
          Este sitio no realiza rastreo por defecto. Solo usamos almacenamiento técnico para
          recordar tu elección y Google Analytics si aceptas la analítica. Puedes cambiarla cuando
          quieras desde «Configuración de cookies». Consulta la{" "}
          <a href="https://nuclidigital.com/privacitat.html" target="_blank" rel="noopener">
            política de privacidad y cookies
          </a>
          .
        </p>
      </div>
      <div class="cookie-consent__preferences" id="garden-consent-preferences" hidden>
        <label class="cookie-consent__row">
          <span>
            <strong>Necesarias</strong>
            <small>
              Recuerdan tu elección mediante almacenamiento local, sin cookies de terceros.
            </small>
          </span>
          <input type="checkbox" checked disabled />
        </label>
        <label class="cookie-consent__row">
          <span>
            <strong>Analítica</strong>
            <small>Google Analytics 4 con Consent Mode v2 y anonimización de IP.</small>
          </span>
          <input type="checkbox" id="garden-consent-analytics" />
        </label>
      </div>
      <div class="cookie-consent__actions">
        <button type="button" class="cookie-consent__reject">
          Rechazar todo
        </button>
        <button type="button" class="cookie-consent__configure">
          Configurar
        </button>
        <button type="button" class="cookie-consent__accept">
          Aceptar todo
        </button>
      </div>
    </div>
  </section>
)

export default (() => CookieConsent) satisfies QuartzComponentConstructor
