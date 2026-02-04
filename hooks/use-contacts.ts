"use client"

import React from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

export interface Contact {
  id: string
  name: string
  phone: string
  email: string
  address: string
  notes: string
  profile_pic?: string
  balance: number
  created_at?: string
  user_id?: string
}

const supabase = createClient()

async function fetchContacts(): Promise<Contact[]> {
  // RLS policies will automatically filter by user_id
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export function useContacts() {
  const { data, error, isLoading, mutate } = useSWR("contacts", fetchContacts)
  const [operationLoading, setOperationLoading] = React.useState(false)
  const [operationError, setOperationError] = React.useState<string | null>(null)

  const addContact = async (contact: Omit<Contact, "id" | "user_id">) => {
    setOperationLoading(true)
    setOperationError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error("User not authenticated")

      const { data: newContact, error } = await supabase
        .from("contacts")
        .insert([{ ...contact, user_id: user.id }])
        .select()

      if (error) throw new Error(error.message)
      mutate()
      return newContact?.[0]
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add contact"
      setOperationError(message)
      throw err
    } finally {
      setOperationLoading(false)
    }
  }

  const deleteContact = async (id: string) => {
    setOperationLoading(true)
    setOperationError(null)
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id)
      if (error) throw new Error(error.message)
      mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete contact"
      setOperationError(message)
      throw err
    } finally {
      setOperationLoading(false)
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    setOperationLoading(true)
    setOperationError(null)
    try {
      const { error } = await supabase.from("contacts").update(updates).eq("id", id)
      if (error) throw new Error(error.message)
      mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update contact"
      setOperationError(message)
      throw err
    } finally {
      setOperationLoading(false)
    }
  }

  return {
    contacts: data || [],
    isLoading,
    error,
    operationLoading,
    operationError,
    addContact,
    deleteContact,
    updateContact,
  }
}
