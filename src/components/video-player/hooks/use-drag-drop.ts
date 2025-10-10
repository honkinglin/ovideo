import { useCallback, useState } from "react"
import type { DragEventHandler } from "react"

type UseDragAndDropOptions = {
  onFiles: (files: FileList | File[]) => void
}

// Helper function to recursively get files from a directory entry
async function getFilesFromEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise<File[]>((resolve) => {
      (entry as FileSystemFileEntry).file((file) => resolve([file]))
    })
  } else if (entry.isDirectory) {
    const dirReader = (entry as FileSystemDirectoryEntry).createReader()
    const entries = await new Promise<FileSystemEntry[]>((resolve) => {
      dirReader.readEntries(resolve)
    })
    
    const allFiles: File[] = []
    for (const childEntry of entries) {
      const files = await getFilesFromEntry(childEntry)
      allFiles.push(...files)
    }
    return allFiles
  }
  return []
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
    async (event) => {
      event.preventDefault()
      setIsDragActive(false)
      
      // Check if we have DataTransferItemList for folder support
      if (event.dataTransfer?.items) {
        const allFiles: File[] = []
        
        // Process each dropped item
        for (const item of Array.from(event.dataTransfer.items)) {
          if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry()
            if (entry) {
              const files = await getFilesFromEntry(entry)
              allFiles.push(...files)
            }
          }
        }
        
        if (allFiles.length) {
          onFiles(allFiles)
        }
      } else {
        // Fallback to regular file handling
        const files = event.dataTransfer?.files
        if (files?.length) {
          onFiles(files)
        }
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
