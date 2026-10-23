import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { useVideoPlaylist } from "../src/components/video-player/hooks/use-video-playlist"
import { clearHistory, readHistory, savePosition } from "../src/components/video-player/history"
import { useVideoPlayback } from "../src/components/video-player/hooks/use-video-playback"
import { usePlaybackHistory } from "../src/components/video-player/hooks/use-playback-history"

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {})
})
afterEach(cleanup)
it("naturally sorts and reorders without replacing the currently playing item", () => {
  const { result } = renderHook(useVideoPlaylist)
  act(() => { result.current.addLocalFiles(["10.mp4", "2.mp4", "1.mp4"].map((name) => new File([], name))) })
  const current = result.current.currentItem
  act(() => result.current.sortPlaylist("asc"))
  expect(result.current.playlist.map((item) => item.name)).toEqual(["1.mp4", "2.mp4", "10.mp4"])
  expect(result.current.currentItem).toBe(current)
  act(() => result.current.reorderVideo(current!.id, -1))
  expect(result.current.playlist.map((item) => item.name)).toEqual(["1.mp4", "10.mp4", "2.mp4"])
  expect(result.current.currentItem).toBe(current)
})
it("undo restores the original position without interrupting the selected neighbor", () => {
  const { result } = renderHook(useVideoPlaylist)
  act(() => { result.current.addLocalFiles(["1.mp4", "2.mp4"].map((name) => new File([], name))) })
  const removed = result.current.currentItem!
  act(() => result.current.removeVideo(removed.id))
  const neighbor = result.current.currentItem
  act(() => result.current.undoRemove())
  expect(result.current.playlist[0]).toBe(removed)
  expect(result.current.currentItem).toBe(neighbor)
  expect(result.current.removedName).toBe(null)
})
it("undo after reimporting a removed file does not duplicate it", () => {
  const { result } = renderHook(useVideoPlaylist)
  const file = new File([], "1.mp4", { lastModified: 1 })
  act(() => { result.current.addLocalFiles([file]) })
  act(() => result.current.removeVideo(result.current.currentId!))
  act(() => { result.current.addLocalFiles([file]) })
  act(() => result.current.undoRemove())
  expect(result.current.playlist).toHaveLength(1)
  expect(result.current.currentItem).not.toBe(null)
})
it("persists remote playlist order and invalidates undo when clearing", () => {
  const { result, unmount } = renderHook(useVideoPlaylist)
  act(() => { result.current.addRemoteSource("https://example.com/10.mp4") })
  act(() => { result.current.addRemoteSource("https://example.com/2.mp4") })
  act(() => result.current.sortPlaylist("asc"))
  unmount()
  const restored = renderHook(useVideoPlaylist)
  expect(restored.result.current.playlist.map((item) => item.name)).toEqual(["2.mp4", "10.mp4"])
  act(() => restored.result.current.removeVideo(restored.result.current.playlist[0].id))
  act(() => restored.result.current.clearPlaylist())
  expect(restored.result.current.removedName).toBe(null)
})
it("clearing history stays cleared through paused-video cleanup, keeping preferences", () => {
  const video = document.createElement("video")
  Object.defineProperty(video, "duration", { value: 120 })
  const ref = { current: video }
  const item = { id: "a", name: "a.mp4", source: "remote" as const, src: "https://example.com/a.mp4" }
  const resolve = () => item.src
  const { unmount } = renderHook(() => useVideoPlayback({ videoRef: ref, currentItem: item, resolveItemSource: resolve }))
  act(() => { video.dispatchEvent(new Event("loadedmetadata")); video.currentTime = 30; video.dispatchEvent(new Event("pause")) })
  expect(readHistory()[item.src]).toBe(30)
  localStorage.setItem("ovideo.preferences.theme", "dark")
  act(() => { expect(clearHistory()).toBe(true) })
  act(() => { video.dispatchEvent(new Event("pause")); window.dispatchEvent(new Event("pagehide")) })
  unmount()
  expect(readHistory()).toEqual({})
  expect(localStorage.getItem("ovideo.preferences.theme")).toBe("dark")
})
it("notifies history subscribers and bounds retained records", () => {
  const { result } = renderHook(usePlaybackHistory)
  act(() => { for (let i = 0; i < 205; i++) savePosition(`video${i}`, i) })
  expect(Object.keys(result.current)).toHaveLength(200)
  expect(result.current.video0).toBeUndefined()
  expect(result.current.video204).toBe(204)
  act(() => { clearHistory() })
  expect(result.current).toEqual({})
})
