import { QuartzEmitterPlugin } from "../types"
import { ProcessedContent, QuartzPluginData } from "../vfile"
import { write } from "./helpers"
import { FilePath, FullSlug } from "../../util/path"
import {
  canonicalUrl,
  isEditorialPage,
  isIndexable,
  pageDate,
  pageDescription,
} from "../../util/gardenSeo"

const xml = (value: string): string =>
  value.replace(/[<>&'\"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '\"': "&quot;",
    }
    return entities[character]!
  })

const cdata = (value: string): string => value.replace(/]]>/g, "]]&gt;")

function dataFrom(content: ProcessedContent[]): QuartzPluginData[] {
  return content.map(([, file]) => file.data)
}

export function generateRobots(baseUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: https://${baseUrl}/sitemap.xml\n`
}

export function generateSitemap(
  cfg: Parameters<typeof canonicalUrl>[0],
  allFiles: QuartzPluginData[],
): string {
  const seen = new Set<string>()
  const entries = allFiles
    .filter((data) => data.slug && isIndexable(data, allFiles))
    .map((data) => {
      const location = canonicalUrl(cfg, data.slug!)
      if (seen.has(location)) return ""
      seen.add(location)
      const modified = pageDate(data, "modified")
      return `  <url>\n    <loc>${xml(location)}</loc>${modified ? `\n    <lastmod>${modified.toISOString()}</lastmod>` : ""}\n  </url>`
    })
    .filter(Boolean)
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

export function generateRss(
  cfg: Parameters<typeof canonicalUrl>[0],
  allFiles: QuartzPluginData[],
): string {
  const root = canonicalUrl(cfg, "index")
  const feed = new URL("index.xml", root).href
  const entries = allFiles
    .filter(isEditorialPage)
    .sort((left, right) => {
      const leftDate = pageDate(left, "published")?.getTime() ?? 0
      const rightDate = pageDate(right, "published")?.getTime() ?? 0
      return rightDate - leftDate
    })
    .slice(0, 20)
    .map((data) => {
      const url = canonicalUrl(cfg, data.slug!)
      const title = String(data.frontmatter?.title ?? "Sin título")
      const description = pageDescription(data)
      const published = pageDate(data, "published")
      return `    <item>\n      <title>${xml(title)}</title>\n      <link>${xml(url)}</link>\n      <guid isPermaLink="true">${xml(url)}</guid>\n      <description><![CDATA[${cdata(description)}]]></description>${published ? `\n      <pubDate>${published.toUTCString()}</pubDate>` : ""}\n    </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>${xml(cfg.pageTitle ?? "Garden Digital")}</title>\n    <link>${xml(root)}</link>\n    <atom:link href="${xml(feed)}" rel="self" type="application/rss+xml" />\n    <description>Notas editoriales recientes de Garden Digital</description>\n    <language>${xml(cfg.locale ?? "es-ES")}</language>\n    <generator>Quartz</generator>\n${entries}\n  </channel>\n</rss>\n`
}

export const GardenSeo: QuartzEmitterPlugin = () => {
  const emitAll = async (
    ctx: Parameters<NonNullable<ReturnType<QuartzEmitterPlugin>["emit"]>>[0],
    content: ProcessedContent[],
  ) => {
    const cfg = ctx.cfg.configuration
    const allFiles = dataFrom(content)
    const baseUrl = cfg.baseUrl ?? "garden.nuclidigital.com"
    return Promise.all([
      write({ ctx, slug: "robots" as FullSlug, ext: ".txt", content: generateRobots(baseUrl) }),
      write({
        ctx,
        slug: "sitemap" as FullSlug,
        ext: ".xml",
        content: generateSitemap(cfg, allFiles),
      }),
      write({ ctx, slug: "index" as FullSlug, ext: ".xml", content: generateRss(cfg, allFiles) }),
    ]) as Promise<FilePath[]>
  }

  return {
    name: "GardenSeo",
    emit: (ctx, content) => emitAll(ctx, content),
    partialEmit: (ctx, content) => emitAll(ctx, content),
  }
}
