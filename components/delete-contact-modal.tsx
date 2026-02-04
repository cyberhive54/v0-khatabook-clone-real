"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/contexts/toast-context"
import { AlertCircle } from "lucide-react"
import type { Contact } from "@/hooks/use-contacts"

interface DeleteContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onConfirm: (id: string) => Promise<void>
  isLoading?: boolean
}

export function DeleteContactModal({
  isOpen,
  onClose,
  contact,
  onConfirm,
  isLoading = false,
}: DeleteContactModalProps) {
  const { addToast } = useToast()

  const handleDelete = async () => {
    if (!contact) return

    try {
      await onConfirm(contact.id)
      addToast("Contact deleted successfully", "success")
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete contact"
      addToast(message, "error")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-lg shadow-lg p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Contact</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{contact?.name}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
