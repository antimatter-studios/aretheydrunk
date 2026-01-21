export type ThemeName = "pink" | "green" | "blue" | "yellow"

export interface ThemeSpec {
  base: string
  stops: [string, string, string]
}

const THEMES: Record<ThemeName, ThemeSpec> = {
  pink:   { stops: ["#ff80bf", "#ff4da6", "#ff1f8a"], base: "#ff4da6" },
  green:  { stops: ["#7ad965", "#27b35f", "#12864a"], base: "#27b35f" },
  blue:   { stops: ["#80cfff", "#4da6ff", "#1f8aff"], base: "#4da6ff" },
  yellow: { stops: ["#ffe680", "#ffcc4d", "#ffb81f"], base: "#ffcc4d" },
}

export function getTheme(name?: string): ThemeSpec {
  const key = (name || "pink").toLowerCase() as ThemeName
  if (key in THEMES) return THEMES[key]
  return THEMES.pink
}
