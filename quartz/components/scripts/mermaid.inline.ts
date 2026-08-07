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

  const dark = document.documentElement.getAttribute("saved-theme") === "dark"
  const colors = dark
    ? {
        background: "#191320",
        text: "#fbf8f4",
        border: "#e3b891",
        line: "#c9bbb4",
        secondary: "#8fd3dc",
        label: "#2e2531",
        classes: {
          start: ["#2e2531", "#c9bbb4", "#fbf8f4"],
          decision: ["#5a3b34", "#e3b891", "#fbf8f4"],
          diagnostic: ["#2e2531", "#c9bbb4", "#fbf8f4"],
          repair: ["#143b43", "#8fd3dc", "#fbf8f4"],
          success: ["#294326", "#93d543", "#fbf8f4"],
        },
      }
    : {
        background: "#fbf8f4",
        text: "#1e1b20",
        border: "#b5624b",
        line: "#665f64",
        secondary: "#0f6b78",
        label: "#f1eae2",
        classes: {
          start: ["#f4f4f5", "#71717a", "#18181b"],
          decision: ["#fef3c7", "#d97706", "#78350f"],
          diagnostic: ["#f4f4f5", "#71717a", "#18181b"],
          repair: ["#e0f2fe", "#0284c7", "#0c4a6e"],
          success: ["#dcfce7", "#16a34a", "#14532d"],
        },
      }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: dark ? "dark" : "base",
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
