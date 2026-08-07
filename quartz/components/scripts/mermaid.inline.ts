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
        background: "#2e3440",
        text: "#eceff4",
        border: "#88c0d0",
        line: "#d8dee9",
        secondary: "#81a1c1",
        label: "#3b4252",
        classes: {
          start: ["#3b4252", "#81a1c1", "#eceff4"],
          decision: ["#4c566a", "#ebcb8b", "#eceff4"],
          diagnostic: ["#3b4252", "#81a1c1", "#eceff4"],
          repair: ["#2e4a55", "#88c0d0", "#eceff4"],
          success: ["#3a4d3b", "#a3be8c", "#eceff4"],
        },
      }
    : {
        background: "#eceff4",
        text: "#2e3440",
        border: "#5e81ac",
        line: "#4c566a",
        secondary: "#81a1c1",
        label: "#e5e9f0",
        classes: {
          start: ["#e5e9f0", "#4c566a", "#2e3440"],
          decision: ["#ebcb8b", "#d08770", "#2e3440"],
          diagnostic: ["#e5e9f0", "#4c566a", "#2e3440"],
          repair: ["#d8dee9", "#5e81ac", "#2e3440"],
          success: ["#a3be8c", "#5e81ac", "#2e3440"],
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
