import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  FileVideo,
  FolderOpen,
  Link2,
  ListVideo,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type VideoSource = "local" | "remote"

type VideoItem = {
  id: string
  name: string
  src: string
  source: VideoSource
  relativePath?: string
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

function getFileLabel(file: File): string {
  const relativePath = (file as File & { webkitRelativePath?: string })
    .webkitRelativePath
  if (relativePath) {
    return relativePath
  }
  return file.name
}

function getNameFromUrl(input: string) {
  try {
    const url = new URL(input)
    const segments = url.pathname.split("/").filter(Boolean)
    if (segments.length) return decodeURIComponent(segments[segments.length - 1])
    return url.host
  } catch {
    return input
  }
}

export function VideoPlayer() {
  const [playlist, setPlaylist] = useState<VideoItem[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const [urlValue, setUrlValue] = useState("")
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlsRef = useRef(new Map<string, string>())

  const currentItem = useMemo(
    () => playlist.find((item) => item.id === currentId) ?? null,
    [currentId, playlist],
  )

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      objectUrlsRef.current.clear()
    }
  }, [])

  useEffect(() => {
    if (!currentId && playlist.length) {
      setCurrentId(playlist[0].id)
      return
    }
    if (!playlist.length) {
      setCurrentId(null)
    }
  }, [playlist, currentId])

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    if (!videoRef.current || !currentItem) return

    const el = videoRef.current
    el.pause()
    el.load()
    setIsPlaying(false)
    el.onloadedmetadata = () => {
      el.playbackRate = playbackRate
      void el.play().catch(() => {
        /* ignore auto-play errors */
      })
    }
  }, [currentItem, playbackRate])

  const handleAddItems = useCallback(
    (items: VideoItem[]) => {
      setPlaylist((prev) => {
        const next = [...prev, ...items]
        return next
      })
      if (!currentId && items.length) {
        setCurrentId(items[0].id)
        setIsPlaying(false)
      }
    },
    [currentId],
  )

  const addFilesToPlaylist = useCallback(
    (files: FileList | File[]) => {
      const videoFiles = Array.from(files).filter((file) =>
        file.type.startsWith("video/"),
      )
      if (!videoFiles.length) {
        return
      }

      const newItems: VideoItem[] = videoFiles.map((file) => {
        const id = crypto.randomUUID()
        const objectUrl = URL.createObjectURL(file)
        objectUrlsRef.current.set(id, objectUrl)
        return {
          id,
          name: file.name,
          src: objectUrl,
          source: "local" as const,
          relativePath: getFileLabel(file),
        }
      })

      handleAddItems(newItems)
    },
    [handleAddItems],
  )

  const handleFileChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (!event.target.files?.length) return
      addFilesToPlaylist(event.target.files)
      event.target.value = ""
    },
    [addFilesToPlaylist],
  )

  const handleFolderChange =
    useCallback<React.ChangeEventHandler<HTMLInputElement>>(
      (event) => {
        if (!event.target.files?.length) return
        addFilesToPlaylist(event.target.files)
        event.target.value = ""
      },
      [addFilesToPlaylist],
    )

  const handleAddUrl = useCallback(() => {
    if (!urlValue.trim()) {
      setUrlError("请输入视频链接")
      return
    }
    let normalized: string
    try {
      const url = new URL(urlValue.trim())
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("仅支持 http 或 https 协议")
      }
      normalized = url.toString()
    } catch (error) {
      setUrlError(
        error instanceof Error ? error.message : "请输入有效的视频链接",
      )
      return
    }

    const id = crypto.randomUUID()

    const item: VideoItem = {
      id,
      name: getNameFromUrl(normalized),
      src: normalized,
      source: "remote",
    }

    handleAddItems([item])
    setCurrentId(id)
    setIsPlaying(false)
    setIsUrlDialogOpen(false)
    setUrlValue("")
    setUrlError(null)
  }, [handleAddItems, urlValue])

  const handleSelectVideo = useCallback((id: string) => {
    setCurrentId(id)
    setIsPlaying(false)
  }, [])

  const handleClearPlaylist = useCallback(() => {
    playlist.forEach((item) => {
      if (item.source === "local") {
        const url = objectUrlsRef.current.get(item.id)
        if (url) {
          URL.revokeObjectURL(url)
          objectUrlsRef.current.delete(item.id)
        }
      }
    })
    setPlaylist([])
    setCurrentId(null)
    setIsPlaying(false)
  }, [playlist])

  const handleVideoEnded = useCallback(() => {
    if (!currentId) return
    const currentIndex = playlist.findIndex((item) => item.id === currentId)
    if (currentIndex === -1) return
    const next = playlist[currentIndex + 1]
    if (next) {
      setCurrentId(next.id)
    }
    setIsPlaying(false)
  }, [currentId, playlist])

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          在线视频播放器
        </h1>
        <p className="text-sm text-muted-foreground">
          加载本地文件或在线链接，管理播放列表，并自定义播放倍速。
        </p>
      </header>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-semibold">媒体控制台</CardTitle>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="video/*"
              multiple
              onChange={handleFileChange}
            />
            <input
              ref={folderInputRef}
              type="file"
              className="hidden"
              accept="video/*"
              multiple
              // @ts-expect-error - 非标准属性用于选择文件夹
              webkitdirectory="true"
              onChange={handleFolderChange}
            />

            <Button onClick={() => fileInputRef.current?.click()}>
              <FileVideo className="mr-2 h-4 w-4" />
              打开视频
            </Button>
            <Button
              variant="secondary"
              onClick={() => folderInputRef.current?.click()}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              导入文件夹
            </Button>
            <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
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
                    onChange={(event) => {
                      setUrlValue(event.target.value)
                      setUrlError(null)
                    }}
                  />
                  {urlError ? (
                    <p className="text-xs text-destructive">{urlError}</p>
                  ) : null}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsUrlDialogOpen(false)
                      setUrlError(null)
                    }}
                  >
                    取消
                  </Button>
                  <Button type="button" onClick={handleAddUrl}>
                    确认添加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              onClick={handleClearPlaylist}
              disabled={!playlist.length}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              清空列表
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-6 overflow-hidden py-6">
          <div className="grid flex-1 gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="flex flex-1 flex-col gap-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                {currentItem ? (
                  <video
                    key={currentItem.id}
                    ref={videoRef}
                    src={currentItem.src}
                    controls
                    playsInline
                    className="h-full w-full bg-black object-contain"
                    onEnded={handleVideoEnded}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ListVideo className="h-8 w-8" />
                    选择或导入一个视频开始播放
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
                <div>
                  <p className="text-sm font-medium">
                    {currentItem ? currentItem.name : "当前未选择视频"}
                  </p>
                  {currentItem?.relativePath ? (
                    <p className="text-xs text-muted-foreground">
                      {currentItem.relativePath}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!currentItem || !videoRef.current}
                    onClick={() => {
                      if (!videoRef.current) return
                      if (videoRef.current.paused || videoRef.current.ended) {
                        void videoRef.current.play()
                      } else {
                        videoRef.current.pause()
                      }
                    }}
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
                      onValueChange={(value) =>
                        setPlaybackRate(Number.parseFloat(value))
                      }
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="选择倍速" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAYBACK_SPEEDS.map((speed) => (
                          <SelectItem
                            key={speed}
                            value={speed.toString()}
                          >{`${speed}x`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <ListVideo className="h-4 w-4" />
                  <span className="text-sm font-semibold">播放列表</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {playlist.length} 个视频
                </span>
              </div>
              <ScrollArea className="h-full">
                <div className="flex flex-col p-2">
                  {playlist.length ? (
                    playlist.map((item, index) => {
                      const isActive = item.id === currentId
                      return (
                        <div key={item.id} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleSelectVideo(item.id)}
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
                                {item.source === "local" ? "本地文件" : "在线视频"}
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
                      <p>播放列表为空，添加本地文件或在线视频即可开始。</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
