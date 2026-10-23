import { useCallback, useEffect, useState } from "react"
import type { RefObject } from "react"

type Segment = { id: string | null; a: number | null; b: number | null; enabled: boolean }
const empty = (id: string | null): Segment => ({ id, a: null, b: null, enabled: false })

export function useSegmentLoop(videoRef: RefObject<HTMLVideoElement | null>, id: string | null) {
  const [stored, setStored] = useState<Segment>(() => empty(id))
  const segment = stored.id === id ? stored : empty(id)
  const { a, b, enabled } = segment
  useEffect(() => { setStored(empty(id)) }, [id])
  useEffect(() => {
    const video = videoRef.current
    if (!video || !enabled || a === null || b === null) return
    const enforce = () => {
      if (video.readyState > 0 && (video.currentTime >= b || video.currentTime < a)) video.currentTime = a
    }
    video.addEventListener("timeupdate", enforce)
    video.addEventListener("seeked", enforce)
    enforce()
    return () => {
      video.removeEventListener("timeupdate", enforce)
      video.removeEventListener("seeked", enforce)
    }
  }, [videoRef, id, a, b, enabled])

  const markA = useCallback(() => {
    const video = videoRef.current
    if (!id || !video || !Number.isFinite(video.duration) || video.readyState < 1) return
    setStored({ id, a: video.currentTime, b: null, enabled: false })
  }, [id, videoRef])
  const markB = useCallback(() => {
    const video = videoRef.current
    if (!id || !video || a === null || video.currentTime < a + 0.5) return false
    setStored({ id, a, b: video.currentTime, enabled: true })
    return true
  }, [id, a, videoRef])
  const rewindOnEnd = useCallback(() => {
    const video = videoRef.current
    if (!enabled || a === null || b === null || !video) return false
    video.currentTime = a
    return true
  }, [videoRef, a, b, enabled])
  return {
    a, b, enabled, markA, markB, rewindOnEnd,
    toggle: () => setStored({ ...segment, enabled: a !== null && b !== null && !enabled }),
    clear: () => setStored(empty(id)),
  }
}
