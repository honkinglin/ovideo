import { useCallback, useRef, useState } from "react"
import type { DragEventHandler } from "react"
import { readEntry } from "../import-files"

type UseDragAndDropOptions = {
  onFiles: (files: File[], failed: number) => void
}

export function useDragAndDrop({ onFiles }: UseDragAndDropOptions) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const importing = useRef(false)
  const handleDragOver = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setIsDragActive(true)
  }, [])
  const handleDragLeave = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault()
    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) setIsDragActive(false)
  }, [])
  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(async (event) => {
    event.preventDefault()
    setIsDragActive(false)
    if (importing.current) return
    // Capture entries synchronously while the drag data store is still accessible.
    const items = Array.from(event.dataTransfer.items ?? []).filter((item) => item.kind === "file")
      .map((item) => ({ entry: item.webkitGetAsEntry?.(), file: item.getAsFile() }))
    const fallback = Array.from(event.dataTransfer.files)
    importing.current = true
    setIsImporting(true)
    try {
      const files: File[] = []
      let failed = 0
      for (const item of items) {
        if (item.entry) {
          const result = await readEntry(item.entry)
          files.push(...result.files)
          failed += result.failed
        } else if (item.file) files.push(item.file)
        else failed++
      }
      onFiles(items.length ? files : fallback, failed)
    } finally {
      importing.current = false
      setIsImporting(false)
    }
  }, [onFiles])
  return { isDragActive, isImporting, handleDragOver, handleDragLeave, handleDrop }
}
