import { useState } from "react"
import { useRegisterSW } from "virtual:pwa-register/react"
import { Button } from "@/components/ui/button"
import type { VideoPlayerMessages } from "./i18n"

export function UpdateNotice({ messages, onBeforeUpdate }: { messages: VideoPlayerMessages["feedback"]; onBeforeUpdate: () => void }) {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW()
  const [failed, setFailed] = useState(false)
  if (!needRefresh) return null
  return <div role="status" className="flex flex-wrap items-center gap-3 rounded border p-3 text-sm">
    <span>{failed ? messages.updateFailed : messages.updateReady}</span>
    <Button size="sm" onClick={async () => {
      onBeforeUpdate()
      window.dispatchEvent(new Event("pagehide"))
      try { await updateServiceWorker(true) } catch { setFailed(true) }
    }}>{messages.update}</Button>
    <Button size="sm" variant="outline" onClick={() => setNeedRefresh(false)}>{messages.later}</Button>
  </div>
}
