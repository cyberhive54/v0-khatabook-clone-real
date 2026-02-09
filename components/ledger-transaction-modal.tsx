"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTransactions } from "@/hooks/use-transactions"
import { format } from "date-fns"
import { Upload, X } from "lucide-react"

interface LedgerTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: any
  transactionType: "give" | "got" | null
  editingTransaction?: any
}

export function LedgerTransactionModal({
  open,
  onOpenChange,
  contact,
  transactionType,
  editingTransaction,
}: LedgerTransactionModalProps) {
  const { addTransaction, updateTransaction } = useTransactions()
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [billPhotos, setBillPhotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && editingTransaction) {
      setAmount(String(editingTransaction.you_give || editingTransaction.you_got || ""))
      setDate(format(new Date(editingTransaction.date), "yyyy-MM-dd"))
      setDescription(editingTransaction.description || "")
      setNotes(editingTransaction.notes || "")
      setBillPhotos(editingTransaction.bill_photos || [])
    } else if (open) {
      setAmount("")
      setDate(format(new Date(), "yyyy-MM-dd"))
      setDescription("")
      setNotes("")
      setBillPhotos([])
    }
  }, [open, editingTransaction])

  const handleSave = async () => {
    if (!amount || !contact || !transactionType) return

    setIsLoading(true)
    try {
      const transactionData = {
        contact_id: contact.id,
        date,
        description,
        notes,
        you_give: transactionType === "give" ? Number.parseFloat(amount) : 0,
        you_got: transactionType === "got" ? Number.parseFloat(amount) : 0,
      }


      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData, editingTransaction.bills || [])
      } else {
        await addTransaction(transactionData)
      }

      // Reset form
      setAmount("")
      setDescription("")
      setNotes("")
      setBillPhotos([])
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!contact || !transactionType) return null

  const typeLabel = transactionType === "give" ? "You Give" : "You Got"
  const buttonColor =
    transactionType === "give" ? "bg-destructive hover:bg-destructive/90" : "bg-secondary hover:bg-secondary/90"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">
            {editingTransaction ? "Edit Transaction" : "Add Transaction"} - {typeLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contact Info - Display Only */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Contact</p>
            <p className="font-semibold text-foreground">{contact.name}</p>
          </div>

          {/* Transaction Type - Display Only */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Transaction Type</p>
            <p className={`font-semibold ${transactionType === "give" ? "text-destructive" : "text-secondary"}`}>
              {typeLabel}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Amount *</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full"
              autoFocus
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full" />
          </div>

          {/* Description Input */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Description (Optional)</label>
            <Input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Notes (Optional)</label>
            <Input
              type="text"
              placeholder="Enter notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Bill Photo Upload - Placeholder */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Bill Photos (Optional)</label>
            <div className="p-4 border-2 border-dashed border-border rounded-lg text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.currentTarget.files
                  if (!files) return

                  for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    const reader = new FileReader()

                    reader.onload = (event) => {
                      const base64 = event.target?.result as string
                      setBillPhotos([...billPhotos, base64])
                    }

                    reader.readAsDataURL(file)
                  }
                }}
                id="bill-upload"
                className="hidden"
              />
              <label htmlFor="bill-upload" className="cursor-pointer block">
                <Upload size={20} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Click to upload bill photos</p>
                <p className="text-xs text-muted-foreground">Drag and drop or click to select</p>
              </label>
            </div>
            {billPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {billPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Bill ${index + 1}`}
                      className="w-full h-20 object-cover rounded border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setBillPhotos(billPhotos.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!amount || isLoading} className={`flex-1 text-white ${buttonColor}`}>
            {isLoading ? "Saving..." : editingTransaction ? "Update Transaction" : "Save Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
