import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, ListVideo, PlayCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { clearHistory, historyKey } from "./history"
import { usePlaybackHistory } from "./hooks/use-playback-history"
import { formatPosition } from "./subtitles"
import type { VideoItem } from "./types"
import type { VideoPlayerMessages } from "./i18n"

type PlaylistPanelProps = {
  playlist: VideoItem[]
  currentId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onReorder: (id: string, direction: -1 | 1) => void
  onSort: (direction: "asc" | "desc") => void
  removedName: string | null
  onUndo: () => void
  feedback: VideoPlayerMessages["feedback"]
  messages: VideoPlayerMessages["playlist"]
}

export function PlaylistPanel({ playlist, currentId, onSelect, onRemove, onReorder, onSort, removedName, onUndo, feedback, messages }: PlaylistPanelProps) {
  const [query, setQuery] = useState("")
  const [clearOpen, setClearOpen] = useState(false)
  const [notice, setNotice] = useState<"historyCleared" | "historyFailed" | "sorted" | null>(null)
  const history = usePlaybackHistory()
  const activeRef = useRef<HTMLButtonElement>(null)
  const search = query.trim().toLowerCase()
  useEffect(() => { activeRef.current?.scrollIntoView({ block: "nearest" }) }, [currentId])
  const visible = playlist.filter((item) => `${item.name} ${item.relativePath ?? ""}`.toLowerCase().includes(search))
  const positions = new Map(playlist.map((item, index) => [item.id, index]))
  const totalLabel = messages.countLabel.replace("{count}", String(playlist.length))

  return (
    <div className="flex h-[420px] lg:h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ListVideo className="h-4 w-4" />
          <span className="text-sm font-semibold">{messages.title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{totalLabel}</span>
      </div>
      <div className="shrink-0 space-y-2 p-2">
        <Input aria-label={feedback.search} placeholder={feedback.search} value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="flex flex-wrap gap-2">
          <select aria-label={messages.sort} className="min-w-0 rounded border bg-background px-2 py-1 text-xs" value="" disabled={playlist.length < 2} onChange={(event) => {
            const direction = event.target.value
            if (direction === "asc" || direction === "desc") { onSort(direction); setNotice("sorted") }
          }}>
            <option value="" disabled>{messages.sort}</option>
            <option value="asc">{messages.sortAsc}</option>
            <option value="desc">{messages.sortDesc}</option>
          </select>
          <Button size="sm" variant="ghost" className="h-8 text-xs" disabled={!Object.keys(history).length} onClick={() => { setNotice(null); setClearOpen(true) }}>{messages.clearHistory}</Button>
        </div>
        {search && <p role="status" className="text-xs text-muted-foreground">{messages.matches.replace("{count}", String(visible.length))} {messages.reorderHint}</p>}
        {notice && <p role="status" className="text-xs text-muted-foreground">{messages[notice]}</p>}
        {removedName && <div role="status" className="flex items-center gap-1 text-xs">
          <span className="min-w-0 flex-1 truncate" title={removedName}>{messages.removed.replace("{name}", removedName)}</span>
          <Button size="sm" variant="outline" onClick={onUndo}>{messages.undo}</Button>
        </div>}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col p-2">
          {visible.length ? visible.map((item, index) => {
            const isActive = item.id === currentId
            const position = history[historyKey(item)]
            const originalIndex = positions.get(item.id) ?? 0
            return (
              <div key={item.id} className="flex flex-col">
                <button ref={isActive ? activeRef : undefined} aria-current={isActive ? "true" : undefined} type="button" onClick={() => onSelect(item.id)}
                  className={cn("flex w-full flex-col items-start gap-1 rounded-md px-3 py-3 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isActive && "bg-primary/10 text-primary")} title={item.name}>
                  <span className="flex w-full items-start gap-2">
                    {isActive ? <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <ListVideo className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />}
                    <span className="break-all font-medium leading-tight">{item.name}</span>
                  </span>
                  <span className="ml-6 break-all text-xs text-muted-foreground">{item.relativePath || (item.source === "local" ? messages.localSource : messages.remoteSource)}</span>
                  {position > 0 && <span className="ml-6 text-xs text-muted-foreground">{messages.progress.replace("{time}", formatPosition(position))}</span>}
                </button>
                <div className="flex justify-end gap-1 py-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!search || originalIndex === 0} aria-label={`${messages.moveUp} ${item.name}`} title={messages.moveUp} onClick={() => onReorder(item.id, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!search || originalIndex === playlist.length - 1} aria-label={`${messages.moveDown} ${item.name}`} title={messages.moveDown} onClick={() => onReorder(item.id, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-destructive" aria-label={`${feedback.remove} ${item.name}`} onClick={() => onRemove(item.id)}>{feedback.remove}</Button>
                </div>
                {index < visible.length - 1 && <Separator className="opacity-40" />}
              </div>
            )
          }) : (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground">
              <ListVideo className="h-8 w-8" />
              <p>{playlist.length ? messages.noMatches : messages.empty}</p>
              {search && <Button variant="outline" size="sm" onClick={() => setQuery("")}>{messages.clearSearch}</Button>}
            </div>
          )}
        </div>
      </ScrollArea>
      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{messages.clearHistory}</DialogTitle><DialogDescription>{messages.clearHistoryDescription}</DialogDescription></DialogHeader>
          {notice === "historyFailed" && <p role="alert" className="text-sm text-destructive">{messages.historyFailed}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearOpen(false)}>{messages.cancel}</Button>
            <Button variant="destructive" onClick={() => {
              if (clearHistory()) { setClearOpen(false); setNotice("historyCleared") }
              else setNotice("historyFailed")
            }}>{messages.confirmClearHistory}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
