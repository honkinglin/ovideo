import type { MutableRefObject } from "react"
import { ListVideo } from "lucide-react"

import { cn } from "@/lib/utils"

import type { VideoItem } from "./types"
import type { VideoPlayerMessages } from "./i18n"

type PlayerSurfaceProps = {
  currentItem: VideoItem | null
  videoRef: MutableRefObject<HTMLVideoElement | null>
  isDragActive: boolean
  tsUnsupported: boolean
  onDragOver: React.DragEventHandler<HTMLDivElement>
  onDragLeave: React.DragEventHandler<HTMLDivElement>
  onDrop: React.DragEventHandler<HTMLDivElement>
  onVideoEnded: () => void
  onVideoPlay: () => void
  onVideoPause: () => void
  messages: VideoPlayerMessages["playerSurface"]
}

export function PlayerSurface({
  currentItem,
  videoRef,
  isDragActive,
  tsUnsupported,
  onDragOver,
  onDragLeave,
  onDrop,
  onVideoEnded,
  onVideoPlay,
  onVideoPause,
  messages,
}: PlayerSurfaceProps) {
  // When no video, clicking the surface triggers file input
  const handleSurfaceClick = () => {
    if (!currentItem) {
      const fileInput = document.querySelector('input[type="file"]:not([webkitdirectory])');
      if (fileInput) {
        (fileInput as HTMLInputElement).click();
      }
    }
  };

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted transition-colors cursor-pointer",
        isDragActive && "border-primary/60 bg-primary/5",
        !currentItem && "hover:border-primary/60"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleSurfaceClick}
    >
      {currentItem ? (
        <video
          key={currentItem.id}
          ref={videoRef}
          controls
          playsInline
          className="h-full w-full bg-black object-contain"
          onEnded={onVideoEnded}
          onPlay={onVideoPlay}
          onPause={onVideoPause}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground select-none">
          <ListVideo className="h-8 w-8" />
          {messages.idlePrompt}
        </div>
      )}
      {isDragActive ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <span className="rounded-md border border-dashed border-primary/60 bg-background/90 px-4 py-2 text-sm font-medium text-primary">
            {messages.dragOverlay}
          </span>
        </div>
      ) : null}
      {tsUnsupported ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="max-w-sm rounded-md border border-destructive/40 bg-background/95 px-5 py-4 text-center text-sm text-destructive">
            {messages.tsUnsupported}
          </div>
        </div>
      ) : null}
    </div>
  )
}
