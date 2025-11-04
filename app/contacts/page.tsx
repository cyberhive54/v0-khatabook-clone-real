"use client"

import type React from "react"

import { useState } from "react"
import { useContacts, type Contact } from "@/hooks/use-contacts"
import { useContactBalance } from "@/hooks/use-contact-balance"
import { useSettings } from "@/hooks/use-settings"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ContactDetailModal } from "@/components/contact-detail-modal"
import { Trash2, Edit2, Plus, Upload, X, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"

export default function ContactsPage() {
  const { contacts, addContact, deleteContact, updateContact, isLoading } = useContacts()
  const { settings } = useSettings()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    profile_pic: "",
  })
  const [uploadedImage, setUploadedImage] = useState<string>("")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setUploadedImage(dataUrl)
        setFormData({ ...formData, profile_pic: dataUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateContact(editingId, formData)
        setEditingId(null)
      } else {
        await addContact(formData)
      }
      setFormData({ name: "", phone: "", email: "", address: "", notes: "", profile_pic: "" })
      setUploadedImage("")
      setShowForm(false)
    } catch (error) {
      console.error("Error saving contact:", error)
    }
  }

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      notes: contact.notes,
      profile_pic: contact.profile_pic || "",
    })
    setUploadedImage(contact.profile_pic || "")
    setEditingId(contact.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id)
    } catch (error) {
      console.error("Error deleting contact:", error)
    }
  }

  const handleViewDetails = (contactId: string) => {
    setSelectedContactId(contactId)
    setShowDetailModal(true)
  }

  const selectedContact = contacts.find((c) => c.id === selectedContactId)

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navigation />
      <div className="flex-1">
        <AppHeader />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <Button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({ name: "", phone: "", email: "", address: "", notes: "", profile_pic: "" })
                setUploadedImage("")
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={20} className="mr-2" />
              Add Contact
            </Button>
          </div>

          {showForm && (
            <Card className="p-6 bg-card border border-border mb-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {editingId ? "Edit Contact" : "New Contact"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                          <div className="flex items-center gap-2">
                            <Upload size={20} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {uploadedImage ? "Change picture" : "Upload picture"}
                            </span>
                          </div>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                      {uploadedImage && (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-12">
                            <AvatarImage src={uploadedImage || "/placeholder.svg"} alt="preview" />
                            <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                          </Avatar>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImage("")
                              setFormData({ ...formData, profile_pic: "" })
                            }}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <X size={18} className="text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
                  <textarea
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="col-span-2 px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
                  <textarea
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="col-span-2 px-4 py-2 border border-border rounded-lg bg-input text-foreground"
                  />
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
                      setUploadedImage("")
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onView={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getInitials={getInitials}
                settings={settings}
              />
            ))}
          </div>

          {contacts.length === 0 && !showForm && (
            <Card className="p-12 bg-card border border-border text-center">
              <p className="text-muted-foreground text-lg">No contacts yet. Add one to get started!</p>
            </Card>
          )}
        </main>
      </div>

      <ContactDetailModal
        contactId={selectedContactId}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        contact={selectedContact}
      />
    </div>
  )
}

function ContactCard({
  contact,
  onView,
  onEdit,
  onDelete,
  getInitials,
  settings,
}: {
  contact: Contact
  onView: (id: string) => void
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
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
          <button onClick={() => onDelete(contact.id)} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
