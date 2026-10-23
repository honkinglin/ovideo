import { useCallback, useEffect, useMemo, useState } from "react"

import { getMessages, type Language, type ThemeMode } from "../i18n"

const LANGUAGE_STORAGE_KEY = "ovideo.preferences.language"
const THEME_STORAGE_KEY = "ovideo.preferences.theme"

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "zh"
  let stored: string | null = null
  try { stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) } catch { /* Storage unavailable. */ }
  return stored === "en" ? "en" : "zh"
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light"
  let stored: string | null = null
  try { stored = window.localStorage.getItem(THEME_STORAGE_KEY) } catch { /* Storage unavailable. */ }
  if (stored === "dark" || stored === "light") {
    return stored
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

// Stores language & theme preferences, mirroring them to document-level attributes.
export function usePreferences() {
  // State for language and theme
  const [language, setLanguage] = useState<Language>(() => readStoredLanguage())
  const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme())

  // Sync language to <html> and localStorage
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en"
    try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language) } catch { /* Optional persistence. */ }
  }, [language])

  // Sync theme to <html> and localStorage
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.classList.toggle("dark", theme === "dark")
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme) } catch { /* Optional persistence. */ }
  }, [theme])

  // Toggle between dark and light theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  // Toggle between Chinese and English
  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "zh" ? "en" : "zh"))
  }, [])

  // Get i18n messages for current language
  const messages = useMemo(() => getMessages(language), [language])

  return {
    language,
    toggleLanguage,
    theme,
    setTheme,
    toggleTheme,
    messages,
  }
}
