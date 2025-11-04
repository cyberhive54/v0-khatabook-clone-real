"use client"

import { useState, useEffect, useCallback } from "react"
import { offlineDB, Contact as DBContact } from "@/lib/sync/db"
import { networkMonitor } from "@/lib/sync/network-monitor"
import { syncManager } from "@/lib/sync/sync-manager"
import { createClient } from "@/lib/supabase/client"

export interface Contact extends DBContact {
  balance?: number
  notes?: string
}

export function useContactsOffline() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const loadContactsFromIndexedDB = useCallback(async () => {
    try {
      const dbContacts = await offlineDB.getAll('contacts')
      setContacts(dbContacts as Contact[])
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading contacts from IndexedDB:', err)
      setError(err instanceof Error ? err : new Error('Failed to load contacts'))
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    offlineDB.init().then(() => {
      loadContactsFromIndexedDB()
    })

    const unsubscribeNetwork = networkMonitor.subscribe((online) => {
      setIsOnline(online)
    })

    const unsubscribeSync = syncManager.subscribe((status) => {
      if (status === 'synced') {
        loadContactsFromIndexedDB()
      }
    })

    return () => {
      unsubscribeNetwork()
      unsubscribeSync()
    }
  }, [loadContactsFromIndexedDB])

  const addContact = async (contact: Omit<Contact, "id" | "created_at" | "updated_at">) => {
    try {
      const newContact: Contact = {
        id: `contact_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...contact,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await offlineDB.put('contacts', newContact)

      if (isOnline) {
        const supabase = createClient()
        const { error } = await supabase.from('contacts').insert([newContact])
        
        if (error) {
          await offlineDB.addToSyncQueue({
            table: 'contacts',
            operation: 'CREATE',
            data: newContact,
            timestamp: Date.now(),
            retries: 0,
          })
        }
      } else {
        await offlineDB.addToSyncQueue({
          table: 'contacts',
          operation: 'CREATE',
          data: newContact,
          timestamp: Date.now(),
          retries: 0,
        })
      }

      await loadContactsFromIndexedDB()
      return newContact
    } catch (err) {
      console.error('Error adding contact:', err)
      throw err
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const existingContact = await offlineDB.get('contacts', id)
      if (!existingContact) {
        throw new Error('Contact not found')
      }

      const updatedContact: Contact = {
        ...existingContact,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      await offlineDB.put('contacts', updatedContact)

      if (isOnline) {
        const supabase = createClient()
        const { error } = await supabase.from('contacts').update(updatedContact).eq('id', id)
        
        if (error) {
          await offlineDB.addToSyncQueue({
            table: 'contacts',
            operation: 'UPDATE',
            data: updatedContact,
            timestamp: Date.now(),
            retries: 0,
          })
        }
      } else {
        await offlineDB.addToSyncQueue({
          table: 'contacts',
          operation: 'UPDATE',
          data: updatedContact,
          timestamp: Date.now(),
          retries: 0,
        })
      }

      await loadContactsFromIndexedDB()
    } catch (err) {
      console.error('Error updating contact:', err)
      throw err
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const existingContact = await offlineDB.get('contacts', id)
      if (!existingContact) {
        throw new Error('Contact not found')
      }

      await offlineDB.delete('contacts', id)

      if (isOnline) {
        const supabase = createClient()
        const { error } = await supabase.from('contacts').delete().eq('id', id)
        
        if (error) {
          await offlineDB.addToSyncQueue({
            table: 'contacts',
            operation: 'DELETE',
            data: { id },
            timestamp: Date.now(),
            retries: 0,
          })
        }
      } else {
        await offlineDB.addToSyncQueue({
          table: 'contacts',
          operation: 'DELETE',
          data: { id },
          timestamp: Date.now(),
          retries: 0,
        })
      }

      await loadContactsFromIndexedDB()
    } catch (err) {
      console.error('Error deleting contact:', err)
      throw err
    }
  }

  return {
    contacts,
    isLoading,
    error,
    isOnline,
    addContact,
    updateContact,
    deleteContact,
    refresh: loadContactsFromIndexedDB,
  }
}
