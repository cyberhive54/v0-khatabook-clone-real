"use client"

import React, { useState, useEffect } from "react"
import { ModalForm } from "@/components/modal-form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/contexts/toast-context"
import type { Transaction } from "@/hooks/use-transactions"

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  onSubmit: (id: string, updates: Partial<Transaction>) => Promise<void>
  isLoading?: boolean
}

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  isLoading = false,
}: EditTransactionModalProps) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    description: "",
    you_give: 0,
    you_got: 0,
    transaction_date: "",
    status: "unsettled",
  })

  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        description: transaction.description || "",
        you_give: transaction.you_give || 0,
        you_got: transaction.you_got || 0,
        transaction_date: transaction.transaction_date || "",
        status: transaction.status || "unsettled",
      })
    }
  }, [transaction, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transaction) return

    if (formData.you_give === 0 && formData.you_got === 0) {
      addToast("Please enter an amount for either 'Will Get' or 'Will Give'", "error")
      return
    }

    try {
      await onSubmit(transaction.id, formData)
      addToast("Transaction updated successfully", "success")
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update transaction"
      addToast(message, "error")
    }
  }

  return (
    <ModalForm
      isOpen={isOpen}
      title="Edit Transaction"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitButtonText="Update Transaction"
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <Input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Transaction description"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Will Get (Amount I gave)
            </label>
            <Input
              type="number"
              name="you_give"
              value={formData.you_give}
              onChange={handleChange}
              placeholder="0.00"
              disabled={isLoading}
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Will Give (Amount I got)
            </label>
            <Input
              type="number"
              name="you_got"
              value={formData.you_got}
              onChange={handleChange}
              placeholder="0.00"
              disabled={isLoading}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Date
          </label>
          <Input
            type="date"
            name="transaction_date"
            value={formData.transaction_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="unsettled">Unsettled</option>
            <option value="settled">Settled</option>
          </select>
        </div>
      </div>
    </ModalForm>
  )
}
