import { useCallback, useEffect, useMemo, useState } from "react"

import { getMessages, type Language, type ThemeMode } from "../i18n"

const LANGUAGE_STORAGE_KEY = "ovideo.preferences.language"
const THEME_STORAGE_KEY = "ovideo.preferences.theme"

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "zh"
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return stored === "en" ? "en" : "zh"
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light"
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === "dark" || stored === "light") {
    return stored
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

// Stores language & theme preferences, mirroring them to document-level attributes.
export function usePreferences() {
  const [language, setLanguage] = useState<Language>(() => readStoredLanguage())
  const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme())

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en"
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.classList.toggle("dark", theme === "dark")
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const messages = useMemo(() => getMessages(language), [language])

  return {
    language,
    setLanguage,
    theme,
    setTheme,
    toggleTheme,
    messages,
  }
}
