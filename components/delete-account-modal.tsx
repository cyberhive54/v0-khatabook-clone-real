'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Lock, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/toast-context'
import { useAuth } from '@/hooks/use-auth'
import { useTransactions } from '@/hooks/use-transactions'
import { X } from 'lucide-react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { addToast } = useToast()
  const { user, deleteAccount, loading: authLoading } = useAuth()
  const { deleteAllTransactions } = useTransactions()
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password) {
      setError('Please enter your password to confirm deletion')
      return
    }

    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }

    setIsSubmitting(true)

    try {
      // First delete all transactions
      await deleteAllTransactions()
      
      // Then delete the account
      await deleteAccount(password)
      
      addToast('Account deleted successfully', 'success')
      onClose()
      
      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account'
      setError(errorMessage)
      addToast(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Delete Account</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleDelete} className="p-6 space-y-4">
          
          {/* Warning */}
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">This action cannot be undone</p>
              <p className="text-sm">We will permanently delete your account and all associated transactions, contacts, and data. This is irreversible.</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Enter Your Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || authLoading}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">We need to verify your identity before deletion</p>
          </div>

          {/* Confirmation Text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm by typing:</label>
            <div className="p-3 bg-muted/30 border border-border rounded-lg text-sm font-mono text-center text-destructive font-semibold mb-2">
              DELETE MY ACCOUNT
            </div>
            <Input
              type="text"
              placeholder="Type the text above to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              disabled={isSubmitting || authLoading}
              className="text-center font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter exactly as shown above</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || authLoading || !password || confirmText !== 'DELETE MY ACCOUNT'}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting || authLoading}
              className="border-border"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
