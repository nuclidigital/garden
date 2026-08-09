import { isLandingSlug, isSourcePage } from "../util/gardenSeo"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const AuthorByline: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const show =
    isSourcePage(fileData) &&
    !isLandingSlug(slug) &&
    slug !== "sobre-mi" &&
    !slug.startsWith("tags/")

  if (!show) return null
  return (
    <p class="garden-author-byline">
      Por <a href="/sobre-mi">Roger Gibaja</a>
    </p>
  )
}

export default (() => AuthorByline) satisfies QuartzComponentConstructor
