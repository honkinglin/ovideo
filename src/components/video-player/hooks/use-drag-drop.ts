import { useCallback, useState } from "react"
import type { DragEventHandler } from "react"

type UseDragAndDropOptions = {
  onFiles: (files: FileList | File[]) => void
}

export function useDragAndDrop({ onFiles }: UseDragAndDropOptions) {
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDragOver = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setIsDragActive(true)
  }, [])

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
