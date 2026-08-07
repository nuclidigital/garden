import mermaid from "mermaid"

let sequence = 0

async function renderMermaid() {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>('code[data-language="mermaid"]'),
  ).filter((node) => !node.dataset.mermaidRendered)

  if (nodes.length === 0) return

  const root = document.documentElement
  const dark = root.getAttribute("saved-theme") === "dark"
  const styles = getComputedStyle(root)

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: dark ? "dark" : "base",
    themeVariables: {
      fontFamily: styles.getPropertyValue("--bodyFont").trim(),
      primaryColor: styles.getPropertyValue("--light").trim(),
      primaryTextColor: styles.getPropertyValue("--dark").trim(),
      primaryBorderColor: styles.getPropertyValue("--tertiary").trim(),
      lineColor: styles.getPropertyValue("--darkgray").trim(),
      secondaryColor: styles.getPropertyValue("--secondary").trim(),
      tertiaryColor: styles.getPropertyValue("--tertiary").trim(),
      edgeLabelBackground: styles.getPropertyValue("--highlight").trim(),
    },
  })

  const palette = dark
    ? {
        decision: ["#5a3b34", "#e3b891", "#fbf8f4"],
        diagnostic: ["#2e2531", "#c9bbb4", "#fbf8f4"],
        repair: ["#143b43", "#8fd3dc", "#fbf8f4"],
        success: ["#294326", "#93d543", "#fbf8f4"],
      }
    : {
        decision: ["#efd4bc", "#b5624b", "#423540"],
        diagnostic: ["#f1eae2", "#665f64", "#423540"],
        repair: ["#d9f0f2", "#0f6b78", "#003748"],
        success: ["#dcefc5", "#5f8f2e", "#234016"],
      }

  for (const node of nodes) {
    const source = node.textContent?.trim()
    if (!source) continue

    try {
      const id = `garden-mermaid-${sequence++}`
      const themedSource = source.replace(
        /classDef (decision|diagnostic|repair|success) [^;]+;/g,
        (_definition, name: keyof typeof palette) => {
          const [fill, stroke, color] = palette[name]
          return `classDef ${name} fill:${fill},stroke:${stroke},color:${color};`
        },
      )
      const { svg } = await mermaid.render(id, themedSource)
      node.innerHTML = svg
      node.dataset.mermaidRendered = "true"
      node.parentElement?.classList.add("mermaid-rendered")
    } catch (error) {
      console.warn("Unable to render Mermaid diagram", error)
    }
  }
}

document.addEventListener("nav", renderMermaid)
document.addEventListener("render", renderMermaid)
