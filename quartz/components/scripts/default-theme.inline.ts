const FALLBACK_THEME = "dark"

try {
  const storedTheme = localStorage.getItem("theme")
  const initialTheme =
    storedTheme === "light" || storedTheme === "dark" ? storedTheme : FALLBACK_THEME

  document.documentElement.setAttribute("saved-theme", initialTheme)

  if (storedTheme !== initialTheme) {
    localStorage.setItem("theme", initialTheme)
  }
} catch {
  // Storage can be unavailable in hardened browsing modes. The visual default
  // must still be deterministic and must be applied before the styles load.
  document.documentElement.setAttribute("saved-theme", FALLBACK_THEME)
}
