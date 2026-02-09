"use client"

import type React from "react"

import { useState } from "react"
import { useContacts, type Contact } from "@/hooks/use-contacts"
import { useContactBalance } from "@/hooks/use-contact-balance"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/contexts/toast-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ContactDetailModal } from "@/components/contact-detail-modal"
import { AddContactModal } from "@/components/add-contact-modal"
import { EditContactModal } from "@/components/edit-contact-modal"
import { DeleteContactModal } from "@/components/delete-contact-modal"
import { Trash2, Edit2, Plus, Eye, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"

export default function ContactsPage() {
  const { contacts, addContact, deleteContact, updateContact, operationLoading, isLoading } = useContacts()
  const { settings } = useSettings()
  const { addToast } = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <AppHeader />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={20} className="mr-2" />
              Add Contact
            </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onView={handleViewDetails}
                    onEdit={handleEdit}
                    onDeleteClick={handleDeleteClick}
                    getInitials={getInitials}
                    settings={settings}
                  />
                ))}
              </div>

              {contacts.length === 0 && (
                <Card className="p-12 bg-card border border-border text-center">
                  <p className="text-muted-foreground text-lg">No contacts yet. Add one to get started!</p>
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
}: {
  contact: Contact
  onView: (id: string) => void
  onEdit: (contact: Contact) => void
  onDeleteClick: (contact: Contact) => void
  getInitials: (name: string) => string
  settings: any
}) {
  const balance = useContactBalance(contact.id)

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            {contact.profile_pic && <AvatarImage src={contact.profile_pic || "/placeholder.svg"} alt={contact.name} />}
            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-foreground">{contact.name}</h3>
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
