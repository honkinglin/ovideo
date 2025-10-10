import type { ChangeEventHandler, MutableRefObject } from "react"
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
  onClearPlaylist: () => void
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
  onClearPlaylist,
}: MediaToolbarProps) {
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
      <Button variant="ghost" onClick={onClearPlaylist} disabled={!hasPlaylist}>
        <Trash2 className="mr-2 h-4 w-4" />
        清空列表
      </Button>
    </div>
  )
}
