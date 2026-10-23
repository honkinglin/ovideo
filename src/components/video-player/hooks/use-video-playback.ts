import { useCallback, useEffect, useRef, useState } from "react"
import { isTransportStreamSource } from "../utils"
import { readStorage, writeStorage } from "../storage"
import { HISTORY_CLEARED_EVENT, HISTORY_KEY, historyKey, readHistory, savePosition } from "../history"
import type { MpegtsModule, VideoItem } from "../types"

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "buffering" | "ended" | "error"
export type PlaybackError = "unsupported" | "network" | "decode" | "unknown" | null
const SETTINGS = "ovideo.playback.v1"
type Settings = { rate: number; volume: number; muted: boolean }
function settings(): Settings {
  const value = readStorage<Partial<Settings> | null>(SETTINGS, null)
  return {
    rate: typeof value?.rate === "number" && value.rate >= 0.25 && value.rate <= 4 ? value.rate : 1,
    volume: typeof value?.volume === "number" && value.volume >= 0 && value.volume <= 1 ? value.volume : 1,
    muted: value?.muted === true,
  }
}

export function useVideoPlayback({ videoRef, currentItem, resolveItemSource }: {
  videoRef: React.RefObject<HTMLVideoElement | null>
  currentItem: VideoItem | null
  resolveItemSource: (item: VideoItem) => string | undefined
}) {
  const [playbackRate, setPlaybackRate] = useState(() => settings().rate)
  const [status, setStatus] = useState<PlaybackStatus>("idle")
  const [error, setError] = useState<PlaybackError>(null)
  const [attempt, setAttempt] = useState(0)
  const playbackRateRef = useRef(playbackRate)
  useEffect(() => {
    playbackRateRef.current = playbackRate
    if (videoRef.current) videoRef.current.playbackRate = playbackRate
  }, [playbackRate, videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentItem) return
    let active = true
    let player: ReturnType<MpegtsModule["createPlayer"]> | undefined
    let lastSave = 0
    let metadataLoaded = false
    const key = historyKey(currentItem)
    let clearedAt: number | null = null
    const onHistoryCleared = () => { clearedAt = video.currentTime }
    const onStorage = (event: StorageEvent) => {
      if ((event.key === HISTORY_KEY || event.key === null) && Object.keys(readHistory()).length === 0) onHistoryCleared()
    }
    const fail = (reason: PlaybackError) => { if (active) { setError(reason); setStatus("error") } }
    const saveProgress = () => {
      if (!metadataLoaded || !Number.isFinite(video.currentTime)) return
      // Clearing history while paused must survive pause, unload and source cleanup.
      if (clearedAt !== null && Math.abs(video.currentTime - clearedAt) < 0.1) return
      clearedAt = null
      savePosition(key, video.ended ? 0 : video.currentTime)
    }
    const saveSettings = () => {
      setPlaybackRate(video.playbackRate)
      writeStorage(SETTINGS, { rate: video.playbackRate, volume: video.volume, muted: video.muted })
    }
    const play = async () => {
      try { await video.play() } catch (reason) {
        if (!active) return
        if (reason instanceof DOMException && ["NotAllowedError", "AbortError"].includes(reason.name)) {
          setStatus("paused")
        } else fail("unknown")
      }
    }
    const metadata = () => {
      metadataLoaded = true
      const position = readHistory()[key]
      if (position > 0 && Number.isFinite(video.duration) && position < video.duration - 3) video.currentTime = position
      video.playbackRate = playbackRateRef.current
      void play()
    }
    const playing = () => { if (active) { setError(null); setStatus("playing") } }
    const pause = () => { if (active) setStatus((state) => state === "error" ? state : "paused"); saveProgress() }
    const waiting = () => { if (active) setStatus((state) => state === "error" ? state : "buffering") }
    const ended = () => { if (active) setStatus("ended"); saveProgress() }
    const mediaError = () => fail(video.error?.code === 2 ? "network" : video.error?.code === 3 ? "decode" : video.error?.code === 4 ? "unsupported" : "unknown")
    const timeUpdate = () => { if (Date.now() - lastSave > 5000) { saveProgress(); lastSave = Date.now() } }
    const events = { loadedmetadata: metadata, playing, pause, waiting, ended, error: mediaError, timeupdate: timeUpdate, volumechange: saveSettings, ratechange: saveSettings }
    Object.entries(events).forEach(([name, handler]) => video.addEventListener(name, handler))
    window.addEventListener("pagehide", saveProgress)
    window.addEventListener(HISTORY_CLEARED_EVENT, onHistoryCleared)
    window.addEventListener("storage", onStorage)
    const initial = settings()
    video.playbackRate = playbackRateRef.current
    video.volume = initial.volume
    video.muted = initial.muted
    setStatus("loading")
    setError(null)
    const start = async () => {
      try {
        const src = resolveItemSource(currentItem)
        if (!src) { fail("unknown"); return }
        if (isTransportStreamSource(currentItem)) {
          const module = await import("mpegts.js")
          if (!active) return
          const mpegts = (module.default ?? module) as unknown as MpegtsModule
          if (!mpegts.isSupported()) { fail("unsupported"); return }
          player = mpegts.createPlayer({ type: "mpegts", isLive: false, url: src }, { enableWorker: true, lazyLoadMaxDuration: 180, deferLoadAfterSourceOpen: true })
          player.on?.(mpegts.Events?.ERROR ?? "error", (type) => fail(type === "NetworkError" ? "network" : "decode"))
          player.attachMediaElement(video)
          player.load()
        } else {
          video.src = src
          video.load()
        }
      } catch { fail("unknown") }
    }
    void start()
    return () => {
      active = false
      saveProgress()
      Object.entries(events).forEach(([name, handler]) => video.removeEventListener(name, handler))
      window.removeEventListener("pagehide", saveProgress)
      window.removeEventListener(HISTORY_CLEARED_EVENT, onHistoryCleared)
      window.removeEventListener("storage", onStorage)
      video.pause()
      if (player) { player.detachMediaElement(); player.destroy() }
      video.removeAttribute("src")
      video.load()
    }
  }, [currentItem, resolveItemSource, videoRef, attempt])

  const handleTogglePlayback = useCallback(() => {
    const video = videoRef.current
    if (!video || error) return
    if (video.paused || video.ended) {
      video.play().catch((reason: unknown) => {
        if (videoRef.current !== video) return
        if (reason instanceof DOMException && ["NotAllowedError", "AbortError"].includes(reason.name)) setStatus("paused")
        else { setError("unknown"); setStatus("error") }
      })
    } else video.pause()
  }, [error, videoRef])
  const stopPlayback = useCallback(() => { videoRef.current?.pause() }, [videoRef])
  return {
    playbackRate, setPlaybackRate, status: currentItem ? status : "idle", error: currentItem ? error : null,
    isPlaying: !!currentItem && status === "playing", tsUnsupported: error === "unsupported",
    canControlPlayback: !!currentItem && !error,
    handleTogglePlayback, stopPlayback, retry: () => setAttempt((value) => value + 1),
  }
}
