"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useContacts, type Contact } from "@/hooks/use-contacts"
import { useContactBalance } from "@/hooks/use-contact-balance"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/contexts/toast-context"
import { useTransactions } from "@/hooks/use-transactions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ContactDetailModal } from "@/components/contact-detail-modal"
import { AddContactModal } from "@/components/add-contact-modal"
import { EditContactModal } from "@/components/edit-contact-modal"
import { DeleteContactModal } from "@/components/delete-contact-modal"
import { ViewSwitcher } from "@/components/view-switcher"
import { SmartSearchInput } from "@/components/smart-search-input"
import { SortFilterPanel } from "@/components/sort-filter-panel"
import { Trash2, Edit2, Plus, Eye, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import { smartSearch, highlightText, sortContacts } from "@/lib/search-utils"

type ViewType = "card" | "list" | "grid"
type SortBy = "name-az" | "name-za" | "added-latest" | "added-oldest" | "balance-highest" | "balance-lowest" | "transaction-latest" | "transaction-oldest" | "all"

export default function ContactsPage() {
  const { contacts, addContact, deleteContact, updateContact, operationLoading, isLoading } = useContacts()
  const { transactions } = useTransactions()
  const { settings } = useSettings()
  const { addToast } = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [view, setView] = useState<ViewType>("card")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("added-latest")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setShowEditModal(true)
  }

  const handleDeleteClick = (contact: Contact) => {
    setSelectedContact(contact)
    setShowDeleteModal(true)
  }

  const handleViewDetails = (contactId: string) => {
    setSelectedContactId(contactId)
    setShowDetailModal(true)
  }

  const currentDetailContact = contacts.find((c) => c.id === selectedContactId)

  const getContactBalance = (contactId: string): number => {
    return transactions
      .filter((t) => t.contact_id === contactId)
      .reduce((sum, t) => sum + (t.you_got || 0) - (t.you_give || 0), 0)
  }

  const getContactTransactionCount = (contactId: string): number => {
    return transactions.filter((t) => t.contact_id === contactId).length
  }

  const searchResults = useMemo(() => {
    const results = smartSearch(contacts, searchQuery, ["name", "phone", "email"])
    return results.map((r) => r.item)
  }, [contacts, searchQuery])

  const sortedContacts = useMemo(() => {
    return sortContacts(searchResults, sortBy, getContactBalance, getContactTransactionCount)
  }, [searchResults, sortBy])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <AppHeader />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={20} className="mr-2" />
              Add Contact
            </Button>
          </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onView={handleViewDetails}
                      onEdit={handleEdit}
                      onDeleteClick={handleDeleteClick}
                      getInitials={getInitials}
                      settings={settings}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              )}

              {view === "grid" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sortedContacts.map((contact) => (
                    <ContactGridCard
                      key={contact.id}
                      contact={contact}
                      onView={handleViewDetails}
                      onEdit={handleEdit}
                      onDeleteClick={handleDeleteClick}
                      getInitials={getInitials}
                      settings={settings}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              )}

              {view === "list" && (
                <div className="bg-card border border-border rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Balance</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedContacts.map((contact) => {
                        const balance = getContactBalance(contact.id)
                        return (
                          <tr key={contact.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8">
                                  {contact.profile_pic && <AvatarImage src={contact.profile_pic} alt={contact.name} />}
                                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {searchQuery ? highlightText(contact.name, searchQuery) : contact.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{contact.phone || "-"}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{contact.email || "-"}</td>
                            <td className={`px-6 py-4 text-sm font-semibold text-right ${balance >= 0 ? "text-secondary" : "text-destructive"}`}>
                              {formatCurrency(balance, settings.currency)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleViewDetails(contact.id)}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye size={16} className="text-primary" />
                                </button>
                                <button
                                  onClick={() => handleEdit(contact)}
                                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} className="text-primary" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(contact)}
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
                </div>
              )}

              {sortedContacts.length === 0 && (
                <Card className="p-12 bg-card border border-border text-center">
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? "No contacts match your search." : "No contacts yet. Add one to get started!"}
                  </p>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      <ContactDetailModal
        contactId={selectedContactId}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        contact={currentDetailContact}
      />

      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addContact}
        isLoading={operationLoading}
      />

      <EditContactModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedContact(null)
        }}
        contact={selectedContact}
        onSubmit={updateContact}
        isLoading={operationLoading}
      />

      <DeleteContactModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedContact(null)
        }}
        contact={selectedContact}
        onConfirm={deleteContact}
        isLoading={operationLoading}
      />
    </div>
  )
}

function ContactCard({
  contact,
  onView,
  onEdit,
  onDeleteClick,
  getInitials,
  settings,
  searchQuery,
}: {
  contact: Contact
  onView: (id: string) => void
  onEdit: (contact: Contact) => void
  onDeleteClick: (contact: Contact) => void
  getInitials: (name: string) => string
  settings: any
  searchQuery?: string
}) {
  const balance = useContactBalance(contact.id)

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="size-12">
            {contact.profile_pic && <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />}
            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-foreground">
            {searchQuery ? highlightText(contact.name, searchQuery) : contact.name}
          </h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onView(contact.id)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={18} className="text-primary" />
          </button>
          <button onClick={() => onEdit(contact)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit2 size={18} className="text-primary" />
          </button>
          <button onClick={() => onDeleteClick(contact)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Trash2 size={18} className="text-destructive" />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        {contact.phone && <p>Phone: {contact.phone}</p>}
        {contact.email && <p>Email: {contact.email}</p>}
        <p className={`font-semibold ${balance >= 0 ? "text-secondary" : "text-destructive"}`}>
          Balance: {formatCurrency(balance, settings.currency)}
        </p>
      </div>
    </Card>
  )
}

function ContactGridCard({
  contact,
  onView,
  onEdit,
  onDeleteClick,
  getInitials,
  settings,
  searchQuery,
}: {
  contact: Contact
  onView: (id: string) => void
  onEdit: (contact: Contact) => void
  onDeleteClick: (contact: Contact) => void
  getInitials: (name: string) => string
  settings: any
  searchQuery?: string
}) {
  const balance = useContactBalance(contact.id)

  return (
    <Card className="p-4 bg-card border border-border flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <Avatar className="size-10">
          {contact.profile_pic && <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />}
          <AvatarFallback className="text-xs">{getInitials(contact.name)}</AvatarFallback>
        </Avatar>
        <div className="flex gap-1">
          <button onClick={() => onView(contact.id)} className="p-1 hover:bg-muted rounded transition-colors">
            <Eye size={14} className="text-primary" />
          </button>
          <button onClick={() => onEdit(contact)} className="p-1 hover:bg-muted rounded transition-colors">
            <Edit2 size={14} className="text-primary" />
          </button>
          <button onClick={() => onDeleteClick(contact)} className="p-1 hover:bg-muted rounded transition-colors">
            <Trash2 size={14} className="text-destructive" />
          </button>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground truncate mb-2">
        {searchQuery ? highlightText(contact.name, searchQuery) : contact.name}
      </h3>
      <p className={`text-xs font-semibold ${balance >= 0 ? "text-secondary" : "text-destructive"}`}>
        {formatCurrency(balance, settings.currency)}
      </p>
    </Card>
  )
}
