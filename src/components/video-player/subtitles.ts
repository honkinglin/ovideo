const TIMESTAMP = /^(?:(\d{2,}):)?(\d{2}):(\d{2})[.,](\d{3})$/

function seconds(value: string): number {
  const match = TIMESTAMP.exec(value)
  if (!match || Number(match[2]) > 59 || Number(match[3]) > 59) return NaN
  return Number(match[1] ?? 0) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000
}

// Keep cue text as WebVTT text; it is never inserted into the page as HTML.
export function toWebVtt(input: string, filename: string): string {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim()
  const isVtt = /\.vtt$/i.test(filename)
  if (!isVtt && !/\.srt$/i.test(filename)) throw new Error("format")
  if (isVtt && !/^WEBVTT(?:[ \t].*)?(?:\n|$)/.test(text)) throw new Error("format")
  const blocks = (isVtt ? text.replace(/^WEBVTT[^\n]*(?:\n|$)/, "").trim() : text).split(/\n[ \t]*\n/)
  let cues = 0
  const normalized = blocks.map((block) => {
    if (isVtt && /^(NOTE|STYLE|REGION)(?:\s|$)/.test(block)) return block
    const lines = block.split("\n")
    const index = lines.findIndex((line) => line.includes("-->"))
    if (index < 0 || index > 1 || !lines.slice(index + 1).some((line) => line.trim())) throw new Error("format")
    const timing = /^(\S+)\s+-->\s+(\S+)(.*)$/.exec(lines[index])
    if (!timing || !Number.isFinite(seconds(timing[1])) || !Number.isFinite(seconds(timing[2])) || seconds(timing[2]) <= seconds(timing[1])) throw new Error("format")
    lines[index] = `${timing[1].replace(",", ".")} --> ${timing[2].replace(",", ".")}${isVtt ? timing[3] : ""}`
    cues++
    return lines.join("\n")
  })
  if (!cues) throw new Error("format")
  return `WEBVTT\n\n${normalized.join("\n\n")}\n`
}

export function formatPosition(time: number | null) {
  if (time === null || !Number.isFinite(time)) return "--:--"
  const total = Math.floor(time)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor(total % 3600 / 60)
  const seconds = total % 60
  return `${hours ? `${hours}:` : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
