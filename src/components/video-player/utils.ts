import type { VideoItem } from "./types"

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

const TRANSPORT_STREAM_REGEX = /\.(ts|m2ts|mts)$/i

export function isTransportStreamSource(item: VideoItem | null) {
  if (!item) return false
  if (item.name && TRANSPORT_STREAM_REGEX.test(item.name)) {
    return true
  }
  if (item.relativePath && TRANSPORT_STREAM_REGEX.test(item.relativePath)) {
    return true
  }
  const src = item.src ?? ""
  if (/^https?:\/\//i.test(src)) {
    const pathname = src.split(/[?#]/)[0]
    const segments = pathname.split("/")
    const lastSegment = segments[segments.length - 1] ?? ""
    return TRANSPORT_STREAM_REGEX.test(lastSegment)
  }
  return TRANSPORT_STREAM_REGEX.test(src)
}

export function isTransportStreamFile(file: File) {
  const name = file.name ?? ""
  const relativePath = (file as File & { webkitRelativePath?: string })
    .webkitRelativePath ?? ""
  return (
    TRANSPORT_STREAM_REGEX.test(name) ||
    (relativePath ? TRANSPORT_STREAM_REGEX.test(relativePath) : false)
  )
}

export function getFileLabel(file: File): string {
  const relativePath = (file as File & { webkitRelativePath?: string })
    .webkitRelativePath
  if (relativePath) {
    return relativePath
  }
  return file.name
}

export function getNameFromUrl(input: string) {
  const trimmed = input.trim()
  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed || input
  }
  const urlWithoutQuery = trimmed.split(/[?#]/)[0]
  const segments = urlWithoutQuery.split("/").filter(Boolean)
  if (segments.length) {
    return segments[segments.length - 1]
  }
  const host = trimmed.replace(/^https?:\/\//i, "")
  return host.split("/")[0] ?? trimmed
}
