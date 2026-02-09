"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useTransactions, type Bill } from "@/hooks/use-transactions"
import { useContacts } from "@/hooks/use-contacts"
import { useSettings } from "@/hooks/use-settings"
import { formatCurrency } from "@/lib/currency-utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { EditTransactionModal } from "@/components/edit-transaction-modal"
import { DeleteTransactionModal } from "@/components/delete-transaction-modal"
import { BillViewerModal } from "@/components/bill-viewer-modal"
import { ImportTransactionsModal } from "@/components/import-transactions-modal"
import { ExportTransactionsModal } from "@/components/export-transactions-modal"
import { Plus, X, ImageIcon, ChevronDown, Edit2, Trash2, Download, Upload } from "lucide-react"

type FilterType = "all" | "you_got" | "you_give" | "settled_up"
type SortType = "most_recent" | "highest_amount" | "oldest" | "least_amount"

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction, operationLoading } = useTransactions()
  const { contacts } = useContacts()
  const { settings } = useSettings()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [billViewerOpen, setBillViewerOpen] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("most_recent")

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction)
    setShowEditModal(true)
  }

  const handleDeleteClick = (transaction: any) => {
    setSelectedTransaction(transaction)
    setShowDeleteModal(true)
  }

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill)
    setBillViewerOpen(true)
  }

  const getContactName = (id: string) => {
    return contacts.find((c) => c.id === id)?.name || "Unknown"
  }

  const getContactAvatar = (id: string) => {
    return contacts.find((c) => c.id === id)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions]

    if (filter === "you_got") {
      result = result.filter((t) => (t.you_got || 0) > 0)
    } else if (filter === "you_give") {
      result = result.filter((t) => (t.you_give || 0) > 0)
    } else if (filter === "settled_up") {
      const contactBalances: { [key: string]: number } = {}
      transactions.forEach((t) => {
        if (!contactBalances[t.contact_id]) {
          contactBalances[t.contact_id] = 0
        }
        contactBalances[t.contact_id] += (t.you_got || 0) - (t.you_give || 0)
      })
      result = result.filter((t) => contactBalances[t.contact_id] === 0)
    }

    result.sort((a, b) => {
      if (sortBy === "most_recent") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === "highest_amount") {
        return b.you_give + b.you_got - (a.you_give + a.you_got)
      } else if (sortBy === "least_amount") {
        return a.you_give + a.you_got - (b.you_give + b.you_got)
      }
      return 0
    })

    return result
  }, [transactions, filter, sortBy])

  const transactionsWithBalance = useMemo(() => {
    const allTransactionsSortedByDate = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    const balancesMap: { [key: string]: number } = {}
    const transactionBalances: { [key: string]: number } = {}

    allTransactionsSortedByDate.forEach((t) => {
      if (!balancesMap[t.contact_id]) {
        balancesMap[t.contact_id] = 0
      }
      balancesMap[t.contact_id] += (t.you_got || 0) - (t.you_give || 0)
      transactionBalances[t.id] = balancesMap[t.contact_id]
    })

    const result = [...filteredAndSortedTransactions]

    return result.map((t) => ({
      ...t,
      runningBalance: transactionBalances[t.id] || 0,
    }))
  }, [filteredAndSortedTransactions, transactions])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <AppHeader />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowImportModal(true)}
                variant="outline"
                className="border-border"
              >
                <Upload size={20} className="mr-2" />
                Import
              </Button>
              <Button
                onClick={() => setShowExportModal(true)}
                variant="outline"
                className="border-border"
              >
                <Download size={20} className="mr-2" />
                Export
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus size={20} className="mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Filter:</label>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="appearance-none px-4 py-2 border border-border rounded-lg bg-input text-foreground pr-8"
                >
                  <option value="all">All</option>
                  <option value="you_got">You Got</option>
                  <option value="you_give">You Gave</option>
                  <option value="settled_up">Settled Up</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Sort By:</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="appearance-none px-4 py-2 border border-border rounded-lg bg-input text-foreground pr-8"
                >
                  <option value="most_recent">Most Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest_amount">Highest Amount</option>
                  <option value="least_amount">Least Amount</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">You Gave</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">You Got</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description & Bills</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Balance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactionsWithBalance.map((t: any) => {
                  const contact = getContactAvatar(t.contact_id)
                  const balanceColor =
                    t.runningBalance > 0 ? "text-green-600" : t.runningBalance < 0 ? "text-red-600" : "text-foreground"

                  return (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            {contact?.profile_pic && (
                              <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />
                            )}
                            <AvatarFallback>{getInitials(contact?.name || "Unknown")}</AvatarFallback>
                          </Avatar>
                          <span>{getContactName(t.contact_id)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        {(t.you_give || 0) > 0 ? formatCurrency(t.you_give || 0, settings.currency) : "-"}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        {(t.you_got || 0) > 0 ? formatCurrency(t.you_got || 0, settings.currency) : "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground">{new Date(t.date).toLocaleDateString()}</td>

                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="space-y-2">
                          <p>{t.description || "-"}</p>
                          {t.bills && t.bills.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {t.bills.map((bill: any) => (
                                <button
                                  key={bill.id}
                                  onClick={() => handleBillClick(bill)}
                                  className="hover:scale-110 transition-transform cursor-pointer"
                                  title={`Bill: ${bill.bill_number || "Unnamed"}`}
                                >
                                  <img
                                    src={bill.image_url || "/placeholder.svg"}
                                    alt="Bill"
                                    className="h-12 w-12 object-cover rounded border border-border hover:border-primary"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className={`px-6 py-4 text-sm font-semibold ${balanceColor}`}>
                        {formatCurrency(t.runningBalance || 0, settings.currency)}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} className="text-primary" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(t)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {transactionsWithBalance.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No transactions match your filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>

          <AddTransactionModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={addTransaction}
            isLoading={operationLoading}
      />

          <EditTransactionModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedTransaction(null)
            }}
            transaction={selectedTransaction}
            onSubmit={updateTransaction}
            isLoading={operationLoading}
      />

      <DeleteTransactionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
        onConfirm={deleteTransaction}
        isLoading={false}
      />

      <BillViewerModal
        isOpen={billViewerOpen}
        onClose={() => {
          setBillViewerOpen(false)
          setSelectedBill(null)
        }}
        bill={selectedBill}
      />

      <ImportTransactionsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      <ExportTransactionsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  )
}
