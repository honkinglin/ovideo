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

export function useVideoPlaylist() {
  const [playlist, setPlaylist] = useState<VideoItem[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const objectUrlsRef = useRef(new Map<string, string>())

  const currentItem = useMemo(
    () => playlist.find((item) => item.id === currentId) ?? null,
    [playlist, currentId],
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

  const selectVideo = useCallback((id: string) => {
    setCurrentId(id)
  }, [])

  const clearPlaylist = useCallback(() => {
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    objectUrlsRef.current.clear()
    setPlaylist([])
    setCurrentId(null)
  }, [])

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
