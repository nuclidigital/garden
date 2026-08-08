import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"
import { wordmark } from "./garden.site"

/**
 * Marca del sitio: el símbolo de NucliDigital más el logotipo «Garden Digital».
 *
 * Sustituye al plugin `page-title`, que solo puede pintar texto plano. Las dos
 * mitades del logotipo son nodos reales —no pseudo-elementos— para que el texto
 * sea seleccionable, traducible y legible por lectores de pantalla; los colores
 * viven en `custom.scss`.
 */
const SiteBrand: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)

  return (
    <div class="site-brand">
      <a class="site-brand-link" href={baseDir} aria-label={wordmark.label}>
        <svg
          class="site-brand-mark"
          viewBox="0 0 120 120"
          width="44"
          height="44"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path class="site-brand-slash" d="M21 78 55.2 18.6" />
          <path class="site-brand-diag" d="M55.2 18.6 85.8 71.7" />
          <path class="site-brand-base" d="M85.8 71.7H36.1" />
          <circle class="site-brand-nucleus" cx="55.2" cy="54.06" r="7.56" />
        </svg>
        <span class="site-brand-wordmark">
          <span class="site-brand-solid">{wordmark.solid}</span>
          <span class="site-brand-gradient">{wordmark.gradient}</span>
        </span>
      </a>
    </div>
  )
}

export default (() => SiteBrand) satisfies QuartzComponentConstructor
