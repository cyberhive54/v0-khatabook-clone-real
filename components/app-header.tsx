"use client"

import { SyncStatusEnhanced } from "./sync-status-enhanced"

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-primary hidden md:block">Khatabook</h1>
        <div className="flex flex-col items-end gap-1 md:gap-2">
          <p className="text-sm text-muted-foreground">Welcome to your financial ledger</p>
          <SyncStatusEnhanced />
        </div>
      </div>
    </header>
  )
}
