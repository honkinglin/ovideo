import { type ChangeEventHandler, useCallback, useMemo, useRef } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Languages, Moon, Sun } from "lucide-react"

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
import { usePreferences } from "./hooks/use-preferences"
import type { Language } from "./i18n"

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const { language, setLanguage, toggleTheme, theme, messages } = usePreferences()

  const languageOptions = useMemo(
    () => [
      { value: "zh" as Language, label: messages.preferences.languageOptions.zh },
      { value: "en" as Language, label: messages.preferences.languageOptions.en },
    ],
    [messages],
  )

  const themeToggleLabel = theme === "dark"
    ? messages.preferences.themeToggle.toLight
    : messages.preferences.themeToggle.toDark

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
    errors: messages.urlErrors,
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{messages.app.title}</h1>
          <p className="text-sm text-muted-foreground">{messages.app.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger className="w-[140px]" aria-label={messages.preferences.languageLabel}>
                <SelectValue placeholder={messages.preferences.languageLabel} />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={themeToggleLabel}
            title={themeToggleLabel}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-xl font-semibold">
            {messages.app.controlPanelTitle}
          </CardTitle>
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
            messages={messages.toolbar}
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
                messages={messages.playerSurface}
              />
              <PlaybackInfo
                currentItem={currentItem}
                tsUnsupported={tsUnsupported}
                isPlaying={isPlaying}
                playbackRate={playbackRate}
                canControlPlayback={canControlPlayback}
                onTogglePlayback={handleTogglePlayback}
                onChangePlaybackRate={setPlaybackRate}
                messages={messages.playback}
              />
            </div>

            <PlaylistPanel
              playlist={playlist}
              currentId={currentId}
              onSelect={handleSelectVideo}
              messages={messages.playlist}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
