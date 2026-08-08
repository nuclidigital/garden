import mermaid from "mermaid"

let sequence = 0
const sources = new WeakMap<HTMLElement, string>()

function getNodes() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('code.mermaid, code[data-language="mermaid"]'),
  ).filter((node) => !node.dataset.processed)
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

  // Sitio solo oscuro: una única paleta Nord Polar Night. Los rótulos van en
  // Snow Storm sobre rellenos oscuros, todos por encima de 4.5:1.
  const colors = {
    background: "#2e3440",
    text: "#eceff4",
    border: "#96cad8",
    line: "#d8dee9",
    secondary: "#81a1c1",
    label: "#3b4252",
    classes: {
      start: ["#3b4252", "#96cad8", "#eceff4"],
      decision: ["#4c566a", "#ebcb8b", "#eceff4"],
      diagnostic: ["#3b4252", "#96cad8", "#eceff4"],
      repair: ["#2e4a55", "#96cad8", "#eceff4"],
      success: ["#3a4d3b", "#a3be8c", "#eceff4"],
    },
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "dark",
    themeVariables: {
      primaryColor: colors.background,
      primaryTextColor: colors.text,
      primaryBorderColor: colors.border,
      lineColor: colors.line,
      secondaryColor: colors.secondary,
      tertiaryColor: colors.label,
      edgeLabelBackground: colors.label,
    },
  })

  nodes.forEach((node) => {
    const source = (node.textContent ?? "").trim()
    sources.set(node, source)
    const themedSource = source.replace(
      /classDef (start|decision|diagnostic|repair|success) [^;]+;/g,
      (_definition, name: keyof typeof colors.classes) => {
        const [fill, stroke, color] = colors.classes[name]
        return `classDef ${name} fill:${fill},stroke:${stroke},color:${color};`
      },
    )
    node.textContent = themedSource
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
// El sitio ya no cambia de tema, pero `resetRenderedNodes` sigue haciendo falta
// para volver a pintar si algo dispara el evento (por ejemplo una extensión).
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
