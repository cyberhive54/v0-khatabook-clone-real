"use client"

import { useState, useEffect } from "react"
import { useContacts } from "@/hooks/use-contacts"
import { useTransactions } from "@/hooks/use-transactions"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LedgerTransactionModal } from "@/components/ledger-transaction-modal"
import { format } from "date-fns"
import { Edit2, Trash2, ImageIcon } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { formatCurrency } from "@/lib/currency-utils"

export default function LedgerPage() {
  const searchParams = useSearchParams()
  const { contacts } = useContacts()
  const { transactions, deleteTransaction } = useTransactions()
  const { settings } = useSettings()
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"give" | "got" | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)

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

  const handleAddTransaction = (type: "give" | "got") => {
    if (!selectedContact) return
    setEditingTransaction(null)
    setModalType(type)
    setTransactionModalOpen(true)
  }

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction)
    setModalType(transaction.you_give ? "give" : "got")
    setTransactionModalOpen(true)
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(transactionId)
    }
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
            <Card className="p-6 bg-card border border-border mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Select Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        {contact.profile_pic && (
                          <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />
                        )}
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
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
                                  {t.bill_photos && t.bill_photos.length > 0 && (
                                    <ImageIcon size={16} className="text-muted-foreground flex-shrink-0" />
                                  )}
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
          <LedgerTransactionModal
            open={transactionModalOpen}
            onOpenChange={setTransactionModalOpen}
            contact={selectedContact}
            transactionType={modalType}
            editingTransaction={editingTransaction}
          />
        </main>
      </div>
    </div>
  )
}
