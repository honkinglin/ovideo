import { useCallback, useState } from "react"
import type { DragEventHandler } from "react"

type UseDragAndDropOptions = {
  onFiles: (files: FileList | File[]) => void
}

// Exposes drag-and-drop helpers for piping dropped files into the playlist hook.
export function useDragAndDrop({ onFiles }: UseDragAndDropOptions) {
  // State to track if drag is active (for UI feedback)
  const [isDragActive, setIsDragActive] = useState(false)

  // Handle drag over event, show active state
  const handleDragOver = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setIsDragActive(true)
  }, [])

  // Handle drag leave event, reset active state
  const handleDragLeave = useCallback<DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()
      const nextTarget = event.relatedTarget as Node | null
      if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
        setIsDragActive(false)
      }
    },
    [],
  )

  // Handle drop event, pass files to callback
  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()
      setIsDragActive(false)
      const files = event.dataTransfer?.files
      if (files?.length) {
        onFiles(files)
      }
    },
    [onFiles],
  )

  return {
    isDragActive,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
