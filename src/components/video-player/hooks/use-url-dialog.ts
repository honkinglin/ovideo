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
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setError(null)
    }
  }, [])

  const handleValueChange = useCallback((next: string) => {
    setValue(next)
    setError(null)
  }, [])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    setError(null)
  }, [])

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

    const hostSegment = trimmed.slice(trimmed.indexOf("//") + 2).split(/[/?#]/)[0]
    if (!hostSegment) {
      setError(errors.invalid)
      return
    }

    const normalized = trimmed
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
