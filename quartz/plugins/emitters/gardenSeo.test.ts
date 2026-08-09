import assert from "node:assert/strict"
import { test } from "node:test"
import { QuartzPluginData } from "../vfile"
import { GlobalConfiguration } from "../../cfg"
import { generateRobots, generateRss, generateSitemap } from "./gardenSeo"

const cfg = {
  baseUrl: "garden.nuclidigital.com",
  pageTitle: "Garden Digital",
  locale: "es-ES",
} as GlobalConfiguration

function page(slug: string, text: string, source = true): QuartzPluginData {
  return {
    slug,
    filePath: source ? (`/vault/${slug}.md` as never) : undefined,
    text,
    frontmatter: { title: slug, description: `Descripción de ${slug}`, tags: [] },
    dates: {
      created: new Date("2026-08-05T00:00:00Z"),
      modified: new Date("2026-08-06T00:00:00Z"),
      published: new Date("2026-08-05T00:00:00Z"),
    },
  } as unknown as QuartzPluginData
}

test("robots advertises the root sitemap without blocking noindex pages", () => {
  assert.equal(
    generateRobots("garden.nuclidigital.com"),
    "User-agent: *\nAllow: /\n\nSitemap: https://garden.nuclidigital.com/sitemap.xml\n",
  )
})

test("sitemap includes homepage and excludes area virtual pages", () => {
  const files = [page("index", "Portada"), page("areas/cuaderno/digital", "", false)]
  const sitemap = generateSitemap(cfg, files)
  assert.match(sitemap, /<loc>https:\/\/garden\.nuclidigital\.com\/<\/loc>/)
  assert.doesNotMatch(sitemap, /areas\/cuaderno\/digital/)
})

test("RSS contains substantive notes but not landings or virtual pages", () => {
  const longText = "Contenido editorial de la nota. ".repeat(30)
  const feed = generateRss(cfg, [
    page("cuaderno/nota", longText),
    page("cuaderno/index", longText),
    page("areas/cuaderno/digital", longText, false),
  ])
  assert.match(feed, /cuaderno\/nota/)
  assert.doesNotMatch(feed, /cuaderno\/index/)
  assert.doesNotMatch(feed, /areas\/cuaderno\/digital/)
})
