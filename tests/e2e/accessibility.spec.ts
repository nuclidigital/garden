import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const routes = ["/", "/cuaderno/grifon-korthals", "/areas/cuaderno/digital"]
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

for (const route of routes) {
  test(`Axe no detecta errores WCAG serios en ${route}`, async ({ page }, testInfo) => {
    await page.goto(route, { waitUntil: "domcontentloaded" })
    await expect(page.locator("html")).toHaveAttribute("saved-theme", /^(dark|light)$/)

    // Giscus obtiene la hoja publicada desde un iframe de terceros. Se excluye
    // aquí para que CI no audite la versión desplegada anterior; sus pares de
    // color customizados se validan en audit-theme-contrast.mjs.
    const scan = await new AxeBuilder({ page })
      .exclude("iframe.giscus-frame")
      .withTags(wcagTags)
      .analyze()
    await testInfo.attach("axe-wcag-report", {
      body: JSON.stringify(scan, null, 2),
      contentType: "application/json",
    })

    const blocking = scan.violations
      .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.map((node) => node.target),
      }))

    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })
}

test("overlays, consentimiento y movimiento respetan teclado y preferencias", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/", { waitUntil: "domcontentloaded" })

  // El buscador inicializa su índice y registra los listeners de forma
  // asíncrona después de DOMContentLoaded. Este nodo solo existe al terminar.
  await expect(page.locator(".search .tag-suggestions")).toBeAttached()
  const searchButton = page.locator(".search-button")
  await searchButton.focus()
  await page.keyboard.press("Enter")
  await expect(page.locator(".search-bar")).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(searchButton).toBeFocused()

  const configureConsent = page.locator(".cookie-consent__configure")
  await configureConsent.focus()
  await page.keyboard.press("Enter")
  await expect(page.locator("#garden-consent-analytics")).toBeFocused()

  const transitionDuration = await page
    .locator(".site-brand-mark")
    .evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.001)

  const viewport = page.viewportSize()
  if ((viewport?.width ?? 0) > 1200) return

  const hamburger = page.locator(".mobile-explorer")
  await hamburger.focus()
  await page.keyboard.press("Enter")
  const close = page.locator(".explorer-overlay-close")
  await expect(close).toBeFocused()

  await page.keyboard.press("Shift+Tab")
  await expect(page.locator(".explorer-content")).toContainText(/Cerrar/)
  const focusInsidePanel = await page.evaluate(() =>
    Boolean(document.activeElement?.closest(".explorer-content")),
  )
  expect(focusInsidePanel).toBe(true)

  await page.keyboard.press("Escape")
  await expect(hamburger).toBeFocused()
})
