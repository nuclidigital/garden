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

test("la portada expone las cuatro rutas editoriales", async ({ page }) => {
  await openPage(page)

  const routes = ["cuaderno", "temporadas", "estudio", "colecciones"]
  const cards = page.locator(".garden-space-grid .garden-space-card")
  await expect(cards).toHaveCount(routes.length)
  for (const route of routes) {
    await expect(page.locator(`.garden-space-card[href$="/${route}"]`)).toHaveCount(1)
  }
})

test("áreas y Relacionado navegan de forma nativa", async ({ page }) => {
  await openPage(page, "/cuaderno/grifon-korthals")

  const filterIcon = page.getByRole("img", { name: "Filtrar cuaderno por área" })
  await expect(filterIcon).toBeVisible()
  await expect(page.locator(".area-nav-label")).toHaveCount(0)

  const areaLink = page.locator(".area-nav-link", { hasText: "digital" })
  await expect(areaLink).toHaveAttribute("data-router-ignore", "true")
  if ((page.viewportSize()?.width ?? 0) > 1200) {
    const restingBox = await areaLink.boundingBox()
    await areaLink.hover()
    const hoverBox = await areaLink.boundingBox()
    expect(hoverBox?.y).toBe(restingBox?.y)
    await expect(areaLink).toHaveCSS("box-shadow", /inset/)
  }
  await areaLink.click()
  await expect(page).toHaveURL(/\/areas\/cuaderno\/digital\/?$/)

  await openPage(page, "/cuaderno/grifon-korthals")
  const rejectConsent = page.locator(".cookie-consent__reject:visible")
  if (await rejectConsent.count()) await rejectConsent.click()
  const relatedLink = page.locator("h2#relacionado + ul a.internal-link").first()
  await expect(relatedLink).toHaveAttribute("data-router-ignore", "true")
  await relatedLink.click()
  await expect(page).toHaveURL(/\/colecciones\/el-perro-de-los-baskerville\/?$/)
})

test("las propiedades editoriales son semántica de máquina, no interfaz visible", async ({
  page,
}) => {
  await openPage(page, "/cuaderno/grifon-korthals")

  await expect(page.locator(".note-properties")).toHaveCount(0)
  const structuredData = page.locator('script[type="application/ld+json"]')
  await expect(structuredData).toHaveCount(1)
  const jsonLd = await structuredData.textContent()
  expect(jsonLd).toContain('"@type":"Article"')
})

test("Giscus recibe la hoja Everforest correcta para cada tema", async ({ page }) => {
  await openPage(page, "/cuaderno/grifon-korthals")

  const giscus = page.locator(".giscus")
  await expect(giscus).toHaveAttribute(
    "data-theme-url",
    "https://garden.nuclidigital.com/static/giscus",
  )
  await expect(giscus).toHaveAttribute("data-light-theme", "light")
  await expect(giscus).toHaveAttribute("data-dark-theme", "dark")

  const configuredTheme = await giscus.evaluate((element) => {
    const mode = document.documentElement.getAttribute("saved-theme")
    const name =
      mode === "light"
        ? element.getAttribute("data-light-theme")
        : element.getAttribute("data-dark-theme")
    return `${element.getAttribute("data-theme-url")}/${name}.css`
  })
  expect(configuredTheme).toBe("https://garden.nuclidigital.com/static/giscus/dark.css")
})

test("el preview de tags ordena título, fecha y etiquetas", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 600, "Quartz no muestra popovers hover en móvil")
  await openPage(page, "/cuaderno/grifon-korthals")

  await page.locator(".page-header .tags .tag-link").first().hover()
  const result = page.locator(".popover.active-popover .page-listing .section-li").first()
  await expect(result).toBeVisible()

  const title = await result.locator(".desc").boundingBox()
  const date = await result.locator(":scope > .section > .meta").boundingBox()
  const tags = await result.locator(":scope > .section > .tags").boundingBox()
  expect(title).not.toBeNull()
  expect(date).not.toBeNull()
  expect(tags).not.toBeNull()
  expect(title!.y).toBeLessThan(date!.y)
  expect(date!.y).toBeLessThan(tags!.y)
})

test("Entradas recientes muestra título, fecha y tags antes del extracto", async ({ page }) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) <= 1200,
    "El bloque lateral Entradas recientes solo se muestra en desktop",
  )
  await openPage(page)

  const recent = page
    .locator(".recent-notes")
    .getByRole("link", { name: "Arch en WSL2 E_UNEXPECTED (Parte I)", exact: true })
  await recent.hover()

  const popover = page.locator('.popover[data-origin="recent-notes"].active-popover')
  const header = popover.locator(".popover-hint:has(> .article-title)").first()
  await expect(header).toBeVisible()
  await expect(header.locator(".breadcrumb-container")).toBeHidden()
  await expect(header.locator(".garden-author-byline")).toBeHidden()
  await expect(header.locator(".content-meta > :not(time)")).toBeHidden()

  const title = await header.locator(":scope > .article-title").boundingBox()
  const date = await header.locator(":scope > .content-meta").boundingBox()
  const tags = await header.locator(":scope > .tags").boundingBox()
  expect(title).not.toBeNull()
  expect(date).not.toBeNull()
  expect(tags).not.toBeNull()
  expect(title!.y).toBeLessThan(date!.y)
  expect(date!.y).toBeLessThan(tags!.y)
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

test("en tablet y móvil los cuatro controles comparten la primera línea", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 1200, "Contrato del layout responsive")
  await openPage(page)

  const brand = await page.locator(".site-brand-link").boundingBox()
  const search = await page.locator(".search > .search-button").boundingBox()
  const theme = await page.locator("button.darkmode").boundingBox()
  const hamburger = await page.locator(".explorer button.mobile-explorer").boundingBox()

  expect(brand).not.toBeNull()
  expect(search).not.toBeNull()
  expect(theme).not.toBeNull()
  expect(hamburger).not.toBeNull()

  const boxes = [brand!, search!, theme!, hamburger!]
  const centers = boxes.map((box) => box.y + box.height / 2)
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThanOrEqual(6)

  expect(search!.x).toBeGreaterThanOrEqual(brand!.x + brand!.width)
  expect(theme!.x).toBeGreaterThan(search!.x)
  expect(hamburger!.x).toBeGreaterThan(theme!.x)

  for (const control of [search!, theme!, hamburger!]) {
    expect(control.width).toBeGreaterThanOrEqual(44)
    expect(control.height).toBeGreaterThanOrEqual(44)
  }
})

test("el grafo pesado solo carga en el layout desktop que lo muestra", async ({ page }) => {
  const graphLibraries: string[] = []
  page.on("request", (request) => {
    if (/cdn\.jsdelivr\.net\/npm\/(?:d3|pixi\.js)/.test(request.url())) {
      graphLibraries.push(request.url())
    }
  })

  await openPage(page)
  if ((page.viewportSize()?.width ?? 0) > 1200) {
    await expect.poll(() => graphLibraries.length).toBeGreaterThanOrEqual(2)
  } else {
    await page.waitForTimeout(750)
    expect(graphLibraries).toHaveLength(0)
  }
})
