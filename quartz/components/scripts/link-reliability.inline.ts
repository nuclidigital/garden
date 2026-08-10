/**
 * Related-content links are editorial exit paths, so they must keep working
 * even if the SPA router is busy replacing a page on a slow mobile device.
 * Mark only the links in the «Relacionado» section to let the browser perform
 * the native navigation (the emitted relative URLs are already valid).
 */
function forceNativeNavigation(link: HTMLAnchorElement) {
  link.dataset.routerIgnore = "true"
  if (link.dataset.nativeNavigationBound === "true") return
  link.dataset.nativeNavigationBound = "true"
  link.addEventListener("click", (event) => {
    // Preserve browser conventions for new tabs/windows and downloads. A
    // normal primary click is resolved explicitly before Quartz's SPA router
    // can turn a valid editorial exit into an intermittent no-op on touch.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank" ||
      link.hasAttribute("download")
    )
      return

    event.preventDefault()
    event.stopImmediatePropagation()
    window.location.assign(link.href)
  })
}

function protectRelatedLinks() {
  for (const link of document.querySelectorAll<HTMLAnchorElement>(".area-nav-link")) {
    forceNativeNavigation(link)
  }
  for (const heading of document.querySelectorAll<HTMLElement>("h2#relacionado")) {
    let sibling = heading.nextElementSibling
    while (sibling && !/^H[1-6]$/.test(sibling.tagName)) {
      for (const link of sibling.querySelectorAll<HTMLAnchorElement>("a.internal-link")) {
        forceNativeNavigation(link)
      }
      sibling = sibling.nextElementSibling
    }
  }
}

document.addEventListener("nav", protectRelatedLinks)
protectRelatedLinks()
