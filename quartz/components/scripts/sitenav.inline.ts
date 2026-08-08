/**
 * Comportamiento del menú horizontal (`SiteNav.tsx`).
 *
 * En lugar de fijar un breakpoint arbitrario, mide si la fila de enlaces cabe en
 * el ancho disponible: así el menú sigue funcionando aunque se añadan entradas o
 * se alarguen los textos desde `garden.site.ts`.
 *
 * El script se evalúa una sola vez por carga completa. `setup()` se invoca tanto
 * al evaluarlo como en cada evento `nav` del router SPA —que reemplaza el DOM—,
 * así que el cableado del elemento se marca con `data-nav-bound`: sin esa
 * guarda, en la primera carga se registrarían dos escuchadores en el botón y
 * cada uno desharía lo que hiciese el otro.
 */

const OPEN_LABEL = "Abrir menú de navegación"
const CLOSE_LABEL = "Cerrar menú de navegación"

let observer: ResizeObserver | undefined
let measuredWidth = -1

function currentNav() {
  return document.querySelector<HTMLElement>(".site-nav")
}

function setOpen(nav: HTMLElement, open: boolean) {
  const toggle = nav.querySelector<HTMLButtonElement>(".site-nav-toggle")
  nav.dataset.open = String(open)
  toggle?.setAttribute("aria-expanded", String(open))
  toggle?.setAttribute("aria-label", open ? CLOSE_LABEL : OPEN_LABEL)
}

function measure(nav: HTMLElement, force = false) {
  const list = nav.querySelector<HTMLElement>(".site-nav-list")
  if (!list) return

  // El botón hamburguesa es más alto que la fila de enlaces, así que plegar el
  // menú cambia la altura del `nav` y vuelve a despertar al ResizeObserver. Solo
  // el ancho decide si cabe, y comparar contra el último medido corta el bucle.
  const width = nav.clientWidth
  if (!force && width === measuredWidth) return
  measuredWidth = width

  // Mide siempre en la disposición de una sola fila: al quitar `collapsed` el
  // botón hamburguesa desaparece y la lista recupera todo el ancho disponible.
  const wasCollapsed = nav.dataset.collapsed === "true"
  nav.dataset.collapsed = "false"
  const fits = list.scrollWidth <= list.clientWidth + 1
  nav.dataset.collapsed = fits ? "false" : "true"

  if (wasCollapsed && fits) setOpen(nav, false)
}

function setup() {
  const nav = currentNav()
  if (!nav) return

  nav.dataset.navReady = "true"
  setOpen(nav, false)
  measure(nav, true)

  observer?.disconnect()
  observer = new ResizeObserver(() => {
    const active = currentNav()
    if (active) measure(active)
  })
  observer.observe(nav)

  if (nav.dataset.navBound === "true") return
  nav.dataset.navBound = "true"

  nav.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target.closest(".site-nav-toggle")) {
      setOpen(nav, nav.dataset.open !== "true")
      return
    }

    // Con el router SPA el enlace no recarga la página: el panel se cierra aquí.
    if (target.closest(".site-nav-link")) setOpen(nav, false)
  })
}

document.addEventListener("click", (event) => {
  const nav = currentNav()
  if (!nav || nav.dataset.open !== "true") return
  const target = event.target
  if (target instanceof Node && nav.contains(target)) return
  setOpen(nav, false)
})

document.addEventListener("keydown", (event) => {
  const nav = currentNav()
  if (event.key !== "Escape" || !nav || nav.dataset.open !== "true") return
  setOpen(nav, false)
  nav.querySelector<HTMLButtonElement>(".site-nav-toggle")?.focus()
})

document.addEventListener("nav", setup)
setup()
