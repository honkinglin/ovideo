import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { Button } from "@/components/ui/button"
import type { VideoPlayerMessages } from "./i18n"
import { formatPosition, toWebVtt } from "./subtitles"
import type { useSegmentLoop } from "./hooks/use-segment-loop"

type StudyToolsProps = {
  videoRef: RefObject<HTMLVideoElement | null>
  available: boolean
  loop: ReturnType<typeof useSegmentLoop>
  messages: VideoPlayerMessages["study"]
}

export function StudyTools({ videoRef, available, loop, messages }: StudyToolsProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const trackRef = useRef<HTMLTrackElement | null>(null)
  const generation = useRef(0)
  const [subtitle, setSubtitle] = useState<{ name: string; text: string } | null>(null)
  const [visible, setVisible] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<"invalid" | "tooLarge" | "readFailed" | null>(null)
  const [invalidB, setInvalidB] = useState(false)

  useEffect(() => () => { generation.current++ }, [])
  useEffect(() => {
    const video = videoRef.current
    if (!video || !subtitle) return
    const url = URL.createObjectURL(new Blob([subtitle.text], { type: "text/vtt" }))
    const track = document.createElement("track")
    track.kind = "subtitles"
    track.label = subtitle.name
    track.src = url
    track.default = true
    const onError = () => setError("invalid")
    track.addEventListener("error", onError)
    video.appendChild(track)
    track.track.mode = "showing"
    trackRef.current = track
    return () => {
      track.removeEventListener("error", onError)
      track.remove()
      trackRef.current = null
      URL.revokeObjectURL(url)
    }
  }, [subtitle, videoRef])
  useEffect(() => {
    if (trackRef.current) trackRef.current.track.mode = visible ? "showing" : "disabled"
  }, [visible, subtitle])

  const loadSubtitle = async (file: File) => {
    const request = ++generation.current
    setError(null)
    if (file.size > 2 * 1024 * 1024) { setBusy(false); setError("tooLarge"); return }
    setBusy(true)
    try {
      const text = await file.text()
      if (request !== generation.current) return
      const converted = toWebVtt(text, file.name)
      setSubtitle({ name: file.name, text: converted })
      setVisible(true)
    } catch (reason) {
      if (request === generation.current) setError(reason instanceof Error && reason.message === "format" ? "invalid" : "readFailed")
    } finally {
      if (request === generation.current) setBusy(false)
    }
  }

  return (
    <details className="shrink-0 rounded-lg border px-3 py-2 text-sm">
      <summary className="cursor-pointer font-medium">{messages.title}</summary>
      <div className="mt-3 space-y-3">
        <input ref={inputRef} type="file" accept=".srt,.vtt" aria-label={messages.importSubtitle} className="hidden" onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) void loadSubtitle(file)
        }} />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={!available || busy} onClick={() => inputRef.current?.click()}>{busy ? messages.reading : messages.importSubtitle}</Button>
          {subtitle && <>
            <span className="max-w-[180px] truncate" title={subtitle.name}>{subtitle.name}</span>
            <Button size="sm" variant="outline" aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? messages.hideSubtitle : messages.showSubtitle}</Button>
            <Button size="sm" variant="ghost" onClick={() => { generation.current++; setSubtitle(null); setError(null) }}>{messages.removeSubtitle}</Button>
          </>}
        </div>
        {error && <p role="alert" className="text-destructive">{messages[error]}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={!available} onClick={() => { loop.markA(); setInvalidB(false) }}>{messages.markA}</Button>
          <Button size="sm" variant="outline" disabled={!available || loop.a === null} onClick={() => setInvalidB(!loop.markB())}>{messages.markB}</Button>
          <span aria-live="polite">A {formatPosition(loop.a)} → B {formatPosition(loop.b)}</span>
          <Button size="sm" variant="outline" disabled={loop.b === null} aria-pressed={loop.enabled} onClick={loop.toggle}>{loop.enabled ? messages.pauseLoop : messages.resumeLoop}</Button>
          <Button size="sm" variant="ghost" disabled={loop.a === null} onClick={() => { loop.clear(); setInvalidB(false) }}>{messages.clearLoop}</Button>
        </div>
        {invalidB && <p role="alert" className="text-destructive">{messages.invalidB}</p>}
        <p className="text-xs text-muted-foreground">{messages.hint}</p>
        <p className="text-xs text-muted-foreground">{messages.shortcuts}</p>
      </div>
    </details>
  )
}
