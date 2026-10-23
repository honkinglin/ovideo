export type ImportResult = { files: File[]; failed: number }

// Read every batch; Chromium returns at most 100 entries per call.
export async function readEntry(entry: FileSystemEntry, parent = ""): Promise<ImportResult> {
  const path = parent ? `${parent}/${entry.name}` : entry.name
  try {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) =>
        (entry as FileSystemFileEntry).file(resolve, reject),
      )
      Object.defineProperty(file, "webkitRelativePath", { value: path, configurable: true })
      return { files: [file], failed: 0 }
    }
    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader()
      const result: ImportResult = { files: [], failed: 0 }
      while (true) {
        const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject))
        if (!batch.length) break
        for (const child of batch) {
          const next = await readEntry(child, path)
          result.files.push(...next.files)
          result.failed += next.failed
        }
      }
      return result
    }
  } catch {
    return { files: [], failed: 1 }
  }
  return { files: [], failed: 0 }
}

export function isVideoFile(file: File) {
  return file.type.startsWith("video/") || /\.(mp4|m4v|webm|ogv|mov|mkv|avi|ts|mts|m2ts)$/i.test(file.name)
}

export function fileIdentity(file: File) {
  return JSON.stringify([file.webkitRelativePath || file.name, file.size, file.lastModified])
}
