import { VideoPlayer } from "@/components/video-player"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { PWAUpdatePrompt } from "@/components/pwa-update-prompt"
import { BgCanvas } from "@/components/bg-canvas"

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <BgCanvas />
      <div className="relative z-10">
        <VideoPlayer />
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
      </div>
    </div>
  )
}
