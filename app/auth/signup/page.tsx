'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Mail, Lock, User, ArrowRight, Check } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signUp, user, loading, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || confirmPassword === '')
  }, [password, confirmPassword])

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!email || !password || !fullName) {
        setError('Please fill in all required fields')
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

      await signUp(email, password, fullName)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up'
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Khatabook</h1>
          <p className="text-slate-300 text-sm">Start managing your finances today</p>
        </div>

        {/* Signup Card */}
        <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
            <p className="text-slate-400 text-sm">Join thousands of business owners managing their finances</p>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error || authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-700/80"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-700/80"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Password</label>
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
              disabled={isSubmitting || loading || !passwordsMatch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
