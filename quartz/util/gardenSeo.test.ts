import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { QuartzPluginData } from "../plugins/vfile"
import { GlobalConfiguration } from "../cfg"
import {
  canonicalPath,
  canonicalUrl,
  isEditorialPage,
  robotsDirective,
  structuredData,
} from "./gardenSeo"

const cfg = {
  baseUrl: "garden.nuclidigital.com",
  pageTitle: "Garden Digital",
  locale: "es-ES",
} as GlobalConfiguration

function page(
  slug: string,
  options: { tags?: string[]; text?: string; source?: boolean; unlisted?: boolean } = {},
): QuartzPluginData {
  return {
    slug,
    filePath: options.source === false ? undefined : (`/vault/${slug}.md` as never),
    text: options.text ?? "Una nota con contenido editorial suficiente. ".repeat(30),
    frontmatter: { title: slug, tags: options.tags ?? [] },
    unlisted: options.unlisted,
  } as unknown as QuartzPluginData
}

describe("Garden SEO policy", () => {
  test("normalizes index slugs to their public canonical paths", () => {
    assert.equal(canonicalPath("index"), "/")
    assert.equal(canonicalPath("cuaderno/index"), "/cuaderno/")
    assert.equal(canonicalUrl(cfg, "index"), "https://garden.nuclidigital.com/")
  })

  test("noindexes unlisted, area and single-entry tag pages", () => {
    const note = page("cuaderno/nota", { tags: ["tema"] })
    const files = [note, page("tags/tema", { source: false, text: "" })]
    assert.equal(robotsDirective(page("privada", { unlisted: true }), files), "noindex,nofollow")
    assert.equal(
      robotsDirective(page("areas/cuaderno/digital", { source: false }), files),
      "noindex,follow",
    )
    assert.equal(robotsDirective(files[1]!, files), "noindex,follow")
  })

  test("indexes tags backed by at least two real notes", () => {
    const files = [
      page("cuaderno/uno", { tags: ["tema"] }),
      page("cuaderno/dos", { tags: ["tema"] }),
      page("tags/tema", { source: false, text: "" }),
    ]
    assert.equal(robotsDirective(files[2]!, files), "index,follow")
  })

  test("counts a nested tag only once per source page", () => {
    const files = [
      page("cuaderno/uno", { tags: ["tema", "tema/subtema"] }),
      page("tags/tema", { source: false, text: "" }),
    ]
    assert.equal(robotsDirective(files[1]!, files), "noindex,follow")
  })

  test("RSS eligibility excludes landings, stubs and virtual pages", () => {
    assert(isEditorialPage(page("cuaderno/nota")))
    assert(!isEditorialPage(page("cuaderno/index")))
    assert(!isEditorialPage(page("cuaderno/breve", { text: "Muy breve." })))
    assert(!isEditorialPage(page("areas/cuaderno/digital", { source: false })))
  })

  test("emits WebSite, Person, Article and BreadcrumbList graphs", () => {
    const note = page("cuaderno/nota")
    const schema = structuredData(cfg, note, [page("cuaderno/index"), note], "Nota", "Resumen")
    const types = (schema["@graph"] as Record<string, unknown>[]).map((entry) => entry["@type"])
    assert.deepEqual(types, ["Person", "WebSite", "Article", "BreadcrumbList"])
  })
})
