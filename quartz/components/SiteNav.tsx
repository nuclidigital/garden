import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { joinSegments, pathToRoot } from "../util/path"
import { isExternalLink, navLinks } from "./garden.site"

/**
 * Menú horizontal de la columna central. Los textos y enlaces se editan en
 * `garden.site.ts`; ver `.dox/garden-menu-y-redes.md`.
 *
 * Se pinta siempre como una sola fila. `scripts/sitenav.inline.ts` mide si esa
 * fila cabe y, cuando no cabe —típicamente en tablet y móvil—, marca
 * `data-collapsed="true"` para que el CSS lo convierta en una hamburguesa.
 * Sin JavaScript el menú se queda en varias líneas, que sigue siendo navegable.
 */
function isActive(slug: string, href: string): boolean {
  if (isExternalLink(href)) return false
  if (href === "") return slug === "index"
  return slug === href || slug === `${href}/index` || slug.startsWith(`${href}/`)
}

const SiteNav: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  if (navLinks.length === 0) return null

  const slug = fileData.slug!
  const baseDir = pathToRoot(slug)

  return (
    <nav
      class="site-nav"
      aria-label="Navegación principal"
      data-collapsed="false"
      data-open="false"
    >
      <button
        class="site-nav-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="site-nav-list"
        aria-label="Abrir menú de navegación"
      >
        <svg
          class="site-nav-toggle-open"
          viewBox="0 0 256 256"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
        </svg>
        <svg
          class="site-nav-toggle-close"
          viewBox="0 0 256 256"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
        </svg>
        <span class="site-nav-toggle-label">Menú</span>
      </button>

      <ul class="site-nav-list" id="site-nav-list">
        {navLinks.map((link) => {
          const external = isExternalLink(link.href)
          const href = external
            ? link.href
            : link.href === ""
              ? baseDir
              : joinSegments(baseDir, link.href)
          const active = isActive(slug, link.href)

          return (
            <li>
              <a
                class="site-nav-link"
                href={href}
                {...(active ? { "aria-current": "page" } : {})}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default (() => SiteNav) satisfies QuartzComponentConstructor
