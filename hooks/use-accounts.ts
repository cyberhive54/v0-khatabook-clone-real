"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

export interface Account {
  id: string
  name: string
  balance: number
  type: string
}

const supabase = createClient()

async function fetchAccounts(): Promise<Account[]> {
  const { data, error } = await supabase.from("accounts").select("*").order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export function useAccounts() {
  const { data, error, isLoading, mutate } = useSWR("accounts", fetchAccounts)

  const addAccount = async (account: Omit<Account, "id">) => {
    const { data: newAccount, error } = await supabase.from("accounts").insert([account]).select()

    if (error) throw new Error(error.message)
    mutate()
    return newAccount?.[0]
  }

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id)
    if (error) throw new Error(error.message)
    mutate()
  }

  return {
    accounts: data || [],
    isLoading,
    error,
    addAccount,
    deleteAccount,
  }
}
