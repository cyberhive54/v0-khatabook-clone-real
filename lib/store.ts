"use client"

import { create } from "zustand"

export interface Contact {
  id: string
  name: string
  phone: string
  email: string
  address: string
  type: "customer" | "supplier" | "other"
  balance: number
  notes: string
}

export interface Transaction {
  id: string
  contactId: string
  amount: number
  type: "credit" | "debit"
  date: string
  description: string
  category: string
  notes: string
}

export interface Account {
  id: string
  name: string
  balance: number
  type: string
}

interface Store {
  contacts: Contact[]
  transactions: Transaction[]
  accounts: Account[]
  addContact: (contact: Omit<Contact, "id">) => void
  deleteContact: (id: string) => void
  updateContact: (id: string, contact: Partial<Contact>) => void
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  addAccount: (account: Omit<Account, "id">) => void
  deleteAccount: (id: string) => void
}

export const useStore = create<Store>((set) => ({
  contacts: [],
  transactions: [],
  accounts: [],
  addContact: (contact) =>
    set((state) => ({
      contacts: [...state.contacts, { ...contact, id: Date.now().toString() }],
    })),
  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),
  updateContact: (id, updates) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, { ...transaction, id: Date.now().toString() }],
    })),
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  addAccount: (account) =>
    set((state) => ({
      accounts: [...state.accounts, { ...account, id: Date.now().toString() }],
    })),
  deleteAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    })),
}))
