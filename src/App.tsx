import { VideoPlayer } from "@/components/video-player"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { PWAUpdatePrompt } from "@/components/pwa-update-prompt"

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <VideoPlayer />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
    </div>
  )
}
