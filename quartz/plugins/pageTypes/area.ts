import AreaContent from "../../components/AreaContent"
import { areaSlug } from "../../components/AreaNav"
import { QuartzPageTypePlugin, VirtualPage } from "../types"

type AreaRecord = {
  label: string
  slug: string
}

function values(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
  return []
}

/** Generates an independent, static listing for every populated `space` + `area`. */
export const AreaPage: QuartzPageTypePlugin = () => ({
  name: "AreaPage",
  priority: 20,
  match: ({ slug }) => slug.startsWith("areas/"),
  generate({ content }) {
    const areasBySpace = new Map<string, Map<string, AreaRecord>>()

    for (const [, file] of content) {
      const data = file.data
      if (data.unlisted === true) continue
      const space = data.frontmatter?.space
      if (typeof space !== "string" || space.trim() === "") continue

      for (const label of values(data.frontmatter?.area)) {
        const slug = areaSlug(label)
        if (!slug) continue
        const areas = areasBySpace.get(space) ?? new Map<string, AreaRecord>()
        if (!areas.has(slug)) areas.set(slug, { label, slug })
        areasBySpace.set(space, areas)
      }
    }

    const pages: VirtualPage[] = []
    for (const [space, areas] of areasBySpace) {
      for (const area of areas.values()) {
        pages.push({
          slug: `areas/${space}/${area.slug}`,
          title: `${space}: ${area.label}`,
          data: {
            frontmatter: {
              title: `${space}: ${area.label}`,
              tags: [],
              space,
              area: [area.slug],
              areaLabel: area.label,
            },
          },
        })
      }
    }
    return pages
  },
  layout: "area",
  body: AreaContent,
})
