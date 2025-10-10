import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { isTransportStreamSource } from "../utils"
import type { MpegtsModule, VideoItem } from "../types"
import rawMpegtsModule from "mpegts.js"

const mpegts = (
  (rawMpegtsModule as { default?: unknown }).default ?? rawMpegtsModule
) as MpegtsModule

type UseVideoPlaybackParams = {
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
  currentItem: VideoItem | null
  resolveItemSource: (item: VideoItem) => string | undefined
}

export function useVideoPlayback({
  videoRef,
  currentItem,
  resolveItemSource,
}: UseVideoPlaybackParams) {
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tsUnsupported, setTsUnsupported] = useState(false)
  const playbackRateRef = useRef(playbackRate)
  const mpegtsPlayerRef = useRef<ReturnType<MpegtsModule["createPlayer"]> | null>(null)

  const detachPlayer = useCallback(() => {
    const player = mpegtsPlayerRef.current
    if (player) {
      player.detachMediaElement()
      player.destroy()
      mpegtsPlayerRef.current = null
    }
  }, [])

  useEffect(() => {
    playbackRateRef.current = playbackRate
    const video = videoRef.current
    if (video) {
      video.playbackRate = playbackRate
    }
  }, [playbackRate, videoRef])

  useEffect(() => {
    return () => {
      detachPlayer()
    }
  }, [detachPlayer])

  useEffect(() => {
    const videoEl = videoRef.current
    const item = currentItem
    let isActive = true

    const resetVideoElement = () => {
      if (!videoEl) return
      videoEl.pause()
      videoEl.removeAttribute("src")
      videoEl.load()
      videoEl.onloadedmetadata = null
    }

    if (!videoEl) {
      return
    }

    if (!item) {
      setTsUnsupported(false)
      setIsPlaying(false)
      detachPlayer()
      resetVideoElement()
      return
    }

    setIsPlaying(false)

    const isTsStream = isTransportStreamSource(item)

    if (isTsStream) {
      detachPlayer()
      resetVideoElement()

      const sourceUrl = resolveItemSource(item)
      if (!sourceUrl) {
        setTsUnsupported(true)
        return () => {
          isActive = false
        }
      }

      if (!mpegts.isSupported()) {
        setTsUnsupported(true)
        return () => {
          isActive = false
        }
      }

      setTsUnsupported(false)

      const player = mpegts.createPlayer(
        {
          type: "mpegts",
          isLive: false,
          url: sourceUrl,
        },
        {
          enableWorker: true,
          lazyLoadMaxDuration: 3 * 60,
          deferLoadAfterSourceOpen: true,
        },
      )
      mpegtsPlayerRef.current = player

      const errorEvent = mpegts.Events?.ERROR ?? "error"
      const handlePlayerError = () => {
        if (!isActive) return
        detachPlayer()
        setTsUnsupported(true)
        setIsPlaying(false)
      }
      player.on?.(errorEvent, handlePlayerError)

      player.attachMediaElement(videoEl)
      player.load()
      videoEl.playbackRate = playbackRateRef.current
      const playbackAttempt = player.play()
      if (playbackAttempt instanceof Promise) {
        playbackAttempt.catch(() => {
          /* autoplay may fail; user must click play */
        })
      }

      return () => {
        isActive = false
        detachPlayer()
      }
    }

    setTsUnsupported(false)
    detachPlayer()

    const sourceUrl = resolveItemSource(item)

    if (!sourceUrl) {
      resetVideoElement()
      return () => {
        isActive = false
      }
    }

    const handleLoadedMetadata = () => {
      videoEl.playbackRate = playbackRateRef.current
      const playbackAttempt = videoEl.play()
      if (playbackAttempt instanceof Promise) {
        playbackAttempt.catch(() => {
          /* autoplay may fail; user must click play */
        })
      }
    }

    videoEl.pause()
    if (videoEl.src !== sourceUrl) {
      videoEl.src = sourceUrl
    }
    videoEl.load()
    videoEl.onloadedmetadata = handleLoadedMetadata

    return () => {
      isActive = false
      videoEl.onloadedmetadata = null
    }
  }, [currentItem, resolveItemSource, detachPlayer, videoRef])

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    const video = videoRef.current
    if (video) {
      video.pause()
    }
  }, [videoRef])

  const handleTogglePlayback = useCallback(() => {
    const video = videoRef.current
    if (!video || tsUnsupported) return
    if (video.paused || video.ended) {
      void video.play()
    } else {
      video.pause()
    }
  }, [tsUnsupported, videoRef])

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const canControlPlayback = useMemo(
    () => Boolean(currentItem && !tsUnsupported),
    [currentItem, tsUnsupported],
  )

  return {
    playbackRate,
    setPlaybackRate,
    isPlaying,
    tsUnsupported,
    canControlPlayback,
    handleTogglePlayback,
    handleVideoPlay,
    handleVideoPause,
    stopPlayback,
  }
}
