import { type ChangeEventHandler, useCallback, useRef } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Logo } from "./logo"

export function VideoPlayer() {
  // Ref for the main video element
  const videoRef = useRef<HTMLVideoElement>(null)
  // Ref for file input (local files)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // Ref for folder input (local folders)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  // Get language, theme, and related toggles/messages from preferences
  const { language, toggleLanguage, toggleTheme, theme, messages } = usePreferences()

  // Label for theme toggle button
  const themeToggleLabel = theme === "dark"
    ? messages.preferences.themeToggle.toLight
    : messages.preferences.themeToggle.toDark

  // Label for language toggle button
  const languageToggleLabel = language === "zh"
    ? messages.preferences.languageToggle.toEn
    : messages.preferences.languageToggle.toZh

  // Playlist management and video selection logic
  const {
    playlist,         // List of video items
    currentId,        // Current playing video ID
    currentItem,      // Current playing video item
    hasPlaylist,      // Whether playlist has items
    addLocalFiles,    // Add local files to playlist
    addRemoteSource,  // Add remote video source
    selectVideo,      // Select video by ID
    clearPlaylist,    // Clear all videos from playlist
    playNext,         // Play next video in playlist
    resolveItemSource // Resolve video source URL
  } = useVideoPlaylist()

  // Playback control logic for the video element
  const {
    playbackRate,         // Current playback rate
    setPlaybackRate,      // Change playback rate
    isPlaying,            // Is video playing
    tsUnsupported,        // Is .ts format unsupported
    canControlPlayback,   // Can control playback
    handleTogglePlayback, // Toggle play/pause
    handleVideoPlay,      // Handle play event
    handleVideoPause,     // Handle pause event
    stopPlayback          // Stop playback
  } = useVideoPlayback({
    videoRef,
    currentItem,
    resolveItemSource,
  })

  // Add files to playlist and stop current playback
  const addFilesAndStop = useCallback(
    (files: FileList | File[], options?: AddFilesOptions) => {
      const added = addLocalFiles(files, options)
      if (added.length) {
        stopPlayback()
      }
    },
    [addLocalFiles, stopPlayback],
  )

  // Dialog logic for adding remote video URLs
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

  // Dialog logic for clearing the playlist
  const clearDialog = useClearDialog({
    hasPlaylist,
    onConfirm: () => {
      clearPlaylist()
      stopPlayback()
    },
  })

  // Drag and drop logic for adding files
  const { isDragActive, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop({
    onFiles: (files) => addFilesAndStop(files),
  })

  // Handle file input change (local files)
  const handleFileChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (!event.target.files?.length) return
      addFilesAndStop(event.target.files)
      event.target.value = ""
    },
    [addFilesAndStop],
  )

  // Handle folder input change (local folders)
  const handleFolderChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (!event.target.files?.length) return
      addFilesAndStop(event.target.files, { sortMode: "alphabetical" })
      event.target.value = ""
    },
    [addFilesAndStop],
  )

  // Select a video from the playlist and stop current playback
  const handleSelectVideo = useCallback(
    (id: string) => {
      selectVideo(id)
      stopPlayback()
    },
    [selectVideo, stopPlayback],
  )

  // When video ends, play next video and stop playback
  const handleVideoEnded = useCallback(() => {
    playNext()
    stopPlayback()
  }, [playNext, stopPlayback])

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo className="border-none bg-transparent px-0 py-0 shadow-none" />
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">{messages.app.title}</h1>
            <p className="text-sm text-muted-foreground">{messages.app.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleLanguage}
            aria-label={languageToggleLabel}
            title={languageToggleLabel}
          >
            <span className="relative flex h-full w-full items-center justify-center">
              <Languages className="h-4 w-4" />
              <span className="absolute -bottom-1 right-1 rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                {language === "zh" ? "中" : "EN"}
              </span>
              <span className="sr-only">{languageToggleLabel}</span>
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={themeToggleLabel}
            title={themeToggleLabel}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <a
            href="https://github.com/honkinglin/ovideo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="inline-flex"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.37-1.342-3.37-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.34-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.19 22 16.436 22 12.012 22 6.484 17.523 2 12 2Z" fill="currentColor"/>
              </svg>
            </Button>
          </a>
        </div>
      </header>

      <Card className="flex flex-1 flex-col shadow-[0_8px_32px_0_rgba(99,102,241,0.18)] z-10">
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
