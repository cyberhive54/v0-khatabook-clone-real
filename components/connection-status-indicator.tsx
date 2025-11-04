"use client"

import { useConnectionStatus } from "@/hooks/use-connection-status"
import { useSettings } from "@/hooks/use-settings"

export function ConnectionStatusIndicator() {
  const connectionStatus = useConnectionStatus()
  const { settings } = useSettings()

  // Only show indicator if live network check is enabled
  if (!settings.liveNetworkCheck) {
    return null
  }

  const isOnline = connectionStatus.isOnline
  const statusText = isOnline ? "Online" : "No Network"
  const statusColor = isOnline ? "bg-green-500" : "bg-red-500"

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border">
      <div className={`w-2 h-2 rounded-full ${statusColor}`} />
      <span className="text-xs font-medium text-foreground">{statusText}</span>
    </div>
  )
}
