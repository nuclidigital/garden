import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { PageList } from "./PageList"
import { areaSlug } from "./AreaNav"

type Frontmatter = {
  area?: unknown
  areaLabel?: unknown
  space?: unknown
}

function values(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
  return []
}

const AreaContent: QuartzComponent = (props: QuartzComponentProps) => {
  const frontmatter = (props.fileData.frontmatter ?? {}) as Frontmatter
  const space = typeof frontmatter.space === "string" ? frontmatter.space : ""
  const area = values(frontmatter.area)[0] ?? ""
  const label = typeof frontmatter.areaLabel === "string" ? frontmatter.areaLabel : area
  const pages = props.allFiles.filter(
    (file) =>
      // The dispatcher adds this virtual page to `allFiles` too. A listing
      // must contain only authored notes, never a link back to itself.
      file.filePath !== undefined &&
      file.unlisted !== true &&
      file.frontmatter?.space === space &&
      values(file.frontmatter?.area).some((item) => areaSlug(item) === area),
  )

  return (
    <div class="area-content popover-hint">
      <article>
        <p class="area-content-eyebrow">{space}</p>
        <h1>{label}</h1>
        <p>
          Entradas de {space} clasificadas en el área «{label}».
        </p>
      </article>
      <div class="page-listing">
        <p>
          {pages.length} {pages.length === 1 ? "entrada" : "entradas"} en esta área.
        </p>
        <PageList {...props} allFiles={pages} />
      </div>
    </div>
  )
}

export default (() => AreaContent) satisfies QuartzComponentConstructor
