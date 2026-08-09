/**
 * Turns Explorer into an explicit full-screen navigation surface on tablet and
 * mobile. Quartz owns the open button; this script adds the missing, obvious
 * close control inside the overlay and keeps its ARIA state in sync after SPA
 * navigations.
 */
const closeExplorer = (explorer: HTMLElement) => {
  explorer.classList.add("collapsed")
  explorer.setAttribute("aria-expanded", "false")
  document.documentElement.classList.remove("mobile-no-scroll")
  explorer.querySelector<HTMLButtonElement>(".mobile-explorer")?.focus()
}

const setupExplorerOverlay = () => {
  for (const explorer of document.querySelectorAll<HTMLElement>(".explorer")) {
    const panel = explorer.querySelector<HTMLElement>(".explorer-content")
    const opener = explorer.querySelector<HTMLButtonElement>(".mobile-explorer")
    if (!panel || !opener) continue

    opener.setAttribute("aria-expanded", String(!explorer.classList.contains("collapsed")))
    if (!panel.querySelector(".explorer-overlay-close")) {
      const close = document.createElement("button")
      close.type = "button"
      close.className = "explorer-overlay-close"
      close.setAttribute("aria-label", "Cerrar explorador")
      close.innerHTML = '<span aria-hidden="true">×</span><span>Cerrar</span>'
      close.addEventListener("click", () => closeExplorer(explorer))
      panel.prepend(close)
    }

    if (explorer.dataset.overlayBound === "true") continue
    explorer.dataset.overlayBound = "true"
    opener.addEventListener("click", () => {
      // Explorer toggles its class in its own handler. Read it after that
      // handler has run, then reflect the resulting state for assistive tech.
      requestAnimationFrame(() => {
        opener.setAttribute("aria-expanded", String(!explorer.classList.contains("collapsed")))
      })
    })
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return
  const explorer = document.querySelector<HTMLElement>(".explorer:not(.collapsed)")
  if (explorer) closeExplorer(explorer)
})

document.addEventListener("nav", setupExplorerOverlay)
setupExplorerOverlay()
