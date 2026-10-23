import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { comparePlaylistItems, getFileLabel, getNameFromUrl } from "../utils"
import { fileIdentity, isVideoFile } from "../import-files"
import { readStorage, writeStorage } from "../storage"
import type { VideoItem } from "../types"

export type AddFilesOptions = { sortMode?: "alphabetical" }
const STORAGE_KEY = "ovideo.playlist.v1"
function restorePlaylist(): VideoItem[] {
  const stored = readStorage<unknown>(STORAGE_KEY, [])
  if (!Array.isArray(stored)) return []
  return stored.filter((url): url is string => {
    if (typeof url !== "string") return false
    try { return ["http:", "https:"].includes(new URL(url).protocol) } catch { return false }
  }).map((src) => ({ id: crypto.randomUUID(), name: getNameFromUrl(src), source: "remote", src }))
}

export function useVideoPlaylist() {
  const [playlist, setPlaylist] = useState<VideoItem[]>(restorePlaylist)
  const [removed, setRemoved] = useState<{ item: VideoItem; index: number } | null>(null)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const objectUrlsRef = useRef(new Map<string, string>())
  const currentItem = useMemo(() => playlist.find((item) => item.id === currentId) ?? null, [playlist, currentId])
  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear() }
  }, [])
  useEffect(() => {
    writeStorage(STORAGE_KEY, playlist.filter((item) => item.source === "remote").map((item) => item.src))
    // Release removed items only after React has detached the old video element.
    const ids = new Set(playlist.map((item) => item.id))
    objectUrlsRef.current.forEach((url, id) => {
      if (!ids.has(id)) { URL.revokeObjectURL(url); objectUrlsRef.current.delete(id) }
    })
  }, [playlist])
  const resolveItemSource = useCallback((item: VideoItem) => {
    if (item.source === "remote") return item.src
    const existing = objectUrlsRef.current.get(item.id)
    if (existing) return existing
    if (!item.file) return undefined
    const url = URL.createObjectURL(item.file)
    objectUrlsRef.current.set(item.id, url)
    return url
  }, [])
  const addLocalFiles = useCallback((files: FileList | File[], options?: AddFilesOptions) => {
    const seen = new Set(playlist.map((item) => item.identity))
    let skipped = 0
    const added: VideoItem[] = []
    for (const file of Array.from(files)) {
      const identity = fileIdentity(file)
      if (!isVideoFile(file) || seen.has(identity)) { skipped++; continue }
      seen.add(identity)
      added.push({ id: crypto.randomUUID(), name: file.name, source: "local", relativePath: getFileLabel(file), file, identity })
    }
    if (options?.sortMode === "alphabetical") added.sort(comparePlaylistItems)
    setPlaylist((prev) => [...prev, ...added])
    setCurrentId((id) => id ?? added[0]?.id ?? null)
    return { added, skipped }
  }, [playlist])
  const addRemoteSource = useCallback((src: string) => {
    const existing = playlist.find((item) => item.src === src)
    if (existing) return existing
    const item: VideoItem = { id: crypto.randomUUID(), name: getNameFromUrl(src), src, source: "remote" }
    setPlaylist((prev) => [...prev, item])
    return item
  }, [playlist])
  const removeVideo = useCallback((id: string) => {
    const index = playlist.findIndex((item) => item.id === id)
    if (index < 0) return
    setRemoved({ item: playlist[index], index })
    setPlaylist((prev) => prev.filter((item) => item.id !== id))
    setCurrentId((current) => current === id ? (playlist[index + 1] ?? playlist[index - 1])?.id ?? null : current)
  }, [playlist])
  const undoRemove = useCallback(() => {
    if (!removed) return
    const existing = playlist.find((item) => item.id === removed.item.id || (removed.item.identity && item.identity === removed.item.identity) || (removed.item.src && item.src === removed.item.src))
    setPlaylist((prev) => {
      if (existing) return prev
      const next = [...prev]
      next.splice(Math.min(removed.index, next.length), 0, removed.item)
      return next
    })
    setCurrentId((id) => id ?? existing?.id ?? removed.item.id)
    setRemoved(null)
  }, [removed, playlist])
  const sortPlaylist = useCallback((direction: "asc" | "desc") => {
    setPlaylist((prev) => [...prev].sort((a, b) => (direction === "asc" ? 1 : -1) * comparePlaylistItems(a, b)))
  }, [])
  const reorderVideo = useCallback((id: string, direction: -1 | 1) => {
    setPlaylist((prev) => {
      const index = prev.findIndex((item) => item.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])
  const clearPlaylist = useCallback(() => { setPlaylist([]); setCurrentId(null); setRemoved(null) }, [])
  const move = useCallback((direction: number, wrap = false) => {
    const index = playlist.findIndex((item) => item.id === currentId)
    if (index < 0 || !playlist.length) return
    const next = wrap ? playlist[(index + direction + playlist.length) % playlist.length] : playlist[index + direction]
    if (next) setCurrentId(next.id)
  }, [currentId, playlist])
  return {
    playlist, currentId, currentItem, hasPlaylist: playlist.length > 0,
    removedName: removed?.item.name ?? null, undoRemove, sortPlaylist, reorderVideo,
    addLocalFiles, addRemoteSource, selectVideo: setCurrentId, clearPlaylist, removeVideo,
    playNext: () => move(1), playPrevious: () => move(-1), move, resolveItemSource,
  }
}
