import { useContext } from "react"
import { ThemeContext } from "./ThemeContextDef"
export type { Theme, ThemeContextValue } from "./ThemeContextDef"

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
