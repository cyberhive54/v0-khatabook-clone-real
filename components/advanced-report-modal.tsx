'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'
import { useTransactions } from '@/hooks/use-transactions'
import { useContacts } from '@/hooks/use-contacts'
import { useSettings } from '@/hooks/use-settings'
import { formatCurrency } from '@/lib/currency-utils'
import { format } from 'date-fns'

interface AdvancedReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdvancedReportModal({ isOpen, onClose }: AdvancedReportModalProps) {
  const { addToast } = useToast()
  const { transactions } = useTransactions()
  const { contacts } = useContacts()
  const { settings } = useSettings()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectAllContacts, setSelectAllContacts] = useState(false)
  const [dateRange, setDateRange] = useState<'all' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [amountRange, setAmountRange] = useState<'all' | 'custom'>('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [includeZeroBalance, setIncludeZeroBalance] = useState(true)

  // Parse amount inputs safely
  const parsedMinAmount = minAmount ? parseFloat(minAmount) : 0
  const parsedMaxAmount = maxAmount ? parseFloat(maxAmount) : Infinity

  // Filter transactions based on selected criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter by contacts
      const contactIds = selectAllContacts ? contacts.map((c) => c.id) : selectedContacts
      if (contactIds.length > 0 && !contactIds.includes(t.contact_id)) {
        return false
      }

      // Filter by date range
      if (dateRange === 'custom') {
        const tDate = new Date(t.date)
        if (startDate && new Date(startDate) > tDate) return false
        if (endDate && new Date(endDate) < tDate) return false
      }

      // Filter by amount range
      const amount = t.you_give || t.you_got || 0
      if (amountRange === 'custom') {
        if (amount < parsedMinAmount || amount > parsedMaxAmount) {
          return false
        }
      }

      return true
    })
  }, [transactions, selectedContacts, selectAllContacts, contacts, dateRange, startDate, endDate, amountRange, parsedMinAmount, parsedMaxAmount])

  const getContactName = (contactId: string) => {
    return contacts.find((c) => c.id === contactId)?.name || 'Unknown'
  }

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAllContacts(checked)
    if (checked) {
      setSelectedContacts([])
    }
  }

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    )
    setSelectAllContacts(false)
  }

  const exportToCSV = () => {
    const headers = ['Contact Name', 'Type', 'Amount', 'Date', 'Description', 'Notes']
    const rows = filteredTransactions.map((t) => [
      getContactName(t.contact_id),
      t.you_give ? 'You Give' : 'You Got',
      t.you_give || t.you_got || 0,
      t.date,
      t.description || '',
      t.notes || '',
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadFile(blob, `report-${format(new Date(), 'yyyy-MM-dd')}.csv`)
  }

  const exportToJSON = () => {
    const data = filteredTransactions.map((t) => ({
      contact_name: getContactName(t.contact_id),
      type: t.you_give ? 'You Give' : 'You Got',
      amount: t.you_give || t.you_got || 0,
      date: t.date,
      description: t.description || '',
      notes: t.notes || '',
    }))

    const summary = {
      generated_at: new Date().toISOString(),
      total_transactions: data.length,
      date_range: dateRange === 'custom' ? { start: startDate, end: endDate } : 'all',
      transactions: data,
    }

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
    downloadFile(blob, `report-${format(new Date(), 'yyyy-MM-dd')}.json`)
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

  const handleExport = async () => {
    if (filteredTransactions.length === 0) {
      addToast('No transactions match your filter criteria', 'error')
      return
    }

    setIsExporting(true)
    try {
      if (exportFormat === 'csv') {
        exportToCSV()
      } else {
        exportToJSON()
      }
      addToast(`Exported ${filteredTransactions.length} transactions successfully`, 'success')
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export transactions'
      addToast(errorMessage, 'error')
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  const contactIds = selectAllContacts ? contacts.map((c) => c.id) : selectedContacts

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Advanced Report Generator</h2>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">Generate Custom Reports</p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                Select your filtering criteria below to generate a detailed report
              </p>
            </div>
          </div>

          {/* Contact Filter */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Contacts {contactIds.length > 0 && `(${contactIds.length} selected)`}
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAllContacts}
                  onChange={(e) => handleSelectAllChange(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-primary"
                />
                <label htmlFor="select-all" className="flex-1 text-sm font-medium text-foreground cursor-pointer">
                  Select All Contacts
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-muted/10 rounded-lg border border-border">
                {contacts.length === 0 ? (
                  <p className="col-span-2 text-sm text-muted-foreground p-2">No contacts available</p>
                ) : (
                  contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`contact-${contact.id}`}
                        checked={selectAllContacts || selectedContacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                        disabled={selectAllContacts}
                        className="w-4 h-4 cursor-pointer accent-primary disabled:opacity-50"
                      />
                      <label
                        htmlFor={`contact-${contact.id}`}
                        className="text-xs text-foreground cursor-pointer truncate"
                      >
                        {contact.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Date Range</label>
            <div className="space-y-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'all' | 'custom')}
                className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Dates</option>
                <option value="custom">Custom Date Range</option>
              </select>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Amount Range</label>
            <div className="space-y-3">
              <select
                value={amountRange}
                onChange={(e) => setAmountRange(e.target.value as 'all' | 'custom')}
                className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Amounts</option>
                <option value="custom">Custom Amount Range</option>
              </select>

              {amountRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Minimum Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Maximum Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="Unlimited"
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Summary */}
          {filteredTransactions.length > 0 && (
            <Card className="p-4 bg-secondary/5 border border-secondary/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {selectAllContacts ? (
                      <p>All {contacts.length} contacts included</p>
                    ) : selectedContacts.length > 0 ? (
                      <p>{selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected</p>
                    ) : (
                      <p>No contact filter applied</p>
                    )}
                    {dateRange === 'custom' && (
                      <p>
                        Date range: {startDate ? format(new Date(startDate), 'MMM dd, yyyy') : 'Start'} to {endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'End'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {filteredTransactions.length === 0 && (
            <Card className="p-4 bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">No transactions match your filters</p>
                  <p className="text-xs text-muted-foreground mt-1">Adjust your criteria and try again</p>
                </div>
              </div>
            </Card>
          )}

          {/* Export Format Selection */}
          {filteredTransactions.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Export Format</label>
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
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              onClick={handleExport}
              disabled={isExporting || filteredTransactions.length === 0}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
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
