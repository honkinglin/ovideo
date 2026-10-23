import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { toWebVtt, formatPosition } from "../src/components/video-player/subtitles"
import { useSegmentLoop } from "../src/components/video-player/hooks/use-segment-loop"
import { usePlayerShortcuts } from "../src/components/video-player/hooks/use-player-shortcuts"

afterEach(cleanup)
it("converts SRT with BOM, CRLF, multiline text and comma timestamps", () => {
  expect(toWebVtt("\uFEFF1\r\n00:00:01,000 --> 00:00:03,500\r\n你好\r\nWorld\r\n", "captions.srt")).toBe("WEBVTT\n\n1\n00:00:01.000 --> 00:00:03.500\n你好\nWorld\n")
})
it("preserves valid WebVTT cue identifiers and positioning", () => {
  const vtt = "WEBVTT\n\nintro\n00:01.000 --> 00:03.000 align:start\nHello\n"
  expect(toWebVtt(vtt, "captions.vtt")).toBe(vtt)
})
it.each([
  ["WEBVTT\n\n00:02.000 --> 00:01.000\nBackwards", "x.vtt"],
  ["1\n00:99:00,000 --> 01:00:00,000\nBad minutes", "x.srt"],
  ["WEBVTT", "x.vtt"],
  ["hello", "x.srt"],
  ["1\n00:00:01,000 --> 00:00:03,000\nHello", "x.txt"],
])("rejects invalid subtitle timings or formats", (text, name) => {
  expect(() => toWebVtt(text, name)).toThrow("format")
})
it("formats hour-long videos", () => {
  expect(formatPosition(null)).toBe("--:--")
  expect(formatPosition(3661)).toBe("1:01:01")
})
it("enforces valid A-B segments, can suspend looping, and clears on source change", () => {
  const video = document.createElement("video")
  Object.defineProperties(video, { duration: { value: 12 }, readyState: { value: 4 } })
  const ref = { current: video }
  const { result, rerender } = renderHook(({ id }) => useSegmentLoop(ref, id), { initialProps: { id: "first" } })
  video.currentTime = 3
  act(() => result.current.markA())
  video.currentTime = 3.2
  act(() => { expect(result.current.markB()).toBe(false) })
  expect(result.current.enabled).toBe(false)
  video.currentTime = 5
  act(() => { expect(result.current.markB()).toBe(true) })
  expect(video.currentTime).toBe(3)
  video.currentTime = 6
  act(() => { video.dispatchEvent(new Event("timeupdate")) })
  expect(video.currentTime).toBe(3)
  act(() => result.current.toggle())
  video.currentTime = 6
  act(() => { video.dispatchEvent(new Event("timeupdate")) })
  expect(video.currentTime).toBe(6)
  rerender({ id: "second" })
  expect(result.current.a).toBe(null)
  expect(result.current.b).toBe(null)
})
it("ignores typing, composition and modifier keys while supporting playback and seek", () => {
  const video = document.createElement("video")
  Object.defineProperty(video, "duration", { value: 12 })
  video.currentTime = 10
  const togglePlayback = vi.fn()
  renderHook(() => usePlayerShortcuts({ videoRef: { current: video }, enabled: true, togglePlayback, markA: vi.fn(), markB: vi.fn(), clearLoop: vi.fn(), onFullscreenError: vi.fn() }))
  const input = document.createElement("input")
  document.body.appendChild(input)
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "k", bubbles: true }))
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", isComposing: true }))
  expect(togglePlayback).not.toHaveBeenCalled()
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }))
  expect(togglePlayback).toHaveBeenCalledOnce()
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))
  expect(video.currentTime).toBe(12)
  input.remove()
})
