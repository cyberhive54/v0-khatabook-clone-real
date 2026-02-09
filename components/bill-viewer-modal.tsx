'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, X, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'
import type { Bill } from '@/hooks/use-transactions'

interface BillViewerModalProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill | null
}

export function BillViewerModal({ isOpen, onClose, bill }: BillViewerModalProps) {
  const { addToast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!bill?.image_url) {
      addToast('No image available to download', 'error')
      return
    }

    setIsDownloading(true)
    try {
      const link = document.createElement('a')
      link.href = bill.image_url
      link.download = `bill-${bill.id || Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      addToast('Bill downloaded successfully', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download bill'
      addToast(errorMessage, 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!isOpen || !bill) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-lg font-bold text-foreground">Bill Preview</h2>
            {bill.bill_number && (
              <p className="text-sm text-muted-foreground">Bill #: {bill.bill_number}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bill Details */}
        {(bill.bill_date || bill.bill_amount || bill.notes) && (
          <Card className="m-4 p-4 bg-card border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bill.bill_date && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Date</p>
                  <p className="text-sm font-semibold text-foreground">{bill.bill_date}</p>
                </div>
              )}
              {bill.bill_amount && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Amount</p>
                  <p className="text-sm font-semibold text-foreground">{bill.bill_amount}</p>
                </div>
              )}
              {bill.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Notes</p>
                  <p className="text-sm font-semibold text-foreground">{bill.notes}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Image */}
        <div className="px-4 pb-4">
          {bill.image_url && (
            <div className="bg-muted rounded-lg overflow-hidden border border-border">
              <img
                src={bill.image_url}
                alt="Bill"
                className="w-full h-auto object-contain max-h-[500px]"
              />
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-8 text-center border border-border">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-2 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border"
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading || !bill.image_url}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Bill
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
