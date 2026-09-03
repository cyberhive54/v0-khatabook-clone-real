'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Lock, Check, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const init = async () => {
      // Surface errors forwarded by /auth/callback (expired/invalid code)
      const urlError = searchParams.get('error')
      if (urlError) {
        setError(decodeURIComponent(urlError))
        setIsValidToken(false)
        setCheckingSession(false)
        return
      }

      // If callback left a `code` that wasn't exchanged (rare), try to exchange here
      const code = searchParams.get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          setIsValidToken(false)
          setCheckingSession(false)
          return
        }
      }

      // Hash fragment flow fallback (#access_token=...&type=recovery)
      // Supabase SSR client auto-parses, but we also handle explicit check
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        // Give Supabase a tick to process hash
        await new Promise((r) => setTimeout(r, 300))
      }

      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()

      if (!session || !user) {
        setIsValidToken(false)
      } else {
        setIsValidToken(true)
      }
      setCheckingSession(false)
    }

    init()
  }, [searchParams, supabase.auth])

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || confirmPassword === '')
  }, [password, confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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

    if (isValidToken === false) {
      setError('Your link is invalid or expired. Please request a new reset link.')
      return
    }

    setIsSubmitting(true)
    try {
      // Verify session still valid before update
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Session expired. Please request a new reset link.')
        setIsValidToken(false)
        return
      }

      await updatePassword(password)
      setSuccess(true)

      // Sign out recovery session so user must login with new password (security best practice)
      await supabase.auth.signOut()

      setTimeout(() => {
        router.push('/auth/login?message=Password updated successfully. Please sign in.')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password'
      // Map common Supabase errors to friendly text
      if (errorMessage.toLowerCase().includes('auth session missing')) {
        setError('Reset link expired or already used. Please request a new link.')
        setIsValidToken(false)
      } else if (errorMessage.toLowerCase().includes('same password')) {
        setError('New password must be different from old password.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-slate-300">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-xl p-8 shadow-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Invalid or expired link</h2>
            <p className="text-slate-400 text-sm mb-2">
              Your password reset link has expired or is invalid. Please request a new one.
            </p>
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-xs">
                {error}
              </div>
            )}
            <Link href="/auth/forgot-password">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10">
                Request new reset link
              </Button>
            </Link>
            <Link href="/auth/login" className="block mt-4 text-sm text-slate-400 hover:text-slate-200">
              Back to login
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Khatabook</h1>
          <p className="text-slate-300 text-sm">Set your new password</p>
        </div>

        <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-xl p-8 shadow-2xl">
          {success ? (
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
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Reset your password</h2>
                <p className="text-slate-400 text-sm">
                  Enter your new password below. Make sure it's at least 8 characters long.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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

        <p className="text-center text-slate-500 text-xs mt-8">
          Make sure your new password is secure and unique.
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}