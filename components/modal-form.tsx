"use client"

import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModalFormProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  isLoading?: boolean
  children: React.ReactNode
  submitButtonText?: string
  submitButtonVariant?: "default" | "destructive"
}

export function ModalForm({
  isOpen,
  title,
  onClose,
  onSubmit,
  isLoading = false,
  children,
  submitButtonText = "Save",
  submitButtonVariant = "default",
}: ModalFormProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}

          {/* Footer */}
          <div className="flex gap-2 pt-4 border-t border-border mt-6">
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
              type="submit"
              variant={submitButtonVariant}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Loading..." : submitButtonText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
