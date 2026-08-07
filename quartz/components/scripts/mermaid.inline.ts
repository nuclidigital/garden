import mermaid from "mermaid"

let sequence = 0
const sources = new WeakMap<HTMLElement, string>()

function getNodes() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('code.mermaid, code[data-language="mermaid"]'),
  ).filter(
    (node) => !node.dataset.processed,
  )
}

function resetRenderedNodes() {
  document
    .querySelectorAll<HTMLElement>(
      'code.mermaid[data-garden-rendered], code[data-language="mermaid"][data-garden-rendered]',
    )
    .forEach((node) => {
    const source = sources.get(node)
    if (!source) return
    node.textContent = source
    delete node.dataset.processed
    delete node.dataset.gardenRendered
    })
}

async function renderMermaid() {
  const nodes = getNodes()
  if (nodes.length === 0) return

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: document.documentElement.getAttribute("saved-theme") === "dark" ? "dark" : "base",
    themeVariables: {
      primaryColor: "#fbf8f4",
      primaryTextColor: "#1e1b20",
      primaryBorderColor: "#b5624b",
      lineColor: "#665f64",
      secondaryColor: "#0f6b78",
      tertiaryColor: "#f1eae2",
      edgeLabelBackground: "#f1eae2",
    },
  })

  nodes.forEach((node) => {
    const source = (node.textContent ?? "").trim()
    sources.set(node, source)
  })

  await mermaid.run({ nodes })
  nodes.forEach((node) => {
    node.dataset.gardenRendered = String(sequence++)
  })
}

const render = () => {
  void renderMermaid().catch((error) => console.warn("Unable to render Mermaid diagram", error))
}

document.addEventListener("nav", render)
document.addEventListener("render", render)
window.addEventListener("load", render)
document.addEventListener("themechange", () => {
  resetRenderedNodes()
  render()
})

render()
window.setTimeout(render, 0)
window.setTimeout(render, 500)

const observer = new MutationObserver(render)
observer.observe(document.body, { childList: true, subtree: true })
window.addCleanup?.(() => observer.disconnect())
