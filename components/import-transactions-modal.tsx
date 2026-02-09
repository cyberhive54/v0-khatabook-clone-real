'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Loader2, AlertCircle, Check, Download } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'
import { useTransactions, type Bill } from '@/hooks/use-transactions'
import { useContacts } from '@/hooks/use-contacts'

interface ImportTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export function ImportTransactionsModal({ isOpen, onClose }: ImportTransactionsModalProps) {
  const { addToast } = useToast()
  const { addTransaction } = useTransactions()
  const { contacts } = useContacts()
  const [isUploading, setIsUploading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [format, setFormat] = useState<'csv' | 'json'>('csv')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv')
      const isJSON = file.type === 'application/json' || file.name.endsWith('.json')
      
      if (!isCSV && !isJSON) {
        addToast('Please upload a CSV or JSON file', 'error')
        return
      }
      
      setFormat(isCSV ? 'csv' : 'json')
      setUploadedFile(file)
      setValidationErrors([])
    }
  }

  const validateTransaction = (data: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!data.contact_name || typeof data.contact_name !== 'string') {
      errors.push({ row: rowIndex, field: 'contact_name', message: 'Contact name is required' })
    }

    if (typeof data.you_give !== 'number' || data.you_give < 0) {
      errors.push({ row: rowIndex, field: 'you_give', message: 'you_give must be a non-negative number' })
    }

    if (typeof data.you_got !== 'number' || data.you_got < 0) {
      errors.push({ row: rowIndex, field: 'you_got', message: 'you_got must be a non-negative number' })
    }

    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      errors.push({ row: rowIndex, field: 'date', message: 'date must be in YYYY-MM-DD format' })
    }

    if (data.you_give === 0 && data.you_got === 0) {
      errors.push({ row: rowIndex, field: 'amount', message: 'Either you_give or you_got must be greater than 0' })
    }

    return errors
  }

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const transactions = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))

      const transaction: any = {}
      headers.forEach((header, index) => {
        if (index < values.length) {
          transaction[header] = values[index]
        }
      })

      transactions.push({
        contact_name: transaction.contact_name || '',
        you_give: parseFloat(transaction.you_give) || 0,
        you_got: parseFloat(transaction.you_got) || 0,
        date: transaction.date || '',
        description: transaction.description || '',
        notes: transaction.notes || '',
        bills: [],
      })
    }

    return transactions
  }

  const handleImport = async () => {
    if (!uploadedFile) {
      addToast('Please select a file to import', 'error')
      return
    }

    setIsUploading(true)
    setValidationErrors([])
    setImportProgress(0)

    try {
      const text = await uploadedFile.text()
      let transactions = []

      if (format === 'csv') {
        transactions = parseCSV(text)
      } else {
        transactions = JSON.parse(text)
        if (!Array.isArray(transactions)) {
          transactions = [transactions]
        }
      }

      // Validate all transactions first
      const allErrors: ValidationError[] = []
      transactions.forEach((t, idx) => {
        allErrors.push(...validateTransaction(t, idx + 1))
      })

      if (allErrors.length > 0) {
        setValidationErrors(allErrors)
        addToast(`Found ${allErrors.length} validation error(s)`, 'error')
        setIsUploading(false)
        return
      }

      let successCount = 0
      const total = transactions.length

      for (const transaction of transactions) {
        try {
          // Check if contact exists
          const contact = contacts.find(
            (c) => c.name.toLowerCase() === transaction.contact_name?.toLowerCase()
          )

          if (!contact) {
            console.warn(`Contact not found: ${transaction.contact_name}`)
            continue
          }

          // Import bills if present
          const bills: Omit<Bill, 'id' | 'transaction_id'>[] = []
          if (transaction.bills && Array.isArray(transaction.bills)) {
            transaction.bills.forEach((bill: any) => {
              if (bill.image_url) {
                bills.push({
                  bill_number: bill.bill_number || '',
                  image_url: bill.image_url,
                })
              }
            })
          }

          await addTransaction(
            {
              contact_id: contact.id,
              you_give: parseFloat(transaction.you_give) || 0,
              you_got: parseFloat(transaction.you_got) || 0,
              date: transaction.date,
              description: transaction.description || '',
              notes: transaction.notes || '',
            },
            bills
          )

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

  const downloadTemplate = () => {
    if (format === 'csv') {
      const template = 'contact_name,you_give,you_got,date,description,notes\n"John Doe",100,0,"2026-02-09","Coffee meeting","Personal"'
      const blob = new Blob([template], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transaction-template.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } else {
      const template = [
        {
          contact_name: 'John Doe',
          you_give: 100,
          you_got: 0,
          date: '2026-02-09',
          description: 'Coffee meeting',
          notes: 'Personal',
          bills: [],
        },
      ]
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transaction-template.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
    addToast('Template downloaded successfully', 'success')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 my-8 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        
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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">Import Guide</p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                Contacts must exist before importing. Bills are optional. Invalid rows will be skipped.
              </p>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">File Format</label>
            <div className="grid grid-cols-2 gap-2">
              {(['csv', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    format === fmt
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-foreground uppercase text-sm">{fmt}</div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select File</label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1">{uploadedFile?.name || 'No file selected'}</p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="p-3 bg-destructive/5 border border-destructive/30">
              <p className="text-xs font-semibold text-destructive mb-2">Validation Errors:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {validationErrors.slice(0, 10).map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive">
                    Row {error.row}, {error.field}: {error.message}
                  </p>
                ))}
                {validationErrors.length > 10 && (
                  <p className="text-xs text-destructive">... and {validationErrors.length - 10} more errors</p>
                )}
              </div>
            </Card>
          )}

          {/* Progress */}
          {isUploading && importProgress > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Importing...</span>
                <span className="text-sm text-muted-foreground">{importProgress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Download Template */}
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="w-full border-border"
            disabled={isUploading}
          >
            <Download className="w-4 h-4 mr-2" />
            Download {format.toUpperCase()} Template
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleImport}
              disabled={isUploading || !uploadedFile}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
            <Button
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
