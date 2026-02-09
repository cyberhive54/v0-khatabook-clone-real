'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, X, Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'
import { useTransactions } from '@/hooks/use-transactions'
import { useContacts } from '@/hooks/use-contacts'

interface ExportTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportTransactionsModal({ isOpen, onClose }: ExportTransactionsModalProps) {
  const { addToast } = useToast()
  const { transactions } = useTransactions()
  const { contacts } = useContacts()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')

  const getContactName = (contactId: string) => {
    return contacts.find((c) => c.id === contactId)?.name || 'Unknown'
  }

  const exportToCSV = () => {
    const headers = ['contact_name', 'you_give', 'you_got', 'date', 'description', 'notes', 'bills_count']
    const rows = transactions.map((t) => [
      getContactName(t.contact_id),
      t.you_give || 0,
      t.you_got || 0,
      t.date,
      t.description || '',
      t.notes || '',
      t.bills?.length || 0,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    downloadFile(blob, `transactions-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportToJSON = () => {
    const data = transactions.map((t) => ({
      contact_name: getContactName(t.contact_id),
      you_give: t.you_give || 0,
      you_got: t.you_got || 0,
      date: t.date,
      description: t.description || '',
      notes: t.notes || '',
      bills: t.bills?.map((b) => ({
        bill_number: b.bill_number || '',
        image_url: b.image_url || '',
      })) || [],
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadFile(blob, `transactions-${new Date().toISOString().split('T')[0]}.json`)
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const downloadTemplate = () => {
    if (exportFormat === 'csv') {
      const template = 'contact_name,you_give,you_got,date,description,notes,bills_count\n"John Doe",100,0,2026-02-09,"Coffee meeting","Personal","0"'
      const blob = new Blob([template], { type: 'text/csv' })
      downloadFile(blob, 'transaction-template.csv')
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
      downloadFile(blob, 'transaction-template.json')
    }
    addToast('Template downloaded successfully', 'success')
  }

  const handleExport = async () => {
    if (transactions.length === 0) {
      addToast('No transactions to export', 'error')
      return
    }

    setIsExporting(true)
    try {
      if (exportFormat === 'csv') {
        exportToCSV()
      } else {
        exportToJSON()
      }
      addToast(`Exported ${transactions.length} transactions successfully`, 'success')
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export transactions'
      addToast(errorMessage, 'error')
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Export Transactions</h2>
          <button
            onClick={onClose}
            disabled={isExporting}
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
              <p className="font-semibold text-blue-900 dark:text-blue-100">Export Summary</p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} will be exported
              </p>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              {(['csv', 'json'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    exportFormat === format
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-foreground uppercase text-sm">{format}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format === 'csv' ? 'Spreadsheet' : 'Data file'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Info */}
          <Card className="p-3 bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground">
              {exportFormat === 'csv'
                ? 'CSV format is compatible with Excel, Sheets, and other spreadsheet applications.'
                : 'JSON format includes all transaction data in a structured format for data analysis.'}
            </p>
          </Card>

          {/* Download Template */}
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="w-full border-border"
          >
            <Download className="w-4 h-4 mr-2" />
            Download {exportFormat.toUpperCase()} Template
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting || transactions.length === 0}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isExporting}
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
