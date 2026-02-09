"use client"

import { useState, useEffect, useMemo } from "react"
import { useContacts } from "@/hooks/use-contacts"
import { useTransactions, type Transaction, type Bill } from "@/hooks/use-transactions"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { EditTransactionModal } from "@/components/edit-transaction-modal"
import { BillViewerModal } from "@/components/bill-viewer-modal"
import { ViewSwitcher } from "@/components/view-switcher"
import { SmartSearchInput } from "@/components/smart-search-input"
import { SortFilterPanel } from "@/components/sort-filter-panel"
import { HighlightedText } from "@/components/highlighted-text"
import { format } from "date-fns"
import { Edit2, Trash2, ImageIcon, Loader2 } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { formatCurrency } from "@/lib/currency-utils"
import { smartSearch, sortContacts } from "@/lib/search-utils"

type ViewType = "card" | "list" | "grid"
type SortBy = "name-az" | "name-za" | "added-latest" | "added-oldest" | "balance-highest" | "balance-lowest" | "transaction-latest" | "transaction-oldest" | "all"

export default function LedgerPage() {
  const searchParams = useSearchParams()
  const { contacts } = useContacts()
  const { transactions, deleteTransaction, addTransaction, updateTransaction, operationLoading, isLoading } = useTransactions()
  const { settings } = useSettings()
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"give" | "got" | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [billViewerOpen, setBillViewerOpen] = useState(false)
  const [view, setView] = useState<ViewType>("card")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("added-latest")

  useEffect(() => {
    const contactParam = searchParams.get("contact")
    if (contactParam) {
      setSelectedContactId(contactParam)
    }
  }, [searchParams])

  const selectedContact = contacts.find((c) => c.id === selectedContactId)

  const getContactTransactions = (contactId: string) => {
    return transactions
      .filter((t) => t.contact_id === contactId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const calculateBalance = (contactId: string): number => {
    const contactTrans = getContactTransactions(contactId)
    let balance = 0
    return contactTrans.reverse().reduce((acc, t) => {
      balance += (t.you_got || 0) - (t.you_give || 0)
      return balance
    }, 0)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getContactBalanceForSort = (contact: typeof contacts[0]): number => {
    return transactions
      .filter((t) => t.contact_id === contact.id)
      .reduce((sum, t) => sum + (t.you_got || 0) - (t.you_give || 0), 0)
  }

  const getContactTransactionCountForSort = (contact: typeof contacts[0]): number => {
    return transactions.filter((t) => t.contact_id === contact.id).length
  }

  const searchResults = useMemo(() => {
    const results = smartSearch(contacts, searchQuery, ["name", "phone", "email"])
    return results.map((r) => r.item)
  }, [contacts, searchQuery])

  const sortedContacts = useMemo(() => {
    return sortContacts(searchResults, sortBy, getContactBalanceForSort, getContactTransactionCountForSort)
  }, [searchResults, sortBy, transactions])

  const handleAddTransaction = (type: "give" | "got") => {
    if (!selectedContact) return
    setEditingTransaction(null)
    setModalType(type)
    setTransactionModalOpen(true)
  }

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction)
    setModalType(null)
    setTransactionModalOpen(true)
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(transactionId)
    }
  }

  const handleAddTransactionSubmit = async (transaction: Omit<Transaction, "id" | "bills">, bills: Omit<Bill, "id" | "transaction_id">[]) => {
    await addTransaction(transaction, bills)
    setTransactionModalOpen(false)
  }

  const handleEditTransactionSubmit = async (id: string, transaction: Partial<Transaction>, bills: Omit<Bill, "id" | "transaction_id">[]) => {
    await updateTransaction(id, transaction, bills)
    setTransactionModalOpen(false)
  }

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill)
    setBillViewerOpen(true)
  }

  const contactTransactions = selectedContact ? getContactTransactions(selectedContact.id) : []
  const runningBalance = selectedContact ? calculateBalance(selectedContact.id) : 0

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <AppHeader />
        <main className="p-4 md:p-6 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-foreground mb-6">Account Ledger</h1>

          {/* Contact Selector */}
          {!selectedContactId && (
            <>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6 flex-wrap items-center justify-between">
                <SmartSearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, phone, or email..."
                />
                <div className="flex gap-4 items-center flex-wrap">
                  <SortFilterPanel sortBy={sortBy} onSortChange={setSortBy} />
                  <ViewSwitcher currentView={view} onViewChange={setView} />
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                    <p className="text-muted-foreground">Loading contacts...</p>
                  </div>
                </div>
              ) : (
                <>
                  {view === "card" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {sortedContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => setSelectedContactId(contact.id)}
                          className="text-left p-6 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="size-12">
                              {contact.profile_pic && (
                                <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />
                              )}
                              <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold text-foreground">
                              {searchQuery ? <HighlightedText text={contact.name} query={searchQuery} /> : contact.name}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {view === "grid" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {sortedContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => setSelectedContactId(contact.id)}
                          className="text-left p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors flex flex-col items-center text-center"
                        >
                          <Avatar className="size-10 mb-2">
                            {contact.profile_pic && (
                              <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />
                            )}
                            <AvatarFallback className="text-xs">{getInitials(contact.name)}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-semibold text-foreground truncate w-full">
                            {searchQuery ? <HighlightedText text={contact.name} query={searchQuery} /> : contact.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {view === "list" && (
                    <div className="bg-card border border-border rounded-lg overflow-x-auto mb-6">
                      <table className="w-full">
                        <thead className="bg-muted border-b border-border">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Transactions</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedContacts.map((contact) => {
                            const balance = getContactBalanceForSort(contact)
                            const txCount = getContactTransactionCountForSort(contact)
                            return (
                              <tr
                                key={contact.id}
                                onClick={() => setSelectedContactId(contact.id)}
                                className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="size-8">
                                      {contact.profile_pic && (
                                        <AvatarImage src={contact.profile_pic} alt={contact.name} />
                                      )}
                                      <AvatarFallback className="text-xs">{getInitials(contact.name)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium text-foreground">
                                      {searchQuery ? <HighlightedText text={contact.name} query={searchQuery} /> : contact.name}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{contact.phone || "-"}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{contact.email || "-"}</td>
                                <td className="px-6 py-4 text-sm text-right text-muted-foreground">{txCount}</td>
                                <td className={`px-6 py-4 text-sm font-semibold text-right ${balance >= 0 ? "text-secondary" : "text-destructive"}`}>
                                  {formatCurrency(balance, settings.currency)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {sortedContacts.length === 0 && (
                    <Card className="p-12 bg-card border border-border text-center">
                      <p className="text-muted-foreground text-lg">
                        {searchQuery ? "No contacts match your search." : "No contacts available. Add contacts to get started!"}
                      </p>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* Selected Contact Details and Actions */}
          {selectedContact ? (
            <>
              {/* Contact Header */}
              <Card className="p-4 md:p-6 bg-gradient-to-r from-muted/50 to-transparent border border-border mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16 md:size-20">
                      {selectedContact.profile_pic && (
                        <AvatarImage
                          src={selectedContact.profile_pic || "/placeholder.svg"}
                          alt={selectedContact.name}
                        />
                      )}
                      <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{selectedContact.name}</h2>
                      <p
                        className={`text-lg font-semibold ${runningBalance >= 0 ? "text-secondary" : "text-destructive"}`}
                      >
                        Balance: {formatCurrency(runningBalance, settings.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button
                      onClick={() => handleAddTransaction("give")}
                      className="flex-1 md:flex-none bg-destructive hover:bg-destructive/90 text-white"
                    >
                      You Give
                    </Button>
                    <Button
                      onClick={() => handleAddTransaction("got")}
                      className="flex-1 md:flex-none bg-secondary hover:bg-secondary/90 text-white"
                    >
                      You Got
                    </Button>
                    <Button
                      onClick={() => setSelectedContactId(null)}
                      variant="outline"
                      className="flex-1 md:flex-none"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Transactions Table */}
              {contactTransactions.length === 0 ? (
                <Card className="p-12 bg-card border border-border text-center">
                  <p className="text-muted-foreground text-lg">No transactions for this contact</p>
                </Card>
              ) : (
                <Card className="p-4 md:p-6 bg-card border border-border overflow-x-auto">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left py-3 px-2 text-foreground font-semibold">Date</th>
                          <th className="text-left py-3 px-2 text-foreground font-semibold">You Give</th>
                          <th className="text-left py-3 px-2 text-foreground font-semibold">You Got</th>
                          <th className="text-left py-3 px-2 text-foreground font-semibold">Description & Bills</th>
                          <th className="text-right py-3 px-2 text-foreground font-semibold">Balance</th>
                          <th className="text-center py-3 px-2 text-foreground font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactTransactions.map((t, idx) => {
                          const prevTransactions = contactTransactions.slice(idx + 1)
                          const balance = prevTransactions.reduce((sum, pt) => {
                            return sum + ((pt.you_got || 0) - (pt.you_give || 0))
                          }, 0)

                          return (
                            <tr key={t.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-2 text-foreground">{format(new Date(t.date), "MMM dd, yyyy")}</td>
                              <td
                                className={`py-3 px-2 font-semibold ${t.you_give ? "text-destructive" : "text-muted-foreground"}`}
                              >
                                {t.you_give ? formatCurrency(t.you_give || 0, settings.currency) : "-"}
                              </td>
                              <td
                                className={`py-3 px-2 font-semibold ${t.you_got ? "text-secondary" : "text-muted-foreground"}`}
                              >
                                {t.you_got ? formatCurrency(t.you_got || 0, settings.currency) : "-"}
                              </td>
                              <td className="py-3 px-2 text-foreground max-w-xs">
                                <div className="flex items-center gap-2">
                                  <span className="truncate">{t.description || "-"}</span>
                                  {t.bills && t.bills.length > 0 ? (
                                    <button
                                      onClick={() => {
                                        if (t.bills && t.bills.length > 0) {
                                          handleBillClick(t.bills[0])
                                        }
                                      }}
                                      className="p-1 hover:bg-muted rounded transition-colors"
                                      title={`${t.bills.length} bill(s) attached`}
                                    >
                                      <ImageIcon size={16} className="text-primary hover:text-primary/80 flex-shrink-0" />
                                    </button>
                                  ) : null}
                                </div>
                              </td>
                              <td
                                className={`py-3 px-2 text-right font-semibold ${balance >= 0 ? "text-secondary" : "text-destructive"}`}
                              >
                                {formatCurrency(balance, settings.currency)}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleEditTransaction(t)}
                                    className="p-2 hover:bg-muted rounded-md transition-colors"
                                    title="Edit transaction"
                                  >
                                    <Edit2 size={16} className="text-muted-foreground hover:text-foreground" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransaction(t.id)}
                                    className="p-2 hover:bg-muted rounded-md transition-colors"
                                    title="Delete transaction"
                                  >
                                    <Trash2 size={16} className="text-destructive hover:text-destructive/80" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 bg-card border border-border text-center">
              <p className="text-muted-foreground text-lg">Select a contact to view transactions</p>
            </Card>
          )}

          {/* Transaction Modal */}
          {modalType && !editingTransaction && selectedContact && (
            <AddTransactionModal
              isOpen={transactionModalOpen}
              onClose={() => setTransactionModalOpen(false)}
              onSubmit={handleAddTransactionSubmit}
              isLoading={operationLoading}
              contactId={selectedContact.id}
              disableContactChange={true}
            />
          )}
          
          {editingTransaction && (
            <EditTransactionModal
              isOpen={transactionModalOpen}
              onClose={() => setTransactionModalOpen(false)}
              transaction={editingTransaction}
              onSubmit={handleEditTransactionSubmit}
              isLoading={operationLoading}
              disableContactChange={true}
              disableTypeChange={true}
            />
          )}

          <BillViewerModal
            isOpen={billViewerOpen}
            onClose={() => {
              setBillViewerOpen(false)
              setSelectedBill(null)
            }}
            bill={selectedBill}
          />
        </main>
      </div>
    </div>
  )
}
