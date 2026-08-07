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

  for (const node of nodes) {
    const source = node.textContent?.trim()
    if (!source) continue

    try {
      const id = `garden-mermaid-${sequence++}`
      const { svg } = await mermaid.render(id, source)
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
