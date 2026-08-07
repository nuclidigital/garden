import { QuartzComponent, QuartzComponentConstructor } from "./types"

const CookieConsent: QuartzComponent = () => (
  <section
    id="garden-cookie-consent"
    class="cookie-consent"
    role="dialog"
    aria-labelledby="cookie-consent-title"
  >
    <div class="cookie-consent__panel">
      <div>
        <h2 id="cookie-consent-title">Privacidad y analítica</h2>
        <p>
          Usamos analítica opcional para conocer el uso del sitio. No se activa hasta que la
          aceptes.
        </p>
      </div>
      <div class="cookie-consent__actions">
        <button type="button" class="cookie-consent__reject">
          Rechazar
        </button>
        <button type="button" class="cookie-consent__accept">
          Aceptar analítica
        </button>
      </div>
    </div>
  </section>
)

export default (() => CookieConsent) satisfies QuartzComponentConstructor
