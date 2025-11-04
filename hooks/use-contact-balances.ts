"use client"

import { useTransactions } from "./use-transactions"

export function useContactBalances() {
  const { transactions } = useTransactions()

  const getBalance = (contactId: string) => {
    return transactions
      .filter((t) => t.contact_id === contactId)
      .reduce((sum, t) => {
        const youGot = t.you_got || 0
        const youGive = t.you_give || 0
        return sum + youGot - youGive
      }, 0)
  }

  return { getBalance }
}
