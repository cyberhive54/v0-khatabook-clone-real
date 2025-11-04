"use client"

import { useTransactions } from "./use-transactions"
import { useContacts } from "./use-contacts"

export interface ContactStats {
  contactId: string
  totalTransactions: number
  totalAmount: number
  totalGave: number
  totalGot: number
  balance: number
  lastTransactionDate: string | null
  lastTransactionAmount: number | null
  createdAt: string
  transactionHistory: Array<{ date: string; you_give: number; you_got: number }>
}

export function useContactStats(contactId: string) {
  const { transactions } = useTransactions()
  const { contacts } = useContacts()

  const contact = contacts.find((c) => c.id === contactId)
  const contactTransactions = transactions
    .filter((t) => t.contact_id === contactId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const stats: ContactStats = {
    contactId,
    totalTransactions: contactTransactions.length,
    totalGave: contactTransactions.reduce((sum, t) => sum + (t.you_give || 0), 0),
    totalGot: contactTransactions.reduce((sum, t) => sum + (t.you_got || 0), 0),
    totalAmount: contactTransactions.reduce((sum, t) => sum + ((t.you_give || 0) + (t.you_got || 0)), 0),
    balance: contactTransactions.reduce((sum, t) => sum + ((t.you_got || 0) - (t.you_give || 0)), 0),
    lastTransactionDate: contactTransactions[0]?.date || null,
    lastTransactionAmount: (contactTransactions[0]?.you_give || 0) + (contactTransactions[0]?.you_got || 0) || null,
    createdAt: contact?.created_at || new Date().toISOString(),
    transactionHistory: contactTransactions.map((t) => ({
      date: t.date,
      you_give: t.you_give || 0,
      you_got: t.you_got || 0,
    })),
  }

  return stats
}
