'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Lock, Check, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { updatePassword, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [isValidToken, setIsValidToken] = useState(true)

  useEffect(() => {
    // Check if user has valid reset token
    const checkToken = async () => {
      try {
        // The auth service will handle token validation
        // If no valid token, user will be redirected
      } catch (err) {
        setIsValidToken(false)
      }
    }

    checkToken()
  }, [])

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || confirmPassword === '')
  }, [password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!password || !confirmPassword) {
        setError('Please fill in all fields')
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }

      if (!passwordsMatch) {
        setError('Passwords do not match')
        return
      }

      await updatePassword(password)
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login?message=Password updated successfully. Please sign in.')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-xl p-8 shadow-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Invalid or expired link</h2>
            <p className="text-slate-400 text-sm mb-6">
              Your password reset link has expired or is invalid. Please request a new one.
            </p>
            <Link href="/auth/forgot-password">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10">
                Request new reset link
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Khatabook</h1>
          <p className="text-slate-300 text-sm">Set your new password</p>
        </div>

        {/* Reset Password Card */}
        <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-xl p-8 shadow-2xl">
          {success ? (
            // Success State
            <>
              <div className="text-center">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Password reset successful</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Your password has been updated. Redirecting to login...
                </p>
                <div className="animate-spin inline-block w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              </div>
            </>
          ) : (
            // Form State
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Reset your password</h2>
                <p className="text-slate-400 text-sm">
                  Enter your new password below. Make sure it's at least 8 characters long.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-700/80"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">At least 8 characters</p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-200">Confirm Password</label>
                    {confirmPassword && passwordsMatch && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      className={`pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-700/80 ${
                        confirmPassword && !passwordsMatch ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !passwordsMatch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Resetting password...' : 'Reset password'}
                </Button>
              </form>
            </>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          Make sure your new password is secure and unique.
        </p>
      </div>
    </div>
  )
}
