import { openDB, DBSchema, IDBPDatabase } from 'idb'

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  profile_pic?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  contact_id: string
  you_give: number
  you_got: number
  description?: string
  date: string
  bill_photos?: string[]
  created_at: string
  updated_at: string
}

export interface Settings {
  id: string
  user_id?: string
  currency_symbol?: string
  date_format?: string
  offline_mode?: boolean
  live_network_check?: boolean
  created_at: string
  updated_at: string
}

export interface SyncQueueItem {
  id: string
  table: 'contacts' | 'transactions' | 'settings'
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  data: any
  timestamp: number
  retries: number
  error?: string
}

export interface SyncLog {
  id: string
  timestamp: number
  operation: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: string
}

interface KhatabookDB extends DBSchema {
  contacts: {
    key: string
    value: Contact
    indexes: { 'by-updated': string }
  }
  transactions: {
    key: string
    value: Transaction
    indexes: { 'by-contact': string; 'by-updated': string }
  }
  settings: {
    key: string
    value: Settings
  }
  syncQueue: {
    key: string
    value: SyncQueueItem
    indexes: { 'by-timestamp': number }
  }
  syncLogs: {
    key: string
    value: SyncLog
    indexes: { 'by-timestamp': number }
  }
}

class OfflineDB {
  private db: IDBPDatabase<KhatabookDB> | null = null
  private dbName = 'khatabook-offline'
  private version = 1

  async init() {
    if (this.db) return this.db

    this.db = await openDB<KhatabookDB>(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('contacts')) {
          const contactStore = db.createObjectStore('contacts', { keyPath: 'id' })
          contactStore.createIndex('by-updated', 'updated_at')
        }

        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' })
          txStore.createIndex('by-contact', 'contact_id')
          txStore.createIndex('by-updated', 'updated_at')
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          queueStore.createIndex('by-timestamp', 'timestamp')
        }

        if (!db.objectStoreNames.contains('syncLogs')) {
          const logsStore = db.createObjectStore('syncLogs', { keyPath: 'id' })
          logsStore.createIndex('by-timestamp', 'timestamp')
        }
      },
    })

    return this.db
  }

  async getAll<T extends keyof KhatabookDB>(storeName: T): Promise<KhatabookDB[T]['value'][]> {
    const db = await this.init()
    return db.getAll(storeName)
  }

  async get<T extends keyof KhatabookDB>(
    storeName: T,
    key: string
  ): Promise<KhatabookDB[T]['value'] | undefined> {
    const db = await this.init()
    return db.get(storeName, key)
  }

  async put<T extends keyof KhatabookDB>(storeName: T, value: KhatabookDB[T]['value']) {
    const db = await this.init()
    return db.put(storeName, value)
  }

  async delete<T extends keyof KhatabookDB>(storeName: T, key: string) {
    const db = await this.init()
    return db.delete(storeName, key)
  }

  async clear<T extends keyof KhatabookDB>(storeName: T) {
    const db = await this.init()
    return db.clear(storeName)
  }

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>) {
    const db = await this.init()
    const queueItem: SyncQueueItem = {
      ...item,
      id: `${item.table}-${item.operation}-${Date.now()}-${Math.random()}`,
    }
    await db.put('syncQueue', queueItem)
    return queueItem
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.init()
    return db.getAllFromIndex('syncQueue', 'by-timestamp')
  }

  async removeSyncQueueItem(id: string) {
    const db = await this.init()
    await db.delete('syncQueue', id)
  }

  async addSyncLog(log: Omit<SyncLog, 'id'>) {
    const db = await this.init()
    const logEntry: SyncLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random()}`,
    }
    await db.put('syncLogs', logEntry)
    
    const logs = await db.getAllFromIndex('syncLogs', 'by-timestamp')
    if (logs.length > 100) {
      const oldestLogs = logs.slice(0, logs.length - 100)
      for (const oldLog of oldestLogs) {
        await db.delete('syncLogs', oldLog.id)
      }
    }
    
    return logEntry
  }

  async getSyncLogs(limit = 50): Promise<SyncLog[]> {
    const db = await this.init()
    const logs = await db.getAllFromIndex('syncLogs', 'by-timestamp')
    return logs.slice(-limit).reverse()
  }

  async clearSyncLogs() {
    const db = await this.init()
    await db.clear('syncLogs')
  }
}

export const offlineDB = new OfflineDB()
