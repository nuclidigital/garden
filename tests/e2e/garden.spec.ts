import { expect, test, type Page } from "@playwright/test"

async function openPage(page: Page, path = "/") {
  await page.goto(path, { waitUntil: "domcontentloaded" })
  await expect(page.locator("html")).toHaveAttribute("saved-theme", /^(dark|light)$/)
}

test("la interfaz base conserva tema, ancho y controles esenciales", async ({ page }) => {
  await openPage(page)

  await expect(page.locator("button.readermode")).toHaveCount(0)
  await expect(page.locator("html")).not.toHaveAttribute("reader-mode", /.+/)
  await expect(page.locator("html")).toHaveAttribute("saved-theme", "dark")

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  await page.locator("button.darkmode").click()
  await expect(page.locator("html")).toHaveAttribute("saved-theme", "light")
  await page.reload({ waitUntil: "domcontentloaded" })
  await expect(page.locator("html")).toHaveAttribute("saved-theme", "light")
})

test("áreas y Relacionado navegan de forma nativa", async ({ page }) => {
  await openPage(page, "/cuaderno/grifon-korthals")

  const areaLink = page.locator(".area-nav-link", { hasText: "digital" })
  await expect(areaLink).toHaveAttribute("data-router-ignore", "true")
  await areaLink.click()
  await expect(page).toHaveURL(/\/areas\/cuaderno\/digital\/?$/)

  await openPage(page, "/cuaderno/grifon-korthals")
  const relatedLink = page.locator("h2#relacionado + ul a.internal-link").first()
  await expect(relatedLink).toHaveAttribute("data-router-ignore", "true")
  await relatedLink.click()
  await expect(page).toHaveURL(/\/colecciones\/el-perro-de-los-baskerville\/?$/)
})

test("el layout responde al ancho y el explorador siempre puede cerrarse", async ({ page }) => {
  await openPage(page)
  const viewport = page.viewportSize()
  expect(viewport).not.toBeNull()

  const mobileExplorer = page.locator(".explorer button.mobile-explorer")
  const rightSidebar = page.locator(".right.sidebar")

  if (viewport!.width > 1200) {
    await expect(mobileExplorer).toBeHidden()
    await expect(rightSidebar).toBeVisible()

    const columns = await page
      .locator("#quartz-body")
      .evaluate((body) => getComputedStyle(body).gridTemplateColumns.split(" ").filter(Boolean))
    expect(columns).toHaveLength(3)
    return
  }

  await expect(mobileExplorer).toBeVisible()
  await mobileExplorer.click()

  const explorer = page.locator(".explorer")
  const panel = explorer.locator(".explorer-content")
  await expect(explorer).not.toHaveClass(/collapsed/)
  await expect(panel).toBeVisible()
  await expect(panel).toHaveAttribute("aria-hidden", "false")

  await page.keyboard.press("Escape")
  await expect(explorer).toHaveClass(/collapsed/)
  await expect(panel).toHaveAttribute("aria-hidden", "true")

  await mobileExplorer.click()
  await panel.locator(".explorer-overlay-close").click()
  await expect(explorer).toHaveClass(/collapsed/)
})

test("en móvil la marca y la hamburguesa comparten la primera línea", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 800, "Contrato exclusivo del layout móvil")
  await openPage(page)

  const brand = await page.locator(".site-brand-link").boundingBox()
  const hamburger = await page.locator(".explorer button.mobile-explorer").boundingBox()
  const toolbar = await page.locator(".left.sidebar > .flex-component").boundingBox()

  expect(brand).not.toBeNull()
  expect(hamburger).not.toBeNull()
  expect(toolbar).not.toBeNull()

  const brandCenter = brand!.y + brand!.height / 2
  const hamburgerCenter = hamburger!.y + hamburger!.height / 2
  expect(Math.abs(brandCenter - hamburgerCenter)).toBeLessThanOrEqual(6)
  expect(hamburger!.x).toBeGreaterThan(brand!.x + brand!.width)
  expect(toolbar!.y).toBeGreaterThanOrEqual(
    Math.max(brand!.y + brand!.height, hamburger!.y + hamburger!.height),
  )
})
