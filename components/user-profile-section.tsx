'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Mail, Lock, AlertCircle, Check } from 'lucide-react'

export function UserProfileSection() {
  const { user, updatePassword, loading } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    setIsSubmitting(true)

    try {
      if (!newPassword || !confirmPassword) {
        setPasswordError('Please fill in all fields')
        return
      }

      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters')
        return
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match')
        return
      }

      await updatePassword(newPassword)
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setIsChangingPassword(false)

      setTimeout(() => {
        setPasswordSuccess(false)
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password'
      setPasswordError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="p-6 bg-card border border-border">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <div className="px-4 py-2 rounded-lg bg-muted border border-border text-foreground">
              {user?.user_metadata?.full_name || 'Not set'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your name is stored in your Supabase account
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div className="px-4 py-2 rounded-lg bg-muted border border-border text-foreground flex-1">
                {user?.email || 'No email'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This is your login email address
            </p>
          </div>

          {/* Account Created */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Member Since</label>
            <div className="px-4 py-2 rounded-lg bg-muted border border-border text-foreground">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </div>
          </div>
        </div>
      </Card>

      {/* Security Card */}
      <Card className="p-6 bg-card border border-border">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">Security</h2>
          <p className="text-sm text-muted-foreground">Update your password and security settings</p>
        </div>

        {!isChangingPassword ? (
          <Button
            onClick={() => setIsChangingPassword(true)}
            variant="outline"
            className="flex items-center gap-2 border-border"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Error Message */}
            {passwordError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {passwordError}
              </div>
            )}

            {/* Success Message */}
            {passwordSuccess && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                Password updated successfully!
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false)
                  setNewPassword('')
                  setConfirmPassword('')
                  setPasswordError(null)
                }}
                variant="outline"
                className="border-border"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>


    </div>
  )
}
