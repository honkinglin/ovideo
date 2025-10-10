import { useCallback, useEffect, useState } from "react"

type UseClearDialogOptions = {
  hasPlaylist: boolean
  onConfirm: () => void
}

// Provides open/close helpers for the inline clear-playlist confirmation panel.
export function useClearDialog({ hasPlaylist, onConfirm }: UseClearDialogOptions) {
  // State to track whether the clear dialog is open
  const [isOpen, setIsOpen] = useState(false)

  // Close dialog automatically if playlist becomes empty
  useEffect(() => {
    if (!hasPlaylist) {
      setIsOpen(false)
    }
  }, [hasPlaylist])

  // Handle dialog open/close state changes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open && !hasPlaylist) {
        setIsOpen(false)
        return
      }
      setIsOpen(open)
    },
    [hasPlaylist],
  )

  // Confirm clear action and close dialog
  const handleConfirm = useCallback(() => {
    onConfirm()
    setIsOpen(false)
  }, [onConfirm])

  // Cancel and close dialog
  const handleCancel = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  }
}
