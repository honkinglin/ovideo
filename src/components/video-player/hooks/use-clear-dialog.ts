import { useCallback, useEffect, useState } from "react"

type UseClearDialogOptions = {
  hasPlaylist: boolean
  onConfirm: () => void
}

// Provides open/close helpers for the inline clear-playlist confirmation panel.
export function useClearDialog({ hasPlaylist, onConfirm }: UseClearDialogOptions) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!hasPlaylist) {
      setIsOpen(false)
    }
  }, [hasPlaylist])

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

  const handleConfirm = useCallback(() => {
    onConfirm()
    setIsOpen(false)
  }, [onConfirm])

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
