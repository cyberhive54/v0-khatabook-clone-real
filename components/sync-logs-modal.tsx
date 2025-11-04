"use client"

import { useState, useEffect } from "react"
import { syncManager } from "@/lib/sync/sync-manager"
import { SyncLog } from "@/lib/sync/db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface SyncLogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SyncLogsModal({ open, onOpenChange }: SyncLogsModalProps) {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const syncLogs = await syncManager.getSyncLogs(100)
      setLogs(syncLogs)
    } catch (error) {
      console.error('Error loading sync logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadLogs()
    }
  }, [open])

  const handleClearLogs = async () => {
    await syncManager.clearSyncLogs()
    await loadLogs()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sync Logs</DialogTitle>
          <DialogDescription>
            View detailed sync operations and debug information
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {logs.length} log entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadLogs}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={logs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              No sync logs available
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    log.status === 'success' && "bg-green-50 border-green-200",
                    log.status === 'error' && "bg-red-50 border-red-200",
                    log.status === 'pending' && "bg-blue-50 border-blue-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {log.operation}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {log.message}
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono bg-white/50 p-2 rounded">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
