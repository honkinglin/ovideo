export type VideoSource = "local" | "remote"

export type VideoItem = {
  id: string
  name: string
  source: VideoSource
  relativePath?: string
  src?: string
  file?: File
}

export type MpegtsMediaDataSource = {
  type: string
  isLive?: boolean
  url: string
}

export type MpegtsPlayer = {
  attachMediaElement(mediaElement: HTMLMediaElement): void
  detachMediaElement(): void
  destroy(): void
  load(): void
  play(): void | Promise<void>
  on?(event: string, handler: (...args: unknown[]) => void): void
}

export type MpegtsModule = {
  createPlayer(
    mediaDataSource: MpegtsMediaDataSource,
    config?: {
      enableWorker?: boolean
      lazyLoadMaxDuration?: number
      deferLoadAfterSourceOpen?: boolean
    },
  ): MpegtsPlayer
  isSupported(): boolean
  Events?: {
    ERROR?: string
  }
}
