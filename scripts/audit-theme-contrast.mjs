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
    softInk: "#35433c",
    solidAccents: {
      red: "#b83a37",
      orange: "#a84d0d",
      yellow: "#7a5b00",
      green: "#4f6d00",
      aqua: "#14785a",
      blue: "#246e92",
      purple: "#a23e86",
    },
    diagramInk: "#35433c",
    diagramBackgrounds: {
      neutral: "#efebd4",
      visual: "#eaedc8",
      yellow: "#faedcd",
      green: "#f0f1d2",
      blue: "#e9f0e9",
      red: "#fde3da",
      purple: "#fae8e2",
    },
    accentSurfaces: {
      red: ["#b83a37", "#fde3da"],
      orange: ["#a84d0d", "#faedcd"],
      yellow: ["#7a5b00", "#faedcd"],
      green: ["#4f6d00", "#f0f1d2"],
      aqua: ["#14785a", "#e9f0e9"],
      blue: ["#246e92", "#e9f0e9"],
      purple: ["#a23e86", "#fae8e2"],
    },
    giscusSurfaces: {
      canvas: ["#35433c", "#f4f0d9"],
      card: ["#35433c", "#fdf6e3"],
      editor: ["#35433c", "#e9f0e9"],
      muted: ["#4f5b52", "#f4f0d9"],
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
    softInk: "#fdf6e3",
    solidAccents: {
      red: "#e67e80",
      orange: "#e69875",
      yellow: "#dbbc7f",
      green: "#a7c080",
      aqua: "#83c092",
      blue: "#7fbbb3",
      purple: "#d699b6",
    },
    diagramInk: "#fdf6e3",
    diagramBackgrounds: {
      neutral: "#3d484d",
      visual: "#543a48",
      yellow: "#4d4c43",
      green: "#425047",
      blue: "#3a515d",
      red: "#514045",
      purple: "#4a444e",
    },
    accentSurfaces: {
      red: ["#e67e80", "#514045"],
      orange: ["#e69875", "#4d4c43"],
      yellow: ["#dbbc7f", "#4d4c43"],
      green: ["#a7c080", "#425047"],
      aqua: ["#83c092", "#3a515d"],
      blue: ["#7fbbb3", "#3a515d"],
      purple: ["#d699b6", "#4a444e"],
    },
    giscusSurfaces: {
      canvas: ["#d3c6aa", "#2d353b"],
      card: ["#d3c6aa", "#343f44"],
      editor: ["#fdf6e3", "#232a2e"],
      muted: ["#9da9a0", "#2d353b"],
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
  for (const [token, background] of Object.entries(theme.diagramBackgrounds)) {
    const bodyRatio = contrast(theme.text.body, background)
    if (bodyRatio < 4.5)
      failures.push(`${themeName}.surface.${token}.body: ${bodyRatio.toFixed(2)}:1`)
    const softRatio = contrast(theme.softInk, background)
    if (softRatio < 4.5)
      failures.push(`${themeName}.surface.${token}.soft: ${softRatio.toFixed(2)}:1`)
  }
  for (const [token, [accent, background]] of Object.entries(theme.accentSurfaces)) {
    const ratio = contrast(accent, background)
    if (ratio < 3) failures.push(`${themeName}.graphic.${token}: ${ratio.toFixed(2)}:1`)
  }
  for (const [token, [foreground, background]] of Object.entries(theme.giscusSurfaces)) {
    const ratio = contrast(foreground, background)
    if (ratio < 4.5) failures.push(`${themeName}.giscus.${token}: ${ratio.toFixed(2)}:1`)
  }
}

if (failures.length > 0) {
  console.error(`Contraste Everforest insuficiente:\n${failures.join("\n")}`)
  process.exit(1)
}

console.log("Contraste Everforest: texto >= 4.5:1 y acentos gráficos sobre superficies >= 3:1.")
