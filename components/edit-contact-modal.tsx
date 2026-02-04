"use client"

import React, { useState, useEffect } from "react"
import { ModalForm } from "@/components/modal-form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/contexts/toast-context"
import type { Contact } from "@/hooks/use-contacts"

interface EditContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onSubmit: (id: string, updates: Partial<Contact>) => Promise<void>
  isLoading?: boolean
}

export function EditContactModal({
  isOpen,
  onClose,
  contact,
  onSubmit,
  isLoading = false,
}: EditContactModalProps) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        name: contact.name || "",
        phone: contact.phone || "",
        email: contact.email || "",
        address: contact.address || "",
        notes: contact.notes || "",
      })
    }
  }, [contact, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contact) return

    if (!formData.name.trim()) {
      addToast("Please enter a contact name", "error")
      return
    }

    try {
      await onSubmit(contact.id, formData)
      addToast("Contact updated successfully", "success")
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update contact"
      addToast(message, "error")
    }
  }

  return (
    <ModalForm
      isOpen={isOpen}
      title="Edit Contact"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitButtonText="Update Contact"
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contact name"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Phone
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone number"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Address
          </label>
          <Input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            rows={3}
          />
        </div>
      </div>
    </ModalForm>
  )
}
