import { type ChangeEventHandler, useCallback, useRef } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { MediaToolbar } from "./controls-toolbar"
import { PlaybackInfo } from "./playback-info"
import { PlayerSurface } from "./player-surface"
import { PlaylistPanel } from "./playlist-panel"
import {
  type AddFilesOptions,
  useVideoPlaylist,
} from "./hooks/use-video-playlist"
import { useVideoPlayback } from "./hooks/use-video-playback"
import { useUrlDialog } from "./hooks/use-url-dialog"
import { useDragAndDrop } from "./hooks/use-drag-drop"
import { useClearDialog } from "./hooks/use-clear-dialog"

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const {
    playlist,
    currentId,
    currentItem,
    hasPlaylist,
    addLocalFiles,
    addRemoteSource,
    selectVideo,
    clearPlaylist,
    playNext,
    resolveItemSource,
  } = useVideoPlaylist()

  const {
    playbackRate,
    setPlaybackRate,
    isPlaying,
    tsUnsupported,
    canControlPlayback,
    handleTogglePlayback,
    handleVideoPlay,
    handleVideoPause,
    stopPlayback,
  } = useVideoPlayback({
    videoRef,
    currentItem,
    resolveItemSource,
  })

  const addFilesAndStop = useCallback(
    (files: FileList | File[], options?: AddFilesOptions) => {
      const added = addLocalFiles(files, options)
      if (added.length) {
        stopPlayback()
      }
    },
    [addLocalFiles, stopPlayback],
  )

  const urlDialog = useUrlDialog({
    onSubmit: (normalized) => {
      const item = addRemoteSource(normalized)
      if (!item) {
        return false
      }
      stopPlayback()
      return true
    },
  })

  const clearDialog = useClearDialog({
    hasPlaylist,
    onConfirm: () => {
      clearPlaylist()
      stopPlayback()
    },
  })

  const { isDragActive, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop({
    onFiles: (files) => addFilesAndStop(files),
  })

  const handleFileChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (!event.target.files?.length) return
      addFilesAndStop(event.target.files)
      event.target.value = ""
    },
    [addFilesAndStop],
  )

  const handleFolderChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (!event.target.files?.length) return
      addFilesAndStop(event.target.files, { sortMode: "alphabetical" })
      event.target.value = ""
    },
    [addFilesAndStop],
  )

  const handleSelectVideo = useCallback(
    (id: string) => {
      selectVideo(id)
      stopPlayback()
    },
    [selectVideo, stopPlayback],
  )

  const handleVideoEnded = useCallback(() => {
    playNext()
    stopPlayback()
  }, [playNext, stopPlayback])

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
            isUrlDialogOpen={urlDialog.isOpen}
            hasPlaylist={hasPlaylist}
            urlValue={urlDialog.value}
            urlError={urlDialog.error}
            onUrlDialogOpenChange={urlDialog.onOpenChange}
            onUrlValueChange={urlDialog.onValueChange}
            onUrlConfirm={urlDialog.onConfirm}
            onUrlCancel={urlDialog.onCancel}
            onFileInputChange={handleFileChange}
            onFolderInputChange={handleFolderChange}
            isClearDialogOpen={clearDialog.isOpen}
            onClearDialogOpenChange={clearDialog.onOpenChange}
            onConfirmClearPlaylist={clearDialog.onConfirm}
            onCancelClearPlaylist={clearDialog.onCancel}
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
                onVideoPlay={handleVideoPlay}
                onVideoPause={handleVideoPause}
              />
              <PlaybackInfo
                currentItem={currentItem}
                tsUnsupported={tsUnsupported}
                isPlaying={isPlaying}
                playbackRate={playbackRate}
                canControlPlayback={canControlPlayback}
                onTogglePlayback={handleTogglePlayback}
                onChangePlaybackRate={setPlaybackRate}
              />
            </div>

            <PlaylistPanel playlist={playlist} currentId={currentId} onSelect={handleSelectVideo} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
