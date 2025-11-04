"use client"

import { useSettings } from "@/hooks/use-settings"

export type SyncStatusType = "synced" | "pending" | "error"

export function SyncStatusIndicator() {
  // Placeholder for sync status - will be implemented in next step
  const { settings } = useSettings()

  const syncStatus: SyncStatusType = "synced"

  const statusConfig = {
    synced: { color: "bg-green-500", text: "Synced" },
    pending: { color: "bg-yellow-500", text: "Pending" },
    error: { color: "bg-red-500", text: "Error" },
  }

  const config = statusConfig[syncStatus]

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-xs font-medium text-foreground">{config.text}</span>
    </div>
  )
}
