import type { RefObject } from "react"
import { ListVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { VideoItem } from "./types"
import type { VideoPlayerMessages } from "./i18n"
import type { PlaybackError, PlaybackStatus } from "./hooks/use-video-playback"

type PlayerSurfaceProps = {
  currentItem: VideoItem | null
  videoRef: RefObject<HTMLVideoElement | null>
  isDragActive: boolean
  status: PlaybackStatus
  error: PlaybackError
  onRetry: () => void
  onOpenFiles: () => void
  onDragOver: React.DragEventHandler<HTMLDivElement>
  onDragLeave: React.DragEventHandler<HTMLDivElement>
  onDrop: React.DragEventHandler<HTMLDivElement>
  onVideoEnded: () => void
  messages: VideoPlayerMessages["playerSurface"]
  feedback: VideoPlayerMessages["feedback"]
}

export function PlayerSurface({ currentItem, videoRef, isDragActive, status, error, onRetry, onOpenFiles, onDragOver, onDragLeave, onDrop, onVideoEnded, messages, feedback }: PlayerSurfaceProps) {
  return (
    <div className={cn("relative aspect-video min-h-[180px] w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted lg:aspect-auto lg:flex-1", isDragActive && "border-primary/60 bg-primary/5")}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {currentItem ? (
        <video key={currentItem.id} ref={videoRef} controls playsInline className="h-full w-full bg-black object-contain" onEnded={onVideoEnded} />
      ) : (
        <button type="button" onClick={onOpenFiles} className="flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground focus-visible:outline focus-visible:outline-2">
          <ListVideo className="h-8 w-8" />{messages.idlePrompt}
        </button>
      )}
      {isDragActive && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">{messages.dragOverlay}</div>}
      {(status === "loading" || status === "buffering") && !error && <div role="status" className="pointer-events-none absolute left-3 top-3 rounded bg-background/90 px-3 py-2 text-sm">{feedback[status]}</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-4">
        <div role="alert" className="max-w-sm space-y-3 text-center text-sm">
          <p>{feedback[error]}</p><Button onClick={onRetry}>{feedback.retry}</Button>
        </div>
      </div>}
    </div>
  )
}
