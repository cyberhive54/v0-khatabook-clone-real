'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Loader2, AlertCircle, Check } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'
import { useTransactions } from '@/hooks/use-transactions'
import { useContacts } from '@/hooks/use-contacts'

interface ImportTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportTransactionsModal({ isOpen, onClose }: ImportTransactionsModalProps) {
  const { addToast } = useToast()
  const { addTransaction } = useTransactions()
  const { contacts } = useContacts()
  const [isUploading, setIsUploading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && file.type !== 'application/json') {
        addToast('Please upload a CSV or JSON file', 'error')
        return
      }
      setUploadedFile(file)
    }
  }

  const handleImport = async () => {
    if (!uploadedFile) {
      addToast('Please select a file to import', 'error')
      return
    }

    setIsUploading(true)
    setImportProgress(0)

    try {
      const text = await uploadedFile.text()
      const transactions = uploadedFile.type === 'text/csv' ? parseCSV(text) : JSON.parse(text)

      let successCount = 0
      const total = transactions.length

      for (const transaction of transactions) {
        try {
          // Map contact name to contact id
          const contact = contacts.find(
            (c) => c.name.toLowerCase() === transaction.contact_name?.toLowerCase()
          )

          if (!contact) {
            console.warn(`Contact not found: ${transaction.contact_name}`)
            continue
          }

          await addTransaction({
            contact_id: contact.id,
            you_give: transaction.you_give || 0,
            you_got: transaction.you_got || 0,
            date: transaction.date,
            description: transaction.description || '',
            notes: transaction.notes || '',
          })

          successCount++
          setImportProgress(Math.round((successCount / total) * 100))
        } catch (err) {
          console.error('Error importing transaction:', err)
        }
      }

      addToast(`Successfully imported ${successCount} out of ${total} transactions`, 'success')
      setUploadedFile(null)
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import transactions'
      addToast(errorMessage, 'error')
    } finally {
      setIsUploading(false)
      setImportProgress(0)
    }
  }

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const transactions = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      if (values.length < headers.length) continue

      const transaction: any = {}
      headers.forEach((header, index) => {
        transaction[header] = values[index]
      })

      transactions.push({
        contact_name: transaction.contact_name || transaction.contact,
        you_give: parseFloat(transaction.you_give) || 0,
        you_got: parseFloat(transaction.you_got) || 0,
        date: transaction.date,
        description: transaction.description || '',
        notes: transaction.notes || '',
      })
    }

    return transactions
  }

  const downloadTemplate = () => {
    const template = `contact_name,you_give,you_got,date,description,notes
John Doe,100.00,0,2024-01-15,Lunch payment,
Jane Smith,0,50.00,2024-01-20,Borrowed money,Returned on 2024-02-01`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transaction-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Import Transactions</h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">Supported Formats</p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">Upload CSV or JSON files with transaction data. All contact names must exist in your contacts list.</p>
            </div>
          </div>

          {/* File Upload */}
          {!uploadedFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={isUploading}
              />
              <label
                htmlFor="file-input"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">CSV or JSON files only</p>
                </div>
              </label>
            </div>
          ) : (
            <Card className="p-4 bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <button
                  onClick={() => setUploadedFile(null)}
                  disabled={isUploading}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </Card>
          )}

          {/* Progress */}
          {isUploading && importProgress > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Importing...</p>
                <p className="text-sm font-semibold text-primary">{importProgress}%</p>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Template Download */}
          <Button
            type="button"
            onClick={downloadTemplate}
            disabled={isUploading}
            variant="outline"
            className="w-full border-border"
          >
            Download CSV Template
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleImport}
              disabled={!uploadedFile || isUploading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isUploading}
              className="border-border"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
