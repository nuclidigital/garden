import type { Page } from "@playwright/test"

/**
 * La regresión sirve un build completamente local. Fuentes, Giscus y CDN no
 * forman parte del contrato que verifican estas pruebas y una conexión externa
 * lenta puede bloquear DOMContentLoaded hasta agotar el timeout del test.
 */
export async function blockThirdPartyRequests(page: Page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173(?:\/|$))/, (route) =>
    route.abort("blockedbyclient"),
  )
}
