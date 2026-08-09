/**
 * Related-content links are editorial exit paths, so they must keep working
 * even if the SPA router is busy replacing a page on a slow mobile device.
 * Mark only the links in the «Relacionado» section to let the browser perform
 * the native navigation (the emitted relative URLs are already valid).
 */
function protectRelatedLinks() {
  for (const heading of document.querySelectorAll<HTMLElement>("h2#relacionado")) {
    let sibling = heading.nextElementSibling
    while (sibling && !/^H[1-6]$/.test(sibling.tagName)) {
      for (const link of sibling.querySelectorAll<HTMLAnchorElement>("a.internal-link")) {
        link.dataset.routerIgnore = "true"
      }
      sibling = sibling.nextElementSibling
    }
  }
}

document.addEventListener("nav", protectRelatedLinks)
protectRelatedLinks()
