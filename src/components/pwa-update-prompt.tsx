import { useEffect, useState } from "react"
import { useRegisterSW } from "virtual:pwa-register/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, X } from "lucide-react"

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {
      console.log('SW Registered')
    },
    onRegisterError(error: Error) {
      console.log('SW registration error', error)
    },
    onOfflineReady() {
      console.log('SW offline ready')
    },
    onNeedRefresh() {
      console.log('SW need refresh')
      setShowUpdatePrompt(true)
    },
  })

  useEffect(() => {
    if (offlineReady) {
      console.log('App is ready to work offline')
    }
  }, [offlineReady])

  const handleUpdate = () => {
    updateServiceWorker(true)
    setShowUpdatePrompt(false)
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  if (!showUpdatePrompt && !needRefresh) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 border-blue-500/20 bg-card/95 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">Update Available</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          A new version of Ovideo is available with improvements and bug fixes.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button onClick={handleUpdate} size="sm" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Now
          </Button>
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}