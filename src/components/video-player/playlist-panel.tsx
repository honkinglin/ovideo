import { ListVideo, PlayCircle } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { VideoItem } from "./types"
import type { VideoPlayerMessages } from "./i18n"

type PlaylistPanelProps = {
  playlist: VideoItem[]
  currentId: string | null
  onSelect: (id: string) => void
  messages: VideoPlayerMessages["playlist"]
}

export function PlaylistPanel({ playlist, currentId, onSelect, messages }: PlaylistPanelProps) {
  const totalLabel = messages.countLabel.replace("{count}", String(playlist.length))

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ListVideo className="h-4 w-4" />
          <span className="text-sm font-semibold">{messages.title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{totalLabel}</span>
      </div>
      <ScrollArea className="h-full max-h-[500px] lg:max-h-[430px]">
        <div className="flex flex-col p-2">
          {playlist.length ? (
            playlist.map((item, index) => {
              const isActive = item.id === currentId
              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive && "bg-primary/10 text-primary",
                    )}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {isActive ? (
                        <PlayCircle className="h-4 w-4 flex-none" />
                      ) : (
                        <ListVideo className="h-4 w-4 flex-none opacity-60" />
                      )}
                      {item.name}
                    </span>
                    {item.relativePath ? (
                      <span className="text-xs text-muted-foreground">
                        {item.relativePath}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.source === "local"
                          ? messages.localSource
                          : messages.remoteSource}
                      </span>
                    )}
                  </button>
                  {index < playlist.length - 1 ? (
                    <Separator className="mx-3 opacity-40" />
                  ) : null}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground">
              <ListVideo className="h-8 w-8" />
              <p>{messages.empty}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
