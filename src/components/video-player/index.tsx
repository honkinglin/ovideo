import {
  type ChangeEventHandler,
  type DragEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { MediaToolbar } from "./controls-toolbar"
import { PlaybackInfo } from "./playback-info"
import { PlayerSurface } from "./player-surface"
import { PlaylistPanel } from "./playlist-panel"
import {
  comparePlaylistItems,
  getFileLabel,
  getNameFromUrl,
  isTransportStreamFile,
  isTransportStreamSource,
} from "./utils"
import type { MpegtsModule, VideoItem } from "./types"
import rawMpegtsModule from "mpegts.js"

const mpegts = (
  (rawMpegtsModule as { default?: unknown }).default ?? rawMpegtsModule
) as MpegtsModule

export function VideoPlayer() {
  const [playlist, setPlaylist] = useState<VideoItem[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const [urlValue, setUrlValue] = useState("")
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [tsUnsupported, setTsUnsupported] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlsRef = useRef(new Map<string, string>())
  const mpegtsPlayerRef = useRef<ReturnType<MpegtsModule["createPlayer"]> | null>(null)
  const playbackRateRef = useRef(playbackRate)

  const ensureLocalObjectUrl = useCallback((item: VideoItem) => {
    if (item.source !== "local") return undefined
    const existing = objectUrlsRef.current.get(item.id)
    if (existing) return existing
    if (!item.file) return undefined
    const objectUrl = URL.createObjectURL(item.file)
    objectUrlsRef.current.set(item.id, objectUrl)
    return objectUrl
  }, [])

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
      setIsClearDialogOpen(false)
    }
  }, [playlist, currentId])

  useEffect(() => {
    playbackRateRef.current = playbackRate
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  useEffect(() => {
    const videoEl = videoRef.current
    const item = currentItem
    let isActive = true

    const detachPlayer = () => {
      const player = mpegtsPlayerRef.current
      if (player) {
        player.detachMediaElement()
        player.destroy()
        mpegtsPlayerRef.current = null
      }
    }

    const resetVideoElement = () => {
      if (!videoEl) return
      videoEl.pause()
      videoEl.removeAttribute("src")
      videoEl.load()
      videoEl.onloadedmetadata = null
    }

    if (!videoEl) {
      return
    }

    if (!item) {
      setTsUnsupported(false)
      setIsPlaying(false)
      detachPlayer()
      resetVideoElement()
      return
    }

    setIsPlaying(false)

    const isTsStream = isTransportStreamSource(item)

    if (isTsStream) {
      detachPlayer()
      resetVideoElement()

      const sourceUrl =
        item.source === "local" ? ensureLocalObjectUrl(item) : item.src

      if (!sourceUrl) {
        setTsUnsupported(true)
        return () => {
          isActive = false
        }
      }

      if (!mpegts.isSupported()) {
        setTsUnsupported(true)
        return () => {
          isActive = false
        }
      }

      setTsUnsupported(false)

      const player = mpegts.createPlayer(
        {
          type: "mpegts",
          isLive: false,
          url: sourceUrl,
        },
        {
          enableWorker: true,
          lazyLoadMaxDuration: 3 * 60,
          deferLoadAfterSourceOpen: true,
        },
      )
      mpegtsPlayerRef.current = player

      const errorEvent = mpegts.Events?.ERROR ?? "error"
      const handlePlayerError = () => {
        if (!isActive) return
        detachPlayer()
        setTsUnsupported(true)
        setIsPlaying(false)
      }
      player.on?.(errorEvent, handlePlayerError)

      player.attachMediaElement(videoEl)
      player.load()
      videoEl.playbackRate = playbackRateRef.current
      const playbackAttempt = player.play()
      if (playbackAttempt instanceof Promise) {
        playbackAttempt.catch(() => {
          /* autoplay may fail; user must click play */
        })
      }

      return () => {
        isActive = false
        detachPlayer()
      }
    }

    setTsUnsupported(false)
    detachPlayer()

    const sourceUrl =
      item.source === "local" ? ensureLocalObjectUrl(item) : item.src

    if (!sourceUrl) {
      resetVideoElement()
      return () => {
        isActive = false
      }
    }

    const handleLoadedMetadata = () => {
      videoEl.playbackRate = playbackRateRef.current
      const playbackAttempt = videoEl.play()
      if (playbackAttempt instanceof Promise) {
        playbackAttempt.catch(() => {
          /* autoplay may fail; user must click play */
        })
      }
    }

    videoEl.pause()
    if (videoEl.src !== sourceUrl) {
      videoEl.src = sourceUrl
    }
    videoEl.load()
    videoEl.onloadedmetadata = handleLoadedMetadata

    return () => {
      isActive = false
      videoEl.onloadedmetadata = null
    }
  }, [currentItem, ensureLocalObjectUrl])

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

  type AddFilesOptions = {
    sortMode?: "alphabetical"
  }

  const addFilesToPlaylist = useCallback(
    (files: FileList | File[], options?: AddFilesOptions) => {
      const videoFiles = Array.from(files).filter(
        (file) =>
          (file.type && file.type.startsWith("video/")) || isTransportStreamFile(file),
      )
      if (!videoFiles.length) {
        return
      }

      const newItems: VideoItem[] = videoFiles.map((file) => {
        const id = crypto.randomUUID()
        return {
          id,
          name: file.name,
          source: "local" as const,
          relativePath: getFileLabel(file),
          file,
        }
      })

      const sortedItems =
        options?.sortMode === "alphabetical"
          ? [...newItems].sort(comparePlaylistItems)
          : newItems

      handleAddItems(sortedItems)
    },
    [handleAddItems],
  )

  const handleFileChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (!event.target.files?.length) return
      addFilesToPlaylist(event.target.files)
      event.target.value = ""
    },
    [addFilesToPlaylist],
  )

  const handleFolderChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (!event.target.files?.length) return
      addFilesToPlaylist(event.target.files, { sortMode: "alphabetical" })
      event.target.value = ""
    },
    [addFilesToPlaylist],
  )

  const handleUrlValueChange = useCallback((value: string) => {
    setUrlValue(value)
    setUrlError(null)
  }, [])

  const handleAddUrl = useCallback(() => {
    const trimmed = urlValue.trim()
    if (!trimmed) {
      setUrlError("请输入视频链接")
      return
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setUrlError("仅支持 http 或 https 协议")
      return
    }
    if (/\s/.test(trimmed)) {
      setUrlError("请输入有效的视频链接")
      return
    }

    const hostSegment = trimmed.slice(trimmed.indexOf("//") + 2).split(/[/?#]/)[0]
    if (!hostSegment) {
      setUrlError("请输入有效的视频链接")
      return
    }

    const normalized = trimmed

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

  const handleDragOver = useCallback<DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = "copy"
      setIsDragActive(true)
    },
    [],
  )

  const handleDragLeave = useCallback<DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()
      const nextTarget = event.relatedTarget as Node | null
      if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
        setIsDragActive(false)
      }
    },
    [],
  )

  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()
      setIsDragActive(false)
      const files = event.dataTransfer?.files
      if (files?.length) {
        addFilesToPlaylist(files)
      }
    },
    [addFilesToPlaylist],
  )

  const handleUrlDialogOpenChange = useCallback((open: boolean) => {
    setIsUrlDialogOpen(open)
    if (!open) {
      setUrlError(null)
    }
  }, [])

  const handleCancelUrl = useCallback(() => {
    setIsUrlDialogOpen(false)
    setUrlError(null)
  }, [])

  const handleClearDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open && !playlist.length) {
        setIsClearDialogOpen(false)
        return
      }
      setIsClearDialogOpen(open)
    },
    [playlist],
  )

  const handleConfirmClearPlaylist = useCallback(() => {
    handleClearPlaylist()
    setIsClearDialogOpen(false)
  }, [handleClearPlaylist])

  const handleCancelClearPlaylist = useCallback(() => {
    setIsClearDialogOpen(false)
  }, [])

  const handleTogglePlayback = useCallback(() => {
    const video = videoRef.current
    if (!video || tsUnsupported) return
    if (video.paused || video.ended) {
      void video.play()
    } else {
      video.pause()
    }
  }, [tsUnsupported])

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate)
  }, [])

  const canControlPlayback = Boolean(currentItem && videoRef.current && !tsUnsupported)

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">在线视频播放器</h1>
        <p className="text-sm text-muted-foreground">
          加载本地文件或在线链接，管理播放列表，并自定义播放倍速。
        </p>
      </header>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-semibold">媒体控制台</CardTitle>
          <MediaToolbar
            fileInputRef={fileInputRef}
            folderInputRef={folderInputRef}
            isUrlDialogOpen={isUrlDialogOpen}
            hasPlaylist={playlist.length > 0}
            urlValue={urlValue}
            urlError={urlError}
            onUrlDialogOpenChange={handleUrlDialogOpenChange}
            onUrlValueChange={handleUrlValueChange}
            onUrlConfirm={handleAddUrl}
            onUrlCancel={handleCancelUrl}
            onFileInputChange={handleFileChange}
            onFolderInputChange={handleFolderChange}
            isClearDialogOpen={isClearDialogOpen}
            onClearDialogOpenChange={handleClearDialogOpenChange}
            onConfirmClearPlaylist={handleConfirmClearPlaylist}
            onCancelClearPlaylist={handleCancelClearPlaylist}
          />
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-6 overflow-hidden py-6">
          <div className="grid flex-1 gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="flex flex-1 flex-col gap-4">
              <PlayerSurface
                currentItem={currentItem}
                videoRef={videoRef}
                isDragActive={isDragActive}
                tsUnsupported={tsUnsupported}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onVideoEnded={handleVideoEnded}
                onVideoPlay={() => setIsPlaying(true)}
                onVideoPause={() => setIsPlaying(false)}
              />
              <PlaybackInfo
                currentItem={currentItem}
                tsUnsupported={tsUnsupported}
                isPlaying={isPlaying}
                playbackRate={playbackRate}
                canControlPlayback={canControlPlayback}
                onTogglePlayback={handleTogglePlayback}
                onChangePlaybackRate={handlePlaybackRateChange}
              />
            </div>

            <PlaylistPanel
              playlist={playlist}
              currentId={currentId}
              onSelect={handleSelectVideo}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
