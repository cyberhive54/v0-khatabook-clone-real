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
import { Plus, X, ImageIcon, ChevronDown } from "lucide-react"

type FilterType = "all" | "you_got" | "you_give" | "settled_up"
type SortType = "most_recent" | "highest_amount" | "oldest" | "least_amount"

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useTransactions()
  const { contacts } = useContacts()
  const { settings } = useSettings()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [bills, setBills] = useState<Omit<Bill, "id" | "transaction_id">[]>([])
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("most_recent")
  const [formData, setFormData] = useState<{
  contact_id: string
  amount: number
  transactionType: string
  date: string
  description: string
  notes: string
  status: "settled" | "unsettled"
}>({
  contact_id: "",
  amount: 0,
  transactionType: "you_give",
  date: "",
  description: "",
  notes: "",
  status: "unsettled",
})


  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()

      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setBills([
          ...bills,
          {
            image_url: base64,
            bill_number: undefined,
            bill_date: undefined,
            bill_amount: undefined,
            notes: undefined,
          },
        ])
      }

      reader.readAsDataURL(file)
    }
  }

  const removeBill = (index: number) => {
    setBills(bills.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const transactionData = {
        contact_id: formData.contact_id,
        you_give: formData.transactionType === "give" ? formData.amount : 0,
        you_got: formData.transactionType === "got" ? formData.amount : 0,
        date: formData.date,
        description: formData.description,
        notes: formData.notes,
        status: formData.status || "unsettled",
      }

      if (editingId) {
        await updateTransaction(editingId, transactionData, bills)
        setEditingId(null)
      } else {
        await addTransaction(transactionData, bills)
      }

      setFormData({
        contact_id: "",
        amount: 0,
        transactionType: "give",
        date: new Date().toISOString().split("T")[0],
        description: "",
        notes: "",
        status: "unsettled",
      })
      setBills([])
      setShowForm(false)
    } catch (error) {
      console.error("Error saving transaction:", error)
    }
  }

  const handleEdit = (transaction: any) => {
    setFormData({
      contact_id: transaction.contact_id,
      amount: transaction.you_give || transaction.you_got || 0,
      transactionType: transaction.you_give > 0 ? "give" : "got",
      date: transaction.date,
      description: transaction.description,
      notes: transaction.notes,
      status: "unsettled",
    })
    setEditingId(transaction.id)
    setBills(transaction.bills || [])
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
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
      result = result.filter((t) => (t.you_got || 0) > 0) // "will give" = you_got amounts
    } else if (filter === "you_give") {
      result = result.filter((t) => (t.you_give || 0) > 0) // "will get" = you_give amounts
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <Button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({
                  contact_id: "",
                  amount: 0,
                  transactionType: "give",
                  date: new Date().toISOString().split("T")[0],
                  description: "",
                  notes: "",
                  status: "unsettled",
                })
                setBills([])
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={20} className="mr-2" />
              Add Transaction
            </Button>
          </div>

          {showForm && (
            <Card className="p-6 bg-card border border-border mb-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {editingId ? "Edit Transaction" : "New Transaction"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={formData.contact_id}
                    onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                    required
                    className="px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  >
                    <option value="">Select Contact</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.transactionType}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                    className="px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  >
                    <option value="give">Will Get (I give)</option>
                    <option value="got">Will Give (I got from them)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className="px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-2 px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
                  <textarea
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="col-span-2 px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
                </div>

                <div className="col-span-2 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Add Bill Photos</h3>
                  <div className="mb-4">
                    <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center">
                        <ImageIcon size={20} className="text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload bill photos or drag and drop
                        </span>
                      </div>
                      <input type="file" multiple accept="image/*" onChange={handleBillUpload} className="hidden" />
                    </label>
                  </div>

                  {bills.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {bills.map((bill, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={bill.image_url || "/placeholder.svg"}
                            alt={`Bill ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeBill(index)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    {editingId ? "Update" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      setBills([])
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

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
                  <option value="you_got">Will Give (I got)</option>
                  <option value="you_give">Will Get (I give)</option>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Will Get</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Will Give</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description & Bills</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Balance</th>
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
                          <p>{t.description}</p>
                          {t.bills && t.bills.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {t.bills.map((bill: any) => (
                                <img
                                  key={bill.id}
                                  src={bill.image_url || "/placeholder.svg"}
                                  alt="Bill"
                                  className="h-12 w-12 object-cover rounded border border-border"
                                  title={`Bill: ${bill.bill_number || "Unnamed"}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className={`px-6 py-4 text-sm font-semibold ${balanceColor}`}>
                        {formatCurrency(t.runningBalance || 0, settings.currency)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {transactionsWithBalance.length === 0 && !showForm && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No transactions match your filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
