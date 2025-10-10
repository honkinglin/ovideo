import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PauseCircle, PlayCircle } from "lucide-react"

import { PLAYBACK_SPEEDS } from "./utils"
import type { VideoItem } from "./types"

type PlaybackInfoProps = {
  currentItem: VideoItem | null
  tsUnsupported: boolean
  isPlaying: boolean
  playbackRate: number
  canControlPlayback: boolean
  onTogglePlayback: () => void
  onChangePlaybackRate: (rate: number) => void
}

export function PlaybackInfo({
  currentItem,
  tsUnsupported,
  isPlaying,
  playbackRate,
  canControlPlayback,
  onTogglePlayback,
  onChangePlaybackRate,
}: PlaybackInfoProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
      <div>
        <p className="text-sm font-medium">
          {currentItem ? currentItem.name : "当前未选择视频"}
        </p>
        {currentItem?.relativePath ? (
          <p className="text-xs text-muted-foreground">{currentItem.relativePath}</p>
        ) : null}
        {tsUnsupported ? (
          <p className="text-xs text-destructive">
            未检测到 MediaSource 支持，无法播放 TS 格式。
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canControlPlayback}
          onClick={onTogglePlayback}
        >
          {isPlaying ? (
            <>
              <PauseCircle className="mr-1.5 h-4 w-4" />
              暂停
            </>
          ) : (
            <>
              <PlayCircle className="mr-1.5 h-4 w-4" />
              播放
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">倍速</span>
          <Select
            value={String(playbackRate)}
            onValueChange={(value) => onChangePlaybackRate(Number.parseFloat(value))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="选择倍速" />
            </SelectTrigger>
            <SelectContent>
              {PLAYBACK_SPEEDS.map((speed) => (
                <SelectItem key={speed} value={speed.toString()}>{`${speed}x`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
