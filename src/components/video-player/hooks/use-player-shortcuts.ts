import { useEffect } from "react"
import type { RefObject } from "react"

export function usePlayerShortcuts({ videoRef, enabled, togglePlayback, markA, markB, clearLoop, onFullscreenError }: {
  videoRef: RefObject<HTMLVideoElement | null>
  enabled: boolean
  togglePlayback: () => void
  markA: () => void
  markB: () => void
  clearLoop: () => void
  onFullscreenError: () => void
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!enabled || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="combobox"], [role="slider"], [role="menu"]')) return
      // Native video controls own their keyboard shortcuts when focused.
      if (target instanceof HTMLVideoElement || document.querySelector('[role="dialog"][data-state="open"]')) return
      const video = videoRef.current
      if (!video) return
      const key = event.key.toLowerCase()
      if (![" ", "k", "arrowleft", "arrowright", "arrowup", "arrowdown", "m", "f", "[", "]", "\\"].includes(key)) return
      event.preventDefault()
      if (event.repeat && [" ", "k", "m", "f", "[", "]", "\\"].includes(key)) return
      if (key === " " || key === "k") togglePlayback()
      if ((key === "arrowleft" || key === "arrowright") && Number.isFinite(video.duration)) {
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + (key === "arrowleft" ? -5 : 5)))
      }
      if (key === "arrowup" || key === "arrowdown") video.volume = Math.max(0, Math.min(1, video.volume + (key === "arrowup" ? 0.05 : -0.05)))
      if (key === "m") video.muted = !video.muted
      if (key === "[") markA()
      if (key === "]") markB()
      if (key === "\\") clearLoop()
      if (key === "f") {
        const request = document.fullscreenElement ? document.exitFullscreen?.() : video.requestFullscreen?.()
        if (request) void request.catch(onFullscreenError)
        else onFullscreenError()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [videoRef, enabled, togglePlayback, markA, markB, clearLoop, onFullscreenError])
}
