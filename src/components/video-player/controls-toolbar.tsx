import {
  type ChangeEventHandler,
  type MutableRefObject,
  useEffect,
  useRef,
} from "react"
import { FileVideo, FolderOpen, Link2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type MediaToolbarProps = {
  fileInputRef: MutableRefObject<HTMLInputElement | null>
  folderInputRef: MutableRefObject<HTMLInputElement | null>
  isUrlDialogOpen: boolean
  hasPlaylist: boolean
  urlValue: string
  urlError: string | null
  onUrlDialogOpenChange: (open: boolean) => void
  onUrlValueChange: (value: string) => void
  onUrlConfirm: () => void
  onUrlCancel: () => void
  onFileInputChange: ChangeEventHandler<HTMLInputElement>
  onFolderInputChange: ChangeEventHandler<HTMLInputElement>
  isClearDialogOpen: boolean
  onClearDialogOpenChange: (open: boolean) => void
  onConfirmClearPlaylist: () => void
  onCancelClearPlaylist: () => void
}

export function MediaToolbar({
  fileInputRef,
  folderInputRef,
  isUrlDialogOpen,
  hasPlaylist,
  urlValue,
  urlError,
  onUrlDialogOpenChange,
  onUrlValueChange,
  onUrlConfirm,
  onUrlCancel,
  onFileInputChange,
  onFolderInputChange,
  isClearDialogOpen,
  onClearDialogOpenChange,
  onConfirmClearPlaylist,
  onCancelClearPlaylist,
}: MediaToolbarProps) {
  const clearContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isClearDialogOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      const container = clearContainerRef.current
      if (!container) return
      if (!container.contains(event.target as Node)) {
        onCancelClearPlaylist()
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [isClearDialogOpen, onCancelClearPlaylist])

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="video/*,.ts,.m2ts,.mts"
        multiple
        onChange={onFileInputChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        accept="video/*,.ts,.m2ts,.mts"
        multiple
        // @ts-expect-error - 非标准属性用于选择文件夹
        webkitdirectory="true"
        onChange={onFolderInputChange}
      />

      <Button onClick={() => fileInputRef.current?.click()}>
        <FileVideo className="mr-2 h-4 w-4" />
        打开视频
      </Button>
      <Button variant="secondary" onClick={() => folderInputRef.current?.click()}>
        <FolderOpen className="mr-2 h-4 w-4" />
        导入文件夹
      </Button>
      <Dialog open={isUrlDialogOpen} onOpenChange={onUrlDialogOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Link2 className="mr-2 h-4 w-4" />
            添加链接
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加视频链接</DialogTitle>
            <DialogDescription>
              支持 http 或 https 协议的视频文件地址。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="video-url">视频地址</Label>
            <Input
              id="video-url"
              placeholder="https://example.com/video.mp4"
              value={urlValue}
              onChange={(event) => onUrlValueChange(event.target.value)}
            />
            {urlError ? <p className="text-xs text-destructive">{urlError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onUrlCancel}>
              取消
            </Button>
            <Button type="button" onClick={onUrlConfirm}>
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="relative" ref={clearContainerRef}>
        <Button
          variant="ghost"
          disabled={!hasPlaylist}
          onClick={() => onClearDialogOpenChange(!isClearDialogOpen)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          清空列表
        </Button>
        {isClearDialogOpen ? (
          <div
            role="alertdialog"
            aria-modal="true"
            className="absolute left-0 top-full z-40 mt-2 w-64 rounded-md border border-border bg-background p-4 shadow-lg"
          >
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">确认清空播放列表？</h3>
              <p className="text-xs text-muted-foreground">
                此操作将移除所有已添加的视频资源，且本地文件的临时链接会被释放。
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onCancelClearPlaylist}>
                取消
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onConfirmClearPlaylist}
              >
                确认清空
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
