"use client"

import { ConnectionStatusIndicator } from "./connection-status-indicator"
import { SyncStatusIndicator } from "./sync-status-indicator"

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-primary hidden md:block">Khatabook</h1>
        <div className="flex flex-col items-end gap-1 md:gap-2">
          <p className="text-sm text-muted-foreground">Welcome to your financial ledger</p>
          <div className="flex items-center gap-2">
            <ConnectionStatusIndicator />
            <SyncStatusIndicator />
          </div>
        </div>
      </div>
    </header>
  )
}
