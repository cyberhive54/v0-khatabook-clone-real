"use client"

import React, { useState, useEffect, useMemo } from "react"
import { ModalForm } from "@/components/modal-form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/contexts/toast-context"
import { useContacts } from "@/hooks/use-contacts"
import { CalendarPicker } from "@/components/calendar-picker"
import { X, ImageIcon } from "lucide-react"
import type { Transaction, Bill } from "@/hooks/use-transactions"

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  onSubmit: (id: string, updates: Partial<Transaction>, bills: Omit<Bill, "id" | "transaction_id">[]) => Promise<void>
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
  const { contacts } = useContacts()
  const [transactionType, setTransactionType] = useState<"you_give" | "you_got">("you_give")
  const [formData, setFormData] = useState({
    contact_id: "",
    amount: 0,
    transaction_date: "",
    description: "",
    notes: "",
  })
  const [bills, setBills] = useState<Omit<Bill, "id" | "transaction_id">[]>([])
  const [newBills, setNewBills] = useState<Omit<Bill, "id" | "transaction_id">[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  const [amountError, setAmountError] = useState("")
  const [billError, setBillError] = useState("")

  useEffect(() => {
    if (transaction && isOpen) {
      const type = (transaction.you_give || 0) > 0 ? "you_give" : "you_got"
      const amount = (transaction.you_give || 0) > 0 ? transaction.you_give : transaction.you_got

      setTransactionType(type)
      setFormData({
        contact_id: transaction.contact_id,
        amount: amount || 0,
        transaction_date: transaction.date || "",
        description: transaction.description || "",
        notes: transaction.notes || "",
      })
      setBills(transaction.bills || [])
      setNewBills([])
      setSearchTerm("")
      setAmountError("")
      setBillError("")
    }
  }, [transaction, isOpen])

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    )
  }, [searchTerm, contacts])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    const match = value.match(/^\d*\.?\d{0,2}/)
    if (match) {
      setFormData((prev) => ({ ...prev, amount: parseFloat(match[0]) || 0 }))
      setAmountError("")
    } else {
      setAmountError("Only numbers with up to 2 decimal places allowed")
    }
  }

  const handleBillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.size > 5 * 1024 * 1024) {
        setBillError(`Bill ${i + 1} exceeds 5 MB limit`)
        continue
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setNewBills((prev) => [
          ...prev,
          {
            image_url: base64,
            bill_number: undefined,
            bill_date: undefined,
            bill_amount: undefined,
            notes: undefined,
          },
        ])
        setBillError("")
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBill = (index: number) => {
    setBills(bills.filter((_, i) => i !== index))
  }

  const removeNewBill = (index: number) => {
    setNewBills(newBills.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transaction) return

    if (!formData.contact_id) {
      addToast("Please select a contact", "error")
      return
    }

    if (formData.amount <= 0) {
      addToast("Please enter a valid amount", "error")
      return
    }

    if (amountError) {
      addToast("Please fix amount errors", "error")
      return
    }

    if (billError) {
      addToast("Please fix bill errors", "error")
      return
    }

    try {
      const transactionData = {
        contact_id: formData.contact_id,
        you_give: transactionType === "you_give" ? formData.amount : 0,
        you_got: transactionType === "you_got" ? formData.amount : 0,
        date: formData.transaction_date,
        description: formData.description,
        notes: formData.notes,
      }

      // Combine existing and new bills
      const allBills = [...newBills]

      await onSubmit(transaction.id, transactionData, allBills)
      addToast("Transaction updated successfully", "success")
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update transaction"
      addToast(message, "error")
    }
  }

  const selectedContact = contacts.find((c) => c.id === formData.contact_id)

  return (
    <ModalForm
      isOpen={isOpen}
      title="Edit Transaction"
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitButtonText="Update Transaction"
    >
      <div className="space-y-4">
        {/* Tabbed Switch */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setTransactionType("you_give")}
            className={`px-4 py-2 font-medium transition-colors ${
              transactionType === "you_give"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            You Gave
          </button>
          <button
            onClick={() => setTransactionType("you_got")}
            className={`px-4 py-2 font-medium transition-colors ${
              transactionType === "you_got"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            You Got
          </button>
        </div>

        {/* Contact Selection with Live Search */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Contact *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search contact by name or phone..."
              value={searchTerm || selectedContact?.name || ""}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowContactDropdown(true)
              }}
              onFocus={() => setShowContactDropdown(true)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />

            {showContactDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, contact_id: contact.id }))
                        setSearchTerm("")
                        setShowContactDropdown(false)
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                    >
                      <div className="font-medium text-foreground">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.phone || contact.email}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No contacts found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Amount *
          </label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={formData.amount || ""}
            onChange={handleAmountChange}
            disabled={isLoading}
            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {amountError && <p className="text-xs text-destructive mt-1">{amountError}</p>}
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Date *
          </label>
          <CalendarPicker
            value={formData.transaction_date}
            onChange={(date) => setFormData((prev) => ({ ...prev, transaction_date: date }))}
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <Input
            type="text"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Transaction description"
            disabled={isLoading}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            rows={2}
          />
        </div>

        {/* Bill Upload */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Transaction Bills</h3>

          {/* Existing Bills */}
          {bills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Existing bills:</p>
              <div className="grid grid-cols-3 gap-3">
                {bills.map((bill, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={bill.image_url}
                      alt={`Bill ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeBill(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Bills */}
          <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center">
              <ImageIcon size={20} className="text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Click to add more bills (max 5 MB each)
              </span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBillUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          {billError && <p className="text-xs text-destructive mt-2">{billError}</p>}

          {newBills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">New bills:</p>
              <div className="grid grid-cols-3 gap-3">
                {newBills.map((bill, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={bill.image_url}
                      alt={`Bill ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewBill(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalForm>
  )
}
