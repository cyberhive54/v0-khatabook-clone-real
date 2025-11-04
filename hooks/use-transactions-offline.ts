"use client"

import { useState, useEffect, useCallback } from "react"
import { offlineDB, Transaction as DBTransaction } from "@/lib/sync/db"
import { networkMonitor } from "@/lib/sync/network-monitor"
import { syncManager } from "@/lib/sync/sync-manager"
import { createClient } from "@/lib/supabase/client"

export interface Transaction extends DBTransaction {
  notes?: string
}

export function useTransactionsOffline() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const loadTransactionsFromIndexedDB = useCallback(async () => {
    try {
      const dbTransactions = await offlineDB.getAll('transactions')
      setTransactions(dbTransactions as Transaction[])
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading transactions from IndexedDB:', err)
      setError(err instanceof Error ? err : new Error('Failed to load transactions'))
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    offlineDB.init().then(() => {
      loadTransactionsFromIndexedDB()
    })

    const unsubscribeNetwork = networkMonitor.subscribe((online) => {
      setIsOnline(online)
    })

    const unsubscribeSync = syncManager.subscribe((status) => {
      if (status === 'synced') {
        loadTransactionsFromIndexedDB()
      }
    })

    return () => {
      unsubscribeNetwork()
      unsubscribeSync()
    }
  }, [loadTransactionsFromIndexedDB])

  const addTransaction = async (transaction: Omit<Transaction, "id" | "created_at" | "updated_at">) => {
    try {
      const newTransaction: Transaction = {
        id: `transaction_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await offlineDB.put('transactions', newTransaction)

      if (isOnline) {
        const supabase = createClient()
        const { error } = await supabase.from('transactions').insert([newTransaction])
        
        if (error) {
          await offlineDB.addToSyncQueue({
            table: 'transactions',
            operation: 'CREATE',
            data: newTransaction,
            timestamp: Date.now(),
            retries: 0,
          })
        }
      } else {
        await offlineDB.addToSyncQueue({
          table: 'transactions',
          operation: 'CREATE',
          data: newTransaction,
          timestamp: Date.now(),
          retries: 0,
        })
      }

      await loadTransactionsFromIndexedDB()
      return newTransaction
    } catch (err) {
      console.error('Error adding transaction:', err)
      throw err
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const existingTransaction = await offlineDB.get('transactions', id)
      if (!existingTransaction) {
        throw new Error('Transaction not found')
      }

      const updatedTransaction: Transaction = {
        ...existingTransaction,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      await offlineDB.put('transactions', updatedTransaction)

      if (isOnline) {
        const supabase = createClient()
        const { error } = await supabase.from('transactions').update(updatedTransaction).eq('id', id)
        
        if (error) {
          await offlineDB.addToSyncQueue({
            table: 'transactions',
            operation: 'UPDATE',
            data: updatedTransaction,
            timestamp: Date.now(),
            retries: 0,
          })
        }
      } else {
        await offlineDB.addToSyncQueue({
          table: 'transactions',
          operation: 'UPDATE',
          data: updatedTransaction,
          timestamp: Date.now(),
          retries: 0,
        })
      }

      await loadTransactionsFromIndexedDB()
    } catch (err) {
      console.error('Error updating transaction:', err)
      throw err
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const existingTransaction = await offlineDB.get('transactions', id)
      if (!existingTransaction) {
        throw new Error('Transaction not found')
      }

      await offlineDB.delete('transactions', id)

      if (isOnline) {
        const supabase = createClient()
        const { error } = await supabase.from('transactions').delete().eq('id', id)
        
        if (error) {
          await offlineDB.addToSyncQueue({
            table: 'transactions',
            operation: 'DELETE',
            data: { id },
            timestamp: Date.now(),
            retries: 0,
          })
        }
      } else {
        await offlineDB.addToSyncQueue({
          table: 'transactions',
          operation: 'DELETE',
          data: { id },
          timestamp: Date.now(),
          retries: 0,
        })
      }

      await loadTransactionsFromIndexedDB()
    } catch (err) {
      console.error('Error deleting transaction:', err)
      throw err
    }
  }

  return {
    transactions,
    isLoading,
    error,
    isOnline,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: loadTransactionsFromIndexedDB,
  }
}
