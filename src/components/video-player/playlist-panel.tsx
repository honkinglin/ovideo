import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
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
  onRemove: (id: string) => void
  feedback: VideoPlayerMessages["feedback"]
  messages: VideoPlayerMessages["playlist"]
}

export function PlaylistPanel({ playlist, currentId, onSelect, onRemove, feedback, messages }: PlaylistPanelProps) {
  const [query, setQuery] = useState("")
  const activeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { activeRef.current?.scrollIntoView({ block: "nearest" }) }, [currentId])
  const visible = playlist.filter((item) => `${item.name} ${item.relativePath ?? ""}`.toLowerCase().includes(query.toLowerCase()))
  const totalLabel = messages.countLabel.replace("{count}", String(playlist.length))

  return (
    <div className="flex h-[320px] lg:h-full flex-col overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ListVideo className="h-4 w-4" />
          <span className="text-sm font-semibold">{messages.title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{totalLabel}</span>
      </div>
      <div className="p-2"><Input aria-label={feedback.search} placeholder={feedback.search} value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2">
          {visible.length ? (
            visible.map((item, index) => {
              const isActive = item.id === currentId
              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    ref={isActive ? activeRef : undefined}
                    aria-current={isActive ? "true" : undefined}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-md px-3 py-3 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive && "bg-primary/10 text-primary",
                    )}
                    title={item.name} // Add tooltip for full name
                  >
                    <div className="flex items-start gap-2 w-full">
                      {isActive ? (
                        <PlayCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ListVideo className="h-4 w-4 flex-shrink-0 opacity-60 mt-0.5" />
                      )}
                      <span className="font-medium leading-tight break-words">{item.name}</span>
                    </div>
                    {item.relativePath ? (
                      <span className="text-xs text-muted-foreground ml-6 leading-tight break-words">
                        {item.relativePath}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground ml-6 capitalize">
                        {item.source === "local"
                          ? messages.localSource
                          : messages.remoteSource}
                      </span>
                    )}
                  </button>
                  <button type="button" className="self-end px-3 py-1 text-xs text-muted-foreground hover:text-destructive" aria-label={`${feedback.remove} ${item.name}`} onClick={() => onRemove(item.id)}>{feedback.remove}</button>
                  {index < visible.length - 1 ? (
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
