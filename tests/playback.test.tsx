import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { useVideoPlayback } from "../src/components/video-player/hooks/use-video-playback"
import { useVideoPlaylist } from "../src/components/video-player/hooks/use-video-playlist"
import { useUrlDialog } from "../src/components/video-player/hooks/use-url-dialog"

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {})
  URL.createObjectURL = vi.fn(() => "blob:test")
  URL.revokeObjectURL = vi.fn()
})
afterEach(cleanup)
it("restores progress and persists native volume/rate changes", async () => {
  const video = document.createElement("video")
  Object.defineProperty(video, "duration", { value: 120 })
  localStorage.setItem("ovideo.history.v1", JSON.stringify({ "https://example.com/a.mp4": 42 }))
  const ref = { current: video }
  const item = { id: "a", name: "a.mp4", source: "remote" as const, src: "https://example.com/a.mp4" }
  const resolve = () => item.src
  const { result, unmount } = renderHook(() => useVideoPlayback({ videoRef: ref, currentItem: item, resolveItemSource: resolve }))
  act(() => { video.dispatchEvent(new Event("loadedmetadata")) })
  expect(video.currentTime).toBe(42)
  act(() => { video.playbackRate = 1.5; video.volume = 0.4; video.dispatchEvent(new Event("ratechange")) })
  await waitFor(() => expect(result.current.playbackRate).toBe(1.5))
  expect(JSON.parse(localStorage.getItem("ovideo.playback.v1")!).volume).toBe(0.4)
  unmount()
  expect(video.hasAttribute("src")).toBe(false)
})
it("classifies native network errors and clears the error on retry", async () => {
  const video = document.createElement("video")
  const item = { id: "a", name: "a.mp4", source: "remote" as const, src: "https://example.com/a.mp4" }
  const ref = { current: video }
  const resolve = () => item.src
  const { result } = renderHook(() => useVideoPlayback({ videoRef: ref, currentItem: item, resolveItemSource: resolve }))
  Object.defineProperty(video, "error", { value: { code: 2 } })
  act(() => { video.dispatchEvent(new Event("error")) })
  expect(result.current.error).toBe("network")
  expect(result.current.canControlPlayback).toBe(false)
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.error).toBe(null))
})
it("deduplicates files and selects a neighbor when the current item is removed", () => {
  const { result } = renderHook(useVideoPlaylist)
  const file = new File(["a"], "a.mp4", { lastModified: 1 })
  act(() => { result.current.addLocalFiles([file, file, new File(["b"], "b.mp4")]) })
  expect(result.current.playlist).toHaveLength(2)
  const first = result.current.currentId!
  act(() => { result.current.resolveItemSource(result.current.currentItem!); result.current.removeVideo(first) })
  expect(result.current.currentItem?.name).toBe("b.mp4")
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test")
})
it("rejects malformed URLs and normalizes valid direct URLs", () => {
  const submit = vi.fn(() => true)
  const { result } = renderHook(() => useUrlDialog({ onSubmit: submit, errors: { empty: "empty", protocol: "protocol", invalid: "invalid" } }))
  act(() => result.current.onValueChange("https://[broken/video.mp4"))
  act(() => result.current.onConfirm())
  expect(result.current.error).toBe("invalid")
  expect(submit).not.toHaveBeenCalled()
  act(() => result.current.onValueChange("HTTPS://EXAMPLE.COM/video.mp4"))
  act(() => result.current.onConfirm())
  expect(submit).toHaveBeenCalledWith("https://example.com/video.mp4")
})
