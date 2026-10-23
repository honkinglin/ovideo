import { describe, expect, it } from "vitest"
import { readEntry, isVideoFile } from "../src/components/video-player/import-files"
import { comparePlaylistItems } from "../src/components/video-player/utils"
function fileEntry(name: string): FileSystemEntry {
  return { name, isFile: true, isDirectory: false, file: (resolve: (file: File) => void) => resolve(new File(["video"], name)) } as unknown as FileSystemEntry
}
function directory(name: string, batches: FileSystemEntry[][]): FileSystemEntry {
  return { name, isFile: false, isDirectory: true, createReader: () => ({ readEntries: (resolve: (entries: FileSystemEntry[]) => void) => resolve(batches.shift() ?? []) }) } as unknown as FileSystemEntry
}
describe("folder import", () => {
  it("reads beyond Chromium's first 100 entries and preserves paths", async () => {
    const first = Array.from({ length: 100 }, (_, i) => fileEntry(`${i}.mp4`))
    const result = await readEntry(directory("course", [first, [directory("part2", [[fileEntry("lesson101.mp4")]])]]))
    expect(result.files).toHaveLength(101)
    expect(result.files[100].webkitRelativePath).toBe("course/part2/lesson101.mp4")
    expect(result.failed).toBe(0)
  })
  it("continues past unreadable files and reports failure", async () => {
    const broken = { ...fileEntry("broken.mp4"), file: (_resolve: unknown, reject: (error: Error) => void) => reject(new Error("denied")) } as unknown as FileSystemEntry
    const result = await readEntry(directory("course", [[broken, fileEntry("ok.mp4")]]))
    expect(result.files).toHaveLength(1)
    expect(result.failed).toBe(1)
  })
  it("accepts video filenames without MIME type, rejects unrelated files", () => {
    expect(isVideoFile(new File([], "lesson.MP4"))).toBe(true)
    expect(isVideoFile(new File([], "notes.txt"))).toBe(false)
  })
  it("sorts episodes naturally within folders", () => {
    const names = ["part2/10.mp4", "part1/11.mp4", "part1/2.mp4"]
    const sorted = names.map((name) => ({ id: name, name, relativePath: name, source: "local" as const })).sort(comparePlaylistItems)
    expect(sorted.map((item) => item.name)).toEqual(["part1/2.mp4", "part1/11.mp4", "part2/10.mp4"])
  })
})
