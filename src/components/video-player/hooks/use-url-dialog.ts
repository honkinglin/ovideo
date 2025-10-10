import { useCallback, useState } from "react"

type UseUrlDialogOptions = {
  onSubmit: (normalizedUrl: string) => boolean
}

export function useUrlDialog({ onSubmit }: UseUrlDialogOptions) {
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
      setError("请输入视频链接")
      return
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("仅支持 http 或 https 协议")
      return
    }
    if (/\s/.test(trimmed)) {
      setError("请输入有效的视频链接")
      return
    }

    const hostSegment = trimmed.slice(trimmed.indexOf("//") + 2).split(/[/?#]/)[0]
    if (!hostSegment) {
      setError("请输入有效的视频链接")
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
  }, [onSubmit, value])

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
