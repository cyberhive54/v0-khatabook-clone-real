"use client"

import React from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"

export interface Bill {
  id: string
  transaction_id: string
  image_url: string
  bill_number?: string
  bill_date?: string
  bill_amount?: number
  notes?: string
}

export interface Transaction {
  id: string
  contact_id: string
  you_give: number
  you_got: number
  date: string
  description: string
  notes: string
  bills?: Bill[]
  user_id?: string
}

const supabase = createClient()

async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase.from("transactions").select("*, bills(*)").order("date", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export function useTransactions() {
  const { data, error, isLoading, mutate } = useSWR("transactions", fetchTransactions)
  const [operationLoading, setOperationLoading] = React.useState(false)
  const [operationError, setOperationError] = React.useState<string | null>(null)

  const deleteTransaction = async (id: string) => {
    setOperationLoading(true)
    setOperationError(null)
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id)
      if (error) throw new Error(error.message)
      mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete transaction"
      setOperationError(message)
      throw err
    } finally {
      setOperationLoading(false)
    }
  }

  const updateTransaction = async (
    id: string,
    updates: Partial<Transaction>,
    bills: Omit<Bill, "id" | "transaction_id">[] = []
  ) => {
    setOperationLoading(true)
    setOperationError(null)
    try {
      const { error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)

      if (error) throw new Error(error.message)

      if (bills && bills.length > 0) {
        await supabase.from("bills").delete().eq("transaction_id", id)

        const billsWithTransactionId = bills.map((bill) => ({
          ...bill,
          transaction_id: id,
        }))

        const { error: billsError } = await supabase
          .from("bills")
          .insert(billsWithTransactionId)

        if (billsError) throw new Error(billsError.message)
      }

      mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update transaction"
      setOperationError(message)
      throw err
    } finally {
      setOperationLoading(false)
    }
  }

  const addBillToTransaction = async (transactionId: string, bill: Omit<Bill, "id" | "transaction_id">) => {
    const { data: newBill, error } = await supabase
      .from("bills")
      .insert([{ ...bill, transaction_id: transactionId }])
      .select()

    if (error) throw new Error(error.message)
    mutate()
    return newBill?.[0]
  }

  const deleteBill = async (billId: string) => {
    const { error } = await supabase.from("bills").delete().eq("id", billId)
    if (error) throw new Error(error.message)
    mutate()
  }

  const addTransaction = async (
  transaction: Omit<Transaction, "id" | "bills">,
  bills?: Omit<Bill, "id" | "transaction_id">[]
  ) => {
  setOperationLoading(true)
  setOperationError(null)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error("User not authenticated")

    const { data: newTransaction, error } = await supabase
      .from("transactions")
      .insert([{ ...transaction, user_id: user.id }])
      .select()

    if (error) throw new Error(error.message)

    if (newTransaction?.[0] && bills && bills.length > 0) {
      const billsWithTransactionId = bills.map((bill) => ({
        ...bill,
        transaction_id: newTransaction[0].id,
      }))

      const { error: billsError } = await supabase
        .from("bills")
        .insert(billsWithTransactionId)

      if (billsError) throw new Error(billsError.message)
    }

    mutate()
    return newTransaction?.[0]
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add transaction"
    setOperationError(message)
    throw err
  } finally {
    setOperationLoading(false)
  }
  }

  const deleteAllTransactions = async () => {
    setOperationLoading(true)
    setOperationError(null)
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .neq("id", "") // Delete all rows (non-null condition)

      if (error) throw new Error(error.message)
      mutate()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete all transactions"
      setOperationError(message)
      throw err
    } finally {
      setOperationLoading(false)
    }
  }

  return {
    transactions: data || [],
    isLoading,
    error,
    operationLoading,
    operationError,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addBillToTransaction,
    deleteBill,
    deleteAllTransactions,
  }
}
