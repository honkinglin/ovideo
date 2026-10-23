// Storage can be unavailable or full. Playback should still work in that case.
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value) as T
  } catch { return fallback }
}
export function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch { return false }
}
