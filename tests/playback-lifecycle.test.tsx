import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import type { VideoItem } from "../src/components/video-player/types"
import { useVideoPlayback } from "../src/components/video-player/hooks/use-video-playback"

const engine = vi.hoisted(() => {
  let release!: () => void
  const ready = new Promise<void>((resolve) => { release = resolve })
  return { ready, release, createPlayer: vi.fn() }
})
vi.mock("mpegts.js", async () => {
  await engine.ready
  return { default: { isSupported: () => true, createPlayer: engine.createPlayer } }
})
afterEach(cleanup)
it("does not attach a stale TS engine after switching to a native video", async () => {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {})
  const video = document.createElement("video")
  const ref = { current: video }
  const resolve = (item: VideoItem) => item.src
  const first: VideoItem = { id: "ts", name: "first.ts", source: "remote", src: "https://example.com/first.ts" }
  const second: VideoItem = { id: "mp4", name: "second.mp4", source: "remote", src: "https://example.com/second.mp4" }
  const { rerender } = renderHook(({ item }) => useVideoPlayback({ videoRef: ref, currentItem: item, resolveItemSource: resolve }), { initialProps: { item: first } })
  rerender({ item: second })
  await act(async () => { engine.release(); await engine.ready })
  await waitFor(() => expect(video.src).toBe(second.src))
  expect(engine.createPlayer).not.toHaveBeenCalled()
})
