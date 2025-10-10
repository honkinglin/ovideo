import { useEffect, useState } from "react"
import { useRegisterSW } from "virtual:pwa-register/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, X } from "lucide-react"

// PWAUpdatePrompt: Shows a prompt when a new PWA version is available
export function PWAUpdatePrompt() {
  // Controls whether the update prompt is visible
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  
  // Register Service Worker and get related states and actions
  // offlineReady: Is app ready for offline use
  // needRefresh: Is refresh needed for new version
  // updateServiceWorker: Triggers SW update
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {
      // Service Worker registration succeeded
      console.log('SW Registered')
    },
    onRegisterError(error: Error) {
      // Service Worker registration failed
      console.log('SW registration error', error)
    },
    onOfflineReady() {
      // App is ready for offline use
      console.log('SW offline ready')
    },
    onNeedRefresh() {
      // New version detected, needs refresh
      console.log('SW need refresh')
      setShowUpdatePrompt(true)
    },
  })

  // Show offline ready message (can be extended to UI)
  useEffect(() => {
    if (offlineReady) {
      console.log('App is ready to work offline')
    }
  }, [offlineReady])

  // User clicks "Update Now": force SW update and close prompt
  const handleUpdate = () => {
    updateServiceWorker(true)
    setShowUpdatePrompt(false)
  }

  // User clicks "Later" or close: dismiss prompt and reset states
  const handleDismiss = () => {
    setShowUpdatePrompt(false)
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  // Do not show prompt if no update or refresh needed
  if (!showUpdatePrompt && !needRefresh) {
    return null
  }

  // Update prompt UI
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