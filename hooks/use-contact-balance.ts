"use client"

import { useTransactions } from "./use-transactions"

export function useContactBalance(contactId: string) {
  const { transactions } = useTransactions()

  const balance = transactions
    .filter((t) => t.contact_id === contactId)
    .reduce((sum, t) => {
      const gave = t.you_give || 0
      const got = t.you_got || 0
      return sum + (got - gave)
    }, 0)

  return balance
}
