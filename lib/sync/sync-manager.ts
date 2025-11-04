import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { offlineDB, Contact, Transaction, Settings, SyncQueueItem } from './db'
import { networkMonitor } from './network-monitor'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

type SyncStatusCallback = (status: SyncStatus, message?: string) => void

class SyncManager {
  private status: SyncStatus = 'idle'
  private listeners: Set<SyncStatusCallback> = new Set()
  private syncInterval: NodeJS.Timeout | null = null
  private autoSyncEnabled = true
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private isSyncing = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    await offlineDB.init()
    
    networkMonitor.subscribe(async (isOnline) => {
      if (isOnline) {
        await this.logSync('Network', 'success', 'Back online, starting sync...')
        this.updateStatus('idle')
        this.startAutoSync()
        await this.sync()
      } else {
        await this.logSync('Network', 'error', 'Gone offline')
        this.stopAutoSync()
        this.updateStatus('offline')
      }
    })

    if (networkMonitor.isOnline) {
      this.startAutoSync()
    } else {
      this.updateStatus('offline')
    }
  }

  private updateStatus(status: SyncStatus, message?: string) {
    this.status = status
    this.listeners.forEach(listener => listener(status, message))
  }

  subscribe(callback: SyncStatusCallback) {
    this.listeners.add(callback)
    callback(this.status)
    return () => {
      this.listeners.delete(callback)
    }
  }

  getStatus(): SyncStatus {
    return this.status
  }

  startAutoSync() {
    this.autoSyncEnabled = true
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.syncInterval = setInterval(() => {
      if (this.autoSyncEnabled && networkMonitor.isOnline) {
        this.sync()
      }
    }, 60000)
  }

  stopAutoSync() {
    this.autoSyncEnabled = false
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async sync(manual = false): Promise<void> {
    if (this.isSyncing) {
      await this.logSync('Sync', 'pending', 'Sync already in progress, skipping...')
      return
    }

    if (!networkMonitor.isOnline) {
      this.updateStatus('offline', 'Cannot sync while offline')
      await this.logSync('Sync', 'error', 'Cannot sync while offline')
      return
    }

    this.isSyncing = true
    this.updateStatus('syncing', manual ? 'Manual sync started' : 'Auto sync started')
    
    try {
      await this.logSync('Sync', 'pending', `${manual ? 'Manual' : 'Auto'} sync started`)

      await this.processSyncQueue()
      
      await this.syncFromSupabase()

      this.updateStatus('synced', 'Sync completed successfully')
      await this.logSync('Sync', 'success', 'All data synced successfully')
    } catch (error) {
      console.error('Sync error:', error)
      this.updateStatus('error', error instanceof Error ? error.message : 'Sync failed')
      await this.logSync('Sync', 'error', 'Sync failed', error instanceof Error ? error.message : String(error))
    } finally {
      this.isSyncing = false
    }
  }

  private async processSyncQueue() {
    const queue = await offlineDB.getSyncQueue()
    
    if (queue.length === 0) {
      await this.logSync('Queue', 'success', 'Sync queue is empty')
      return
    }

    await this.logSync('Queue', 'pending', `Processing ${queue.length} queued operations`)

    const supabase = createBrowserClient()

    for (const item of queue) {
      try {
        let result
        
        switch (item.operation) {
          case 'CREATE':
          case 'UPDATE':
            const upsertData = { ...item.data, updated_at: new Date().toISOString() }
            result = await supabase
              .from(item.table)
              .upsert(upsertData)
              .select()
            break
            
          case 'DELETE':
            result = await supabase
              .from(item.table)
              .delete()
              .eq('id', item.data.id)
            break
        }

        if (result?.error) {
          throw result.error
        }

        await offlineDB.removeSyncQueueItem(item.id)
        await this.logSync('Queue', 'success', `${item.operation} ${item.table} - ${item.data.id?.substring(0, 8)}...`)
      } catch (error) {
        const updatedItem = {
          ...item,
          retries: item.retries + 1,
          error: error instanceof Error ? error.message : String(error),
        }
        await offlineDB.put('syncQueue', updatedItem)
        
        await this.logSync('Queue', 'error', `Failed ${item.operation} ${item.table}`, updatedItem.error)

        if (updatedItem.retries < 3) {
          this.scheduleRetry(updatedItem)
        }
      }
    }
  }

  private scheduleRetry(item: SyncQueueItem) {
    const retryDelay = Math.min(1000 * Math.pow(2, item.retries), 30000)
    
    const timeout = setTimeout(() => {
      this.sync()
      this.retryTimeouts.delete(item.id)
    }, retryDelay)
    
    this.retryTimeouts.set(item.id, timeout)
  }

  private async syncFromSupabase() {
    const supabase = createBrowserClient()

    await this.logSync('Download', 'pending', 'Downloading contacts...')
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .order('updated_at', { ascending: false })

    if (contactsError) {
      throw new Error(`Failed to fetch contacts: ${contactsError.message}`)
    }

    if (contacts) {
      await offlineDB.clear('contacts')
      for (const contact of contacts) {
        await offlineDB.put('contacts', contact as Contact)
      }
      await this.logSync('Download', 'success', `Downloaded ${contacts.length} contacts`)
    }

    await this.logSync('Download', 'pending', 'Downloading transactions...')
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .order('updated_at', { ascending: false })

    if (transactionsError) {
      throw new Error(`Failed to fetch transactions: ${transactionsError.message}`)
    }

    if (transactions) {
      await offlineDB.clear('transactions')
      for (const transaction of transactions) {
        await offlineDB.put('transactions', transaction as Transaction)
      }
      await this.logSync('Download', 'success', `Downloaded ${transactions.length} transactions`)
    }

    await this.logSync('Download', 'pending', 'Downloading settings...')
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch settings: ${settingsError.message}`)
    }

    if (settings) {
      await offlineDB.put('settings', settings as Settings)
      await this.logSync('Download', 'success', 'Downloaded settings')
    }
  }

  private async logSync(operation: string, status: 'success' | 'error' | 'pending', message: string, details?: string) {
    await offlineDB.addSyncLog({
      timestamp: Date.now(),
      operation,
      status,
      message,
      details,
    })
  }

  async getSyncLogs(limit = 50) {
    return offlineDB.getSyncLogs(limit)
  }

  async clearSyncLogs() {
    await offlineDB.clearSyncLogs()
    await this.logSync('Logs', 'success', 'Sync logs cleared')
  }

  destroy() {
    this.stopAutoSync()
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()
    this.listeners.clear()
  }
}

export const syncManager = new SyncManager()
