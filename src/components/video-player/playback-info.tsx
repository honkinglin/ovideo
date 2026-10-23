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
import type { VideoPlayerMessages } from "./i18n"

type PlaybackInfoProps = {
  currentItem: VideoItem | null
  isPlaying: boolean
  playbackRate: number
  canControlPlayback: boolean
  onTogglePlayback: () => void
  onChangePlaybackRate: (rate: number) => void
  messages: VideoPlayerMessages["playback"]
}

export function PlaybackInfo({
  currentItem,
  isPlaying,
  playbackRate,
  canControlPlayback,
  onTogglePlayback,
  onChangePlaybackRate,
  messages,
}: PlaybackInfoProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
      <div>
        <p className="text-sm font-medium">
          {currentItem ? currentItem.name : messages.noSelection}
        </p>
        {currentItem?.relativePath ? (
          <p className="text-xs text-muted-foreground">{currentItem.relativePath}</p>
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
              {messages.pause}
            </>
          ) : (
            <>
              <PlayCircle className="mr-1.5 h-4 w-4" />
              {messages.play}
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{messages.speedLabel}</span>
          <Select
            value={String(playbackRate)}
            onValueChange={(value) => onChangePlaybackRate(Number.parseFloat(value))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder={messages.speedLabel} />
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
