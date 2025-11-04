"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

export interface Contact {
  id: string
  name: string
  phone: string
  email: string
  address: string
  profile_pic?: string
  balance: number
  notes: string
}

const supabase = createClient()

async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export function useContacts() {
  const { data, error, isLoading, mutate } = useSWR("contacts", fetchContacts)

  const addContact = async (contact: Omit<Contact, "id">) => {
    const { data: newContact, error } = await supabase.from("contacts").insert([contact]).select()

    if (error) throw new Error(error.message)
    mutate()
    return newContact?.[0]
  }

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id)
    if (error) throw new Error(error.message)
    mutate()
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const { error } = await supabase.from("contacts").update(updates).eq("id", id)

    if (error) throw new Error(error.message)
    mutate()
  }

  return {
    contacts: data || [],
    isLoading,
    error,
    addContact,
    deleteContact,
    updateContact,
  }
}
