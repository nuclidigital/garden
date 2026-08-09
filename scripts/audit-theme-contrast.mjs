#!/usr/bin/env node

// Contratos de contraste del tema Everforest. Se ejecuta en cada publicación
// para que un cambio visual futuro no rebaje silenciosamente el texto normal
// por debajo de WCAG AA (4.5:1).
const themes = {
  light: {
    background: "#fdf6e3",
    text: {
      body: "#4f5b52",
      muted: "#66756b",
      heading: "#35433c",
      red: "#b83a37",
      orange: "#a84d0d",
      yellow: "#7a5b00",
      green: "#4f6d00",
      aqua: "#14785a",
      blue: "#246e92",
      purple: "#a23e86",
    },
    accentInk: "#fdf6e3",
    solidAccents: { green: "#4f6d00", blue: "#246e92" },
    diagramInk: "#35433c",
    diagramBackgrounds: {
      neutral: "#efebd4",
      visual: "#eaedc8",
      yellow: "#faedcd",
      green: "#f0f1d2",
      blue: "#e9f0e9",
    },
  },
  dark: {
    background: "#2d353b",
    text: {
      body: "#d3c6aa",
      muted: "#9da9a0",
      heading: "#fdf6e3",
      red: "#e67e80",
      orange: "#e69875",
      yellow: "#dbbc7f",
      green: "#a7c080",
      aqua: "#83c092",
      blue: "#7fbbb3",
      purple: "#d699b6",
    },
    accentInk: "#2d353b",
    solidAccents: { green: "#a7c080", blue: "#7fbbb3" },
    diagramInk: "#fdf6e3",
    diagramBackgrounds: {
      neutral: "#3d484d",
      visual: "#543a48",
      yellow: "#4d4c43",
      green: "#425047",
      blue: "#3a515d",
    },
  },
}

const luminance = (hex) => {
  const channels = hex.match(/[\da-f]{2}/gi).map((value) => Number.parseInt(value, 16) / 255)
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

const contrast = (foreground, background) => {
  const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (high + 0.05) / (low + 0.05)
}

const failures = []
for (const [themeName, theme] of Object.entries(themes)) {
  for (const [token, foreground] of Object.entries(theme.text)) {
    const ratio = contrast(foreground, theme.background)
    if (ratio < 4.5) failures.push(`${themeName}.text.${token}: ${ratio.toFixed(2)}:1`)
  }
  for (const [token, background] of Object.entries(theme.solidAccents)) {
    const ratio = contrast(theme.accentInk, background)
    if (ratio < 4.5) failures.push(`${themeName}.solid.${token}: ${ratio.toFixed(2)}:1`)
  }
  for (const [token, background] of Object.entries(theme.diagramBackgrounds)) {
    const ratio = contrast(theme.diagramInk, background)
    if (ratio < 4.5) failures.push(`${themeName}.diagram.${token}: ${ratio.toFixed(2)}:1`)
  }
}

if (failures.length > 0) {
  console.error(`Contraste Everforest insuficiente:\n${failures.join("\n")}`)
  process.exit(1)
}

console.log("Contraste Everforest: todos los pares de texto alcanzan WCAG AA (>= 4.5:1).")
