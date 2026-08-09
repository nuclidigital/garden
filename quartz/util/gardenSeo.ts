import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, getAllSegmentPrefixes, simplifySlug } from "./path"

export const GARDEN_AUTHOR = {
  id: "#roger-gibaja",
  name: "Roger Gibaja",
  url: "https://nuclidigital.com/",
  sameAs: [
    "https://www.linkedin.com/in/rogergibaja/",
    "https://github.com/nuclidigital",
    "https://www.instagram.com/podsplot",
    "https://www.youtube.com/@podsplot",
    "https://creators.spotify.com/pod/profile/pod-splot/",
  ],
} as const

export const MIN_INDEXABLE_TAG_ENTRIES = 2
export const MIN_RSS_WORDS = 120

function frontmatterFlag(data: QuartzPluginData, key: string): boolean {
  return data.frontmatter?.[key] === true || data[key] === true
}

export function isSourcePage(data: QuartzPluginData): boolean {
  return typeof data.filePath === "string" && data.filePath.length > 0
}

export function isUnlisted(data: QuartzPluginData): boolean {
  return frontmatterFlag(data, "unlisted")
}

export function canonicalPath(slug: string): string {
  if (slug === "404") return "/404"
  const simplified = simplifySlug(slug as FullSlug)
  return simplified === "/" ? "/" : `/${simplified}`
}

export function canonicalUrl(cfg: GlobalConfiguration, slug: string): string {
  const origin = `https://${cfg.baseUrl ?? "example.com"}`
  return new URL(canonicalPath(slug), origin).href
}

export function wordCount(data: QuartzPluginData): number {
  return (data.text ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length
}

export function isLandingSlug(slug: string): boolean {
  return slug === "index" || slug.endsWith("/index")
}

export function isEditorialPage(data: QuartzPluginData): boolean {
  const slug = data.slug ?? ""
  return (
    isSourcePage(data) &&
    !isUnlisted(data) &&
    !isLandingSlug(slug) &&
    slug !== "404" &&
    !slug.startsWith("tags/") &&
    !slug.startsWith("areas/") &&
    wordCount(data) >= MIN_RSS_WORDS
  )
}

export function tagEntryCounts(allFiles: QuartzPluginData[]): Map<string, number> {
  const counts = new Map<string, number>()

  for (const data of allFiles) {
    const slug = data.slug ?? ""
    if (!isSourcePage(data) || isUnlisted(data) || slug.startsWith("tags/")) continue

    const tags = data.frontmatter?.tags
    if (!Array.isArray(tags)) continue
    const prefixesInPage = new Set<string>()
    for (const tag of tags.filter((value): value is string => typeof value === "string")) {
      for (const prefix of getAllSegmentPrefixes(tag)) {
        prefixesInPage.add(prefix)
      }
    }
    for (const prefix of prefixesInPage) {
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1)
    }
  }

  return counts
}

export function robotsDirective(
  data: QuartzPluginData,
  allFiles: QuartzPluginData[],
): "index,follow" | "noindex,follow" | "noindex,nofollow" {
  const slug = data.slug ?? ""
  if (slug === "404" || isUnlisted(data)) return "noindex,nofollow"
  if (slug === "tags" || slug === "tags/index" || slug.startsWith("areas/")) {
    return "noindex,follow"
  }
  if (slug.startsWith("tags/")) {
    const tag = slug.slice("tags/".length)
    return (tagEntryCounts(allFiles).get(tag) ?? 0) >= MIN_INDEXABLE_TAG_ENTRIES
      ? "index,follow"
      : "noindex,follow"
  }
  if (!isSourcePage(data) || wordCount(data) === 0) return "noindex,follow"
  return "index,follow"
}

export function isIndexable(data: QuartzPluginData, allFiles: QuartzPluginData[]): boolean {
  return robotsDirective(data, allFiles) === "index,follow"
}

