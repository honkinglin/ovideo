import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  comparePlaylistItems,
  getFileLabel,
  getNameFromUrl,
  isTransportStreamFile,
} from "../utils"
import type { VideoItem } from "../types"

export type AddFilesOptions = {
  sortMode?: "alphabetical"
}

// Manages playlist state, including lazy object URL creation for local files.
export function useVideoPlaylist() {
  // State for playlist, current video, and object URLs
  const [playlist, setPlaylist] = useState<VideoItem[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const objectUrlsRef = useRef(new Map<string, string>())

  // Get current playing item
  const currentItem = useMemo(
    () => playlist.find((item) => item.id === currentId) ?? null,
    [playlist, currentId],
  )

  // Revoke any generated object URLs when the component unmounts.
  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      objectUrlsRef.current.clear()
    }
  }, [])

  // Auto-select the first entry whenever the playlist becomes non-empty.
  // Auto-select first video when playlist is not empty
  useEffect(() => {
    if (!playlist.length) {
      if (currentId !== null) {
        setCurrentId(null)
      }
      return
    }
    if (!currentId) {
      setCurrentId(playlist[0].id)
    }
  }, [playlist, currentId])

  // Locate or create a playable source for the provided playlist entry.
  // Get playable source URL for a playlist item
  const resolveItemSource = useCallback((item: VideoItem) => {
    if (item.source === "remote") {
      return item.src
    }
    const existing = objectUrlsRef.current.get(item.id)
    if (existing) {
      return existing
    }
    if (item.src) {
      objectUrlsRef.current.set(item.id, item.src)
      return item.src
    }
    if (!item.file) {
      return undefined
    }
    const objectUrl = URL.createObjectURL(item.file)
    objectUrlsRef.current.set(item.id, objectUrl)
    return objectUrl
  }, [])

  // Append local files to the playlist, optionally sorting folder imports by name.
  // Add local video files to playlist
  const addLocalFiles = useCallback(
    (files: FileList | File[], options?: AddFilesOptions) => {
      const videoFiles = Array.from(files).filter(
        (file) =>
          (file.type && file.type.startsWith("video/")) || isTransportStreamFile(file),
      )
      if (!videoFiles.length) {
        return []
      }

      const newItems: VideoItem[] = videoFiles.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        source: "local",
        relativePath: getFileLabel(file),
        file,
      }))

      const sortedItems =
        options?.sortMode === "alphabetical"
          ? [...newItems].sort(comparePlaylistItems)
          : newItems

      setPlaylist((prev) => [...prev, ...sortedItems])
      setCurrentId((prevId) => prevId ?? sortedItems[0]?.id ?? null)

      return sortedItems
    },
    [],
  )

  // Normalise a remote URL and append it to the playlist.
  // Add remote video URL to playlist
  const addRemoteSource = useCallback((normalizedUrl: string) => {
    const id = crypto.randomUUID()
    const item: VideoItem = {
      id,
      name: getNameFromUrl(normalizedUrl),
      src: normalizedUrl,
      source: "remote",
    }
    setPlaylist((prev) => [...prev, item])
    setCurrentId((prevId) => prevId ?? item.id)
    return item
  }, [])

  // Select a video by ID
  const selectVideo = useCallback((id: string) => {
    setCurrentId(id)
  }, [])

  // Remove every playlist entry and release any object URLs.
  // Clear all videos from playlist and release object URLs
  const clearPlaylist = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    objectUrlsRef.current.clear()
    setPlaylist([])
    setCurrentId(null)
  }, [])

  // Advance playback to the next playlist entry when available.
  // Advance to next video in playlist
  const playNext = useCallback(() => {
    setCurrentId((prevId) => {
      if (!prevId) return prevId
      const currentIndex = playlist.findIndex((item) => item.id === prevId)
      if (currentIndex === -1) return prevId
      const next = playlist[currentIndex + 1]
      return next ? next.id : prevId
    })
  }, [playlist])

  return {
    playlist,
    currentId,
    currentItem,
    hasPlaylist: playlist.length > 0,
    addLocalFiles,
    addRemoteSource,
    selectVideo,
    clearPlaylist,
    playNext,
    resolveItemSource,
  }
}
