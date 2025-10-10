import type { MutableRefObject } from "react"
import { ListVideo } from "lucide-react"

import { cn } from "@/lib/utils"

import type { VideoItem } from "./types"

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
}: PlayerSurfaceProps) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted transition-colors",
        isDragActive && "border-primary/60 bg-primary/5",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <ListVideo className="h-8 w-8" />
          选择或导入一个视频开始播放
        </div>
      )}
      {isDragActive ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <span className="rounded-md border border-dashed border-primary/60 bg-background/90 px-4 py-2 text-sm font-medium text-primary">
            松开鼠标以导入视频
          </span>
        </div>
      ) : null}
      {tsUnsupported ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="max-w-sm rounded-md border border-destructive/40 bg-background/95 px-5 py-4 text-center text-sm text-destructive">
            当前浏览器不支持直接播放 MPEG-TS 视频，请转换为 MP4/HLS 或更换支持 MediaSource
            的浏览器。
          </div>
        </div>
      ) : null}
    </div>
  )
}
