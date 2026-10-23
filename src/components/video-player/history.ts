import { readStorage, writeStorage } from "./storage"
import type { VideoItem } from "./types"

export const HISTORY_KEY = "ovideo.history.v1"
export const HISTORY_EVENT = "ovideo:history-change"
export const HISTORY_CLEARED_EVENT = "ovideo:history-cleared"

export function historyKey(item: VideoItem) {
  return item.identity ?? item.src ?? item.id
}

export function readHistory(): Record<string, number> {
  const value = readStorage<unknown>(HISTORY_KEY, {})
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).filter(([, time]) => typeof time === "number" && Number.isFinite(time) && time >= 0))
}

export function savePosition(key: string, time: number) {
  if (!Number.isFinite(time) || time < 0) return
  const records = readHistory()
  delete records[key]
  records[key] = time
  if (writeStorage(HISTORY_KEY, Object.fromEntries(Object.entries(records).slice(-200)))) {
    window.dispatchEvent(new Event(HISTORY_EVENT))
  }
}

export function clearHistory() {
  if (!writeStorage(HISTORY_KEY, {})) return false
  window.dispatchEvent(new Event(HISTORY_CLEARED_EVENT))
  window.dispatchEvent(new Event(HISTORY_EVENT))
  return true
}
