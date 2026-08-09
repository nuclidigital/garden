import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { joinSegments, pathToRoot } from "../util/path"

type Frontmatter = {
  space?: unknown
  area?: unknown
}

type Area = {
  label: string
  slug: string
}

function values(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
  return []
}

/** A stable URL segment, independent of accents or the way an area is capitalised. */
export function areaSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-ES")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getSpace(file: { frontmatter?: Frontmatter }): string | undefined {
  const space = file.frontmatter?.space
  return typeof space === "string" && space.trim() !== "" ? space.trim() : undefined
}

/**
 * Second-level navigation for the editorial taxonomy. It is deliberately
 * independent from the Explorer: it only exposes areas belonging to the page's
 * current space and disappears when no space/area pair exists.
 */
const AreaNav: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const slug = fileData.slug
  if (!slug) return null
  // Tags and the home page are cross-space views, so a contextual selector
  // would be misleading there.
  if (slug === "index" || slug === "tags" || slug.startsWith("tags/")) return null

  const space = getSpace(fileData as unknown as { frontmatter?: Frontmatter })
  if (!space) return null

  const areas = new Map<string, Area>()
  for (const file of allFiles) {
    if (
      file.unlisted === true ||
      getSpace(file as unknown as { frontmatter?: Frontmatter }) !== space
    )
      continue
    for (const label of values(file.frontmatter?.area)) {
      const normalized = areaSlug(label)
      if (normalized && !areas.has(normalized)) areas.set(normalized, { label, slug: normalized })
    }
  }

  if (areas.size === 0) return null

  const currentAreas = new Set(values(fileData.frontmatter?.area).map(areaSlug))
  const baseDir = pathToRoot(slug)
  const spaceHref = joinSegments(baseDir, space)

  return (
    <nav class="area-nav" aria-label={`Áreas de ${space}`}>
      <span class="area-nav-label">{space}</span>
      <ul class="area-nav-list">
        <li>
          <a
            class="area-nav-link"
            href={spaceHref}
            data-router-ignore="true"
            {...(slug === space || slug === `${space}/index` ? { "aria-current": "page" } : {})}
          >
            Todo
          </a>
        </li>
        {[...areas.values()]
          .sort((a, b) => a.label.localeCompare(b.label, "es"))
          .map((area) => {
            const href = joinSegments(baseDir, "areas", space, area.slug)
            const active = slug === `areas/${space}/${area.slug}` || currentAreas.has(area.slug)
            return (
              <li>
                <a
                  class="area-nav-link"
                  href={href}
                  data-router-ignore="true"
                  {...(active ? { "aria-current": "page" } : {})}
                >
                  {area.label}
                </a>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}

export default (() => AreaNav) satisfies QuartzComponentConstructor
