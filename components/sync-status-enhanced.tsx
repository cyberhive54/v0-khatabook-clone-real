"use client"

import { useState, useEffect } from "react"
import { syncManager, SyncStatus } from "@/lib/sync/sync-manager"
import { networkMonitor } from "@/lib/sync/network-monitor"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff, CheckCircle, AlertCircle, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { SyncLogsModal } from "./sync-logs-modal"

export function SyncStatusEnhanced() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)

  useEffect(() => {
    const unsubscribeSync = syncManager.subscribe((status, message) => {
      setSyncStatus(status)
      setStatusMessage(message || '')
      setIsSyncing(status === 'syncing')
    })

    const unsubscribeNetwork = networkMonitor.subscribe((online) => {
      setIsOnline(online)
    })

    return () => {
      unsubscribeSync()
      unsubscribeNetwork()
    }
  }, [])

  const handleManualSync = async () => {
    if (!isSyncing && isOnline) {
      await syncManager.sync(true)
    }
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />
    if (syncStatus === 'synced') return <CheckCircle className="h-4 w-4" />
    if (syncStatus === 'error') return <AlertCircle className="h-4 w-4" />
    return <Wifi className="h-4 w-4" />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (isSyncing) return 'Syncing...'
    if (syncStatus === 'synced') return 'Synced'
    if (syncStatus === 'error') return 'Sync Error'
    return 'Ready'
  }

  const getStatusColor = () => {
    if (!isOnline) return 'text-gray-500'
    if (isSyncing) return 'text-blue-500'
    if (syncStatus === 'synced') return 'text-green-500'
    if (syncStatus === 'error') return 'text-red-500'
    return 'text-gray-600'
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div className={cn("flex items-center gap-2 text-sm", getStatusColor())}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowLogsModal(true)}
          title="View Sync Logs"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          disabled={isSyncing || !isOnline}
          className="h-8"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isSyncing && "animate-spin")} />
          Sync
        </Button>
      </div>

      <SyncLogsModal 
        open={showLogsModal} 
        onOpenChange={setShowLogsModal}
      />
    </>
  )
}