export function pageDate(data: QuartzPluginData, kind: "published" | "modified"): Date | undefined {
  const frontmatter = data.frontmatter as Record<string, unknown> | undefined
  const raw =
    kind === "published"
      ? (frontmatter?.published ?? frontmatter?.created ?? frontmatter?.date)
      : frontmatter?.modified
  if (typeof raw === "string" || typeof raw === "number" || raw instanceof Date) {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const dates = data.dates
  if (!dates) return undefined
  const candidate = kind === "published" ? dates.created : dates.modified
  return candidate instanceof Date && !Number.isNaN(candidate.getTime()) ? candidate : undefined
}

export function pageDescription(data: QuartzPluginData, fallback = ""): string {
  const value =
    data.frontmatter?.socialDescription ??
    data.frontmatter?.description ??
    data.description ??
    fallback
  return typeof value === "string" ? value.trim() : fallback
}

function breadcrumbName(slug: string, allFiles: QuartzPluginData[]): string {
  const match = allFiles.find((data) => data.slug === slug || data.slug === `${slug}/index`)
  const title = match?.frontmatter?.title
  if (typeof title === "string" && title.trim()) return title
  const segment = slug.split("/").at(-1) ?? slug
  return segment.replace(/-/g, " ").replace(/^./, (char) => char.toUpperCase())
}

export function structuredData(
  cfg: GlobalConfiguration,
  data: QuartzPluginData,
  allFiles: QuartzPluginData[],
  title: string,
  description: string,
): Record<string, unknown> {
  const slug = data.slug ?? "index"
  const url = canonicalUrl(cfg, slug)
  const rootUrl = canonicalUrl(cfg, "index")
  const personId = `${rootUrl}${GARDEN_AUTHOR.id}`
  const websiteId = `${rootUrl}#website`
  const person = {
    "@type": "Person",
    "@id": personId,
    name: GARDEN_AUTHOR.name,
    url: canonicalUrl(cfg, "sobre-mi"),
    sameAs: [GARDEN_AUTHOR.url, ...GARDEN_AUTHOR.sameAs],
  }
  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: rootUrl,
    name: cfg.pageTitle ?? "Garden Digital",
    description:
      "Jardín digital de Roger Gibaja: notas técnicas, investigación y procesos creativos.",
    inLanguage: cfg.locale ?? "es-ES",
    creator: { "@id": personId },
  }
  const graph: Record<string, unknown>[] = [person, website]

  if (slug === "sobre-mi") {
    graph.push({
      "@type": "ProfilePage",
      "@id": `${url}#profile-page`,
      url,
      name: title,
      description,
      mainEntity: { "@id": personId },
      isPartOf: { "@id": websiteId },
    })
  } else if (isSourcePage(data) && !isLandingSlug(slug) && !slug.startsWith("tags/")) {
    const article: Record<string, unknown> = {
      "@type": "Article",
      "@id": `${url}#article`,
      url,
      headline: title,
      description,
      inLanguage: data.frontmatter?.lang ?? cfg.locale ?? "es-ES",
      author: { "@id": personId },
      mainEntityOfPage: url,
      isPartOf: { "@id": websiteId },
    }
    const published = pageDate(data, "published")
    const modified = pageDate(data, "modified")
    if (published) article.datePublished = published.toISOString()
    if (modified) article.dateModified = modified.toISOString()
    graph.push(article)
  }

  if (slug !== "index" && slug !== "404") {
    const simplified = simplifySlug(slug as FullSlug).replace(/\/$/, "")
    const segments = simplified.split("/").filter(Boolean)
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: rootUrl },
        ...segments.map((_, index) => {
          const partial = segments.slice(0, index + 1).join("/")
          return {
            "@type": "ListItem",
            position: index + 2,
            name: index === segments.length - 1 ? title : breadcrumbName(partial, allFiles),
            item: canonicalUrl(cfg, partial),
          }
        }),
      ],
    })
  }

  return { "@context": "https://schema.org", "@graph": graph }
}
