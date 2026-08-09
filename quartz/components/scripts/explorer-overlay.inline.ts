/**
 * Turns Explorer into an explicit full-screen navigation surface on tablet and
 * mobile. Quartz owns the open button; this script adds the missing, obvious
 * close control inside the overlay and keeps its ARIA state in sync after SPA
 * navigations.
 */
const reflectExplorerState = (explorer: HTMLElement) => {
  const panel = explorer.querySelector<HTMLElement>(".explorer-content")
  const opener = explorer.querySelector<HTMLButtonElement>(".mobile-explorer")
  const open = !explorer.classList.contains("collapsed")

  opener?.setAttribute("aria-expanded", String(open))
  if (panel) {
    // `visibility: hidden` is not sufficient here: the Explorer stylesheet
    // gives its links their own visibility/pointer-event values, so an
    // invisible descendant can still win hit testing and steal taps from the
    // area navigation underneath. `inert` removes the complete closed subtree
    // from pointer and keyboard interaction.
    panel.inert = !open
    panel.setAttribute("aria-hidden", String(!open))
  }
  document.documentElement.classList.toggle("mobile-no-scroll", open)
}

const closeExplorer = (explorer: HTMLElement) => {
  explorer.classList.add("collapsed")
  reflectExplorerState(explorer)
  explorer.querySelector<HTMLButtonElement>(".mobile-explorer")?.focus()
}

const overlayMedia = window.matchMedia("(max-width: 1200px)")

const setupExplorerOverlay = (closeOnEnter = false) => {
  const isOverlayViewport = overlayMedia.matches
  for (const explorer of document.querySelectorAll<HTMLElement>(".explorer")) {
    const panel = explorer.querySelector<HTMLElement>(".explorer-content")
    const opener = explorer.querySelector<HTMLButtonElement>(".mobile-explorer")
    if (!panel || !opener) continue

    // Desktop uses the normal left rail, not the full-screen overlay.
    if (!isOverlayViewport) {
      panel.inert = false
      panel.removeAttribute("aria-hidden")
      panel.querySelector(".explorer-overlay-close")?.remove()
      continue
    }

    // An expanded desktop rail must not turn into an already-open full-screen
    // overlay when the window crosses into tablet/mobile. Start the responsive
    // mode closed so the page and its hamburger remain usable.
    if (closeOnEnter) explorer.classList.add("collapsed")
    reflectExplorerState(explorer)
    if (explorer.dataset.overlayStateBound !== "true") {
      explorer.dataset.overlayStateBound = "true"
      // Quartz restores the saved Explorer state asynchronously. Observing the
      // class makes our interaction state follow that final value too, rather
      // than whichever value happened to exist while this script initialized.
      new MutationObserver(() => {
        if (overlayMedia.matches) reflectExplorerState(explorer)
      }).observe(explorer, {
        attributes: true,
        attributeFilter: ["class"],
      })
    }
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
        reflectExplorerState(explorer)
      })
    })
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return
  const explorer = document.querySelector<HTMLElement>(".explorer:not(.collapsed)")
  if (explorer) closeExplorer(explorer)
})

document.addEventListener("nav", () => setupExplorerOverlay())
overlayMedia.addEventListener("change", (event) => {
  document.documentElement.classList.remove("mobile-no-scroll")
  for (const explorer of document.querySelectorAll<HTMLElement>(".explorer")) {
    if (event.matches) {
      explorer.dataset.desktopWasExpanded = String(!explorer.classList.contains("collapsed"))
    } else {
      if (explorer.dataset.desktopWasExpanded === "true") explorer.classList.remove("collapsed")
      delete explorer.dataset.desktopWasExpanded
    }
  }
  setupExplorerOverlay(event.matches)
})
setupExplorerOverlay()
