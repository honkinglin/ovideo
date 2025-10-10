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

export function comparePlaylistItems(a: VideoItem, b: VideoItem) {
  const locale = "zh-Hans-CN"
  const fallbackA = (a.relativePath ?? a.name ?? "").trim()
  const fallbackB = (b.relativePath ?? b.name ?? "").trim()
  const segmentsA = splitPathSegments(fallbackA)
  const segmentsB = splitPathSegments(fallbackB)

  const max = Math.max(segmentsA.length, segmentsB.length)
  for (let index = 0; index < max; index += 1) {
    const segmentA = segmentsA[index]
    const segmentB = segmentsB[index]

    if (segmentA === undefined) return -1
    if (segmentB === undefined) return 1

    const diff = compareSegment(segmentA, segmentB, locale)
    if (diff !== 0) {
      return diff
    }
  }

  return fallbackA.localeCompare(fallbackB, locale) || fallbackA.localeCompare(fallbackB)
}

function splitPathSegments(input: string) {
  if (!input) return [""]
  return input.split("/").filter(Boolean)
}

function compareSegment(a: string, b: string, locale: string) {
  const tokenA = tokenizeSegment(a)
  const tokenB = tokenizeSegment(b)

  const max = Math.max(tokenA.length, tokenB.length)
  for (let index = 0; index < max; index += 1) {
    const partA = tokenA[index]
    const partB = tokenB[index]

    if (partA === undefined) return -1
    if (partB === undefined) return 1

    if (partA.type === "number" && partB.type === "number") {
      const numDiff = partA.value - partB.value
      if (numDiff !== 0) {
        return numDiff
      }
    } else if (partA.type === "number") {
      return -1
    } else if (partB.type === "number") {
      return 1
    } else {
      const textDiff =
        partA.value.localeCompare(partB.value, locale) ||
        partA.value.localeCompare(partB.value)
      if (textDiff !== 0) {
        return textDiff
      }
    }
  }

  return 0
}

type SegmentToken =
  | { type: "number"; value: number }
  | { type: "text"; value: string }

function tokenizeSegment(segment: string) {
  const tokens: SegmentToken[] = []
  const regex = /(\d+)|(\D+)/g
  let match: RegExpExecArray | null = null
  while ((match = regex.exec(segment))) {
    if (match[1] !== undefined) {
      tokens.push({ type: "number", value: Number.parseInt(match[1], 10) })
    } else if (match[2] !== undefined) {
      tokens.push({ type: "text", value: match[2] })
    }
  }
  if (!tokens.length) {
    tokens.push({ type: "text", value: segment })
  }
  return tokens
}
