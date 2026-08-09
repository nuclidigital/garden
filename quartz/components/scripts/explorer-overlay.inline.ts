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
  const isOverlayViewport = window.matchMedia("(max-width: 1200px)").matches
  for (const explorer of document.querySelectorAll<HTMLElement>(".explorer")) {
    const panel = explorer.querySelector<HTMLElement>(".explorer-content")
    const opener = explorer.querySelector<HTMLButtonElement>(".mobile-explorer")
    if (!panel || !opener) continue

    // Desktop uses the normal left rail, not the full-screen overlay.
    if (!isOverlayViewport) {
      panel.querySelector(".explorer-overlay-close")?.remove()
      continue
    }

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

    if (panel.dataset.swipeBound !== "true") {
      let startX = 0
      let startY = 0
      panel.dataset.swipeBound = "true"
      panel.addEventListener(
        "touchstart",
        (event) => {
          const touch = event.changedTouches[0]
          if (!touch) return
          startX = touch.clientX
          startY = touch.clientY
        },
        { passive: true },
      )
      panel.addEventListener(
        "touchend",
        (event) => {
          const touch = event.changedTouches[0]
          if (!touch) return
          const horizontalDistance = touch.clientX - startX
          const verticalDistance = Math.abs(touch.clientY - startY)
          // A right swipe is the conventional dismissal gesture for a
          // full-screen navigation surface. Vertical scrolling remains intact.
          if (horizontalDistance > 72 && verticalDistance < 80) closeExplorer(explorer)
        },
        { passive: true },
      )
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
