/**
 * Garden Digital — textos y enlaces editables del sitio.
 *
 * Este es el único archivo que hay que tocar para cambiar las entradas del menú
 * horizontal o los perfiles de redes sociales del lateral izquierdo.
 * Instrucciones detalladas en `.dox/garden-menu-y-redes.md`.
 */

export interface NavLink {
  /** Texto visible en el menú. */
  label: string
  /**
   * Ruta interna relativa a la raíz del sitio (`""` es la portada, `"tags"` el
   * índice de etiquetas) o una URL completa `https://…` para enlaces externos.
   */
  href: string
}

export interface SocialLink {
  /** Identificador del icono: uno de los definidos en `SocialLinks.tsx`. */
  icon: "website" | "linkedin" | "github" | "instagram" | "youtube" | "spotify" | "mail"
  /** Texto accesible del enlace; se lee en lectores de pantalla y en el tooltip. */
  label: string
  /** URL completa, o `mailto:` para el correo. */
  href: string
}

/**
 * Entradas del menú horizontal, en el orden en que se muestran.
 *
 * Las cuatro cajas del sistema editorial se muestran siempre. Aunque una todavía
 * no tenga notas, su landing explica qué pertenece allí y evita una navegación
 * dominada por carpetas temáticas.
 */
export const navLinks: NavLink[] = [
  { label: "Inicio", href: "" },
  { label: "Cuaderno", href: "cuaderno" },
  { label: "Temporadas", href: "temporadas" },
  { label: "Estudio", href: "estudio" },
  { label: "Colecciones", href: "colecciones" },
  { label: "Tags", href: "tags" },
]

/** Perfiles de redes sociales del lateral izquierdo, en orden de aparición. */
export const socialLinks: SocialLink[] = [
  { icon: "website", label: "Web: nuclidigital.com", href: "https://nuclidigital.com" },
  { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/rogergibaja/" },
  { icon: "github", label: "GitHub", href: "https://github.com/nuclidigital" },
  { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/podsplot" },
  { icon: "youtube", label: "YouTube", href: "https://www.youtube.com/@podsplot" },
  {
    icon: "spotify",
    label: "Spotify",
    href: "https://creators.spotify.com/pod/profile/pod-splot/",
  },
  { icon: "mail", label: "Correo: hola@nuclidigital.com", href: "mailto:hola@nuclidigital.com" },
]

/** Texto de las dos mitades del logotipo: «Garden» sólido + «Digital» en degradado. */
export const wordmark = {
  solid: "Garden",
  gradient: "Digital",
  /** Texto accesible del enlace del logotipo. */
  label: "Garden Digital, ir a la portada",
}

/** `true` cuando el enlace apunta fuera del sitio y debe abrirse con `rel="noopener"`. */
export function isExternalLink(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")
}
