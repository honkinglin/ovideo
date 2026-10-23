import { useEffect, useState } from "react"
import { HISTORY_EVENT, HISTORY_KEY, readHistory } from "../history"

export function usePlaybackHistory() {
  const [history, setHistory] = useState(readHistory)
  useEffect(() => {
    const refresh = () => setHistory(readHistory())
    const onStorage = (event: StorageEvent) => {
      if (event.key === HISTORY_KEY || event.key === null) refresh()
    }
    window.addEventListener(HISTORY_EVENT, refresh)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(HISTORY_EVENT, refresh)
      window.removeEventListener("storage", onStorage)
    }
  }, [])
  return history
}
