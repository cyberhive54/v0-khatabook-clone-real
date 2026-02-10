"use client"

import { useState } from "react"
import { useContacts } from "@/hooks/use-contacts"
import { useTransactions } from "@/hooks/use-transactions"
import { useContactBalances } from "@/hooks/use-contact-balances"
import { useSettings } from "@/hooks/use-settings"
import { formatCurrency } from "@/lib/currency-utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, Users, Receipt, Wallet, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LedgerTransactionModal } from "@/components/ledger-transaction-modal"

export default function Dashboard() {
  const router = useRouter()
  const { contacts, isLoading: contactsLoading } = useContacts()
  const { transactions, isLoading: transactionsLoading } = useTransactions()
  const { getBalance } = useContactBalances()
  const { settings } = useSettings()
  const [contactsFilter, setContactsFilter] = useState("all")
  const [contactsSortBy, setContactsSortBy] = useState("recent")
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [selectedModalContact, setSelectedModalContact] = useState<any>(null)
  const [modalType, setModalType] = useState<"give" | "got" | null>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getFilteredAndSortedContacts = () => {
    const contactsWithLastTransaction = contacts.map((c) => {
      const lastTransaction = transactions
        .filter((t) => t.contact_id === c.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      const balance = getBalance(c.id)

      return { ...c, balance, lastTransaction }
    })

    let filtered = contactsWithLastTransaction

    if (contactsFilter === "you_got") {
      filtered = filtered.filter((c) => c.balance < 0) // You got (owe them) = negative balance
    } else if (contactsFilter === "you_give") {
      filtered = filtered.filter((c) => c.balance > 0) // You give (they owe) = positive balance
    } else if (contactsFilter === "settled") {
      filtered = filtered.filter((c) => c.balance === 0)
    }

    if (contactsSortBy === "recent") {
      filtered.sort(
        (a, b) => new Date(b.lastTransaction?.date || 0).getTime() - new Date(a.lastTransaction?.date || 0).getTime(),
      )
    } else if (contactsSortBy === "highest") {
      filtered.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    } else if (contactsSortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (contactsSortBy === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.lastTransaction?.date || 0).getTime() - new Date(b.lastTransaction?.date || 0).getTime(),
      )
    } else if (contactsSortBy === "least") {
      filtered.sort((a, b) => Math.abs(a.balance) - Math.abs(b.balance))
    }

    return filtered.slice(0, 10)
  }

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((t) => ({
      ...t,
      contact: contacts.find((c) => c.id === t.contact_id),
    }))

  const dashboardContacts = getFilteredAndSortedContacts()

  const handleContactClick = (contactId: string) => {
    router.push(`/ledger?contact=${contactId}`)
  }

  const handleOpenTransactionModal = (contact: any, type: "give" | "got") => {
    setSelectedModalContact(contact)
    setModalType(type)
    setTransactionModalOpen(true)
  }

  // Calculate final balance for each contact, then sum positive (you will give) and negative (you will get)
  const contactBalances: { [key: string]: number } = {}
  
  contacts.forEach((contact) => {
    const balance = getBalance(contact.id)
    contactBalances[contact.id] = balance
  })

  // Sum positive balances (they owe us - green) and negative balances (we owe them - red)
  const totalYouWillGive = Object.values(contactBalances).reduce((sum, balance) => {
    return sum + (balance > 0 ? balance : 0)
  }, 0)
  
  const totalYouWillGet = Object.values(contactBalances).reduce((sum, balance) => {
    return sum + (balance < 0 ? Math.abs(balance) : 0)
  }, 0)
  
  const netBalance = totalYouWillGive - totalYouWillGet

  const isLoading = contactsLoading || transactionsLoading

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <AppHeader />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Net Balance - First Card */}
            <Card className="p-6 bg-card border border-border md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Net Balance</p>
                  <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-secondary" : "text-destructive"}`}>
                    {isLoading ? "..." : formatCurrency(netBalance || 0, settings.currency)}
                  </p>
                </div>
                <Wallet className={netBalance >= 0 ? "text-secondary" : "text-destructive"} size={32} />
              </div>
            </Card>

            {/* You will get - Second Card */}
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">You will get</p>
                  <p className="text-2xl font-bold text-secondary">
                    {isLoading ? "..." : formatCurrency(totalYouWillGet || 0, settings.currency)}
                  </p>
                </div>
                <TrendingUp className="text-secondary" size={32} />
              </div>
            </Card>

            {/* You will give - Third Card */}
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">You will give</p>
                  <p className="text-2xl font-bold text-destructive">
                    {isLoading ? "..." : formatCurrency(totalYouWillGive || 0, settings.currency)}
                  </p>
                </div>
                <Receipt className="text-destructive" size={32} />
              </div>
            </Card>

            {/* Total Contacts - Fourth Card */}
            <Card className="p-6 bg-card border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Contacts</p>
                  <p className="text-2xl font-bold text-primary">{contacts.length}</p>
                </div>
                <Users className="text-primary" size={32} />
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-card border border-border mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Contacts</h2>
              <div className="flex gap-2">
                <select
                  value={contactsFilter}
                  onChange={(e) => setContactsFilter(e.target.value)}
                  className="px-3 py-1 text-sm border border-border rounded-lg bg-input text-foreground"
                >
                  <option value="all">All</option>
                  <option value="you_got">You will get</option>
                  <option value="you_give">You will give</option>
                  <option value="settled">Settled</option>
                </select>
                <select
                  value={contactsSortBy}
                  onChange={(e) => setContactsSortBy(e.target.value)}
                  className="px-3 py-1 text-sm border border-border rounded-lg bg-input text-foreground"
                >
                  <option value="recent">Most recent</option>
                  <option value="highest">Highest amount</option>
                  <option value="name">By name (A-Z)</option>
                  <option value="oldest">Oldest</option>
                  <option value="least">Least amount</option>
                </select>
              </div>
            </div>
            {dashboardContacts.length === 0 ? (
              <p className="text-muted-foreground">No contacts yet</p>
            ) : (
              <div className="space-y-3">
                {dashboardContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactClick(contact.id)}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="size-10">
                        {contact.profile_pic && (
                          <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />
                        )}
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.lastTransaction
                            ? format(new Date(contact.lastTransaction.date), "MMM dd, yyyy")
                            : "No transactions"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold text-sm ${
                          contact.balance >= 0 ? "text-secondary" : "text-destructive"
                        }`}
                      >
                        {formatCurrency(contact.balance || 0, settings.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
              <Link href="/transactions">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  View all <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-center pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        {t.contact?.profile_pic && (
                          <AvatarImage
                            src={t.contact.profile_pic || "/placeholder.svg"}
                            alt={t.contact?.name || "Unknown"}
                          />
                        )}
                        <AvatarFallback>{getInitials(t.contact?.name || "Unknown")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.contact?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${t.you_give ? "text-secondary" : "text-destructive"}`}>
                      {t.you_give && t.you_give > 0
                        ? `Will get ${formatCurrency(t.you_give || 0, settings.currency)}`
                        : `Will give ${formatCurrency(t.you_got || 0, settings.currency)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <LedgerTransactionModal
            open={transactionModalOpen}
            onOpenChange={setTransactionModalOpen}
            contact={selectedModalContact}
            transactionType={modalType}
          />
        </main>
      </div>
    </div>
  )
}
