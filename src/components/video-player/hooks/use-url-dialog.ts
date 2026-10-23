import { useCallback, useState } from "react"

type UseUrlDialogOptions = {
  onSubmit: (normalizedUrl: string) => boolean
  errors: {
    empty: string
    protocol: string
    invalid: string
  }
}

// Handles URL input validation before delegating to the playlist append logic.
export function useUrlDialog({ onSubmit, errors }: UseUrlDialogOptions) {
  // State for dialog open, input value, and error
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Handle dialog open/close
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setError(null)
    }
  }, [])

  // Handle input value change
  const handleValueChange = useCallback((next: string) => {
    setValue(next)
    setError(null)
  }, [])

  // Cancel and close dialog
  const handleCancel = useCallback(() => {
    setIsOpen(false)
    setError(null)
  }, [])

  // Validate and submit URL
  const handleConfirm = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError(errors.empty)
      return
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError(errors.protocol)
      return
    }
    if (/\s/.test(trimmed)) {
      setError(errors.invalid)
      return
    }

    let normalized: string
    try {
      const url = new URL(trimmed)
      if (!url.hostname || url.username || url.password) throw new Error("Invalid URL")
      normalized = url.href
    } catch {
      setError(errors.invalid)
      return
    }
    const submitted = onSubmit(normalized)
    if (!submitted) {
      return
    }

    setIsOpen(false)
    setValue("")
    setError(null)
  }, [errors.empty, errors.invalid, errors.protocol, onSubmit, value])

  return {
    isOpen,
    value,
    error,
    onOpenChange: handleOpenChange,
    onValueChange: handleValueChange,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  }
}
