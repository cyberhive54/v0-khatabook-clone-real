'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/auth/types'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            user_metadata: currentUser.user_metadata,
            created_at: currentUser.created_at || '',
            updated_at: currentUser.updated_at || '',
            last_sign_in_at: currentUser.last_sign_in_at,
            email_confirmed_at: currentUser.email_confirmed_at,
          })
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
          created_at: session.user.created_at || '',
          updated_at: session.user.updated_at || '',
          last_sign_in_at: session.user.last_sign_in_at,
          email_confirmed_at: session.user.email_confirmed_at,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      setLoading(true)
      setError(null)

      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
            },
          },
        })

        if (signUpError) {
          throw signUpError
        }

        // Redirect to login page after signup
        router.push('/auth/login?message=Check your email to confirm your account')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign up'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)

      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          throw signInError
        }

        router.push('/')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        throw signOutError
      }

      setUser(null)
      router.push('/auth/login')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(
    async (email: string, redirectUrl?: string) => {
      setLoading(true)
      setError(null)

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl || `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/reset-password`,
        })

        if (resetError) {
          throw resetError
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updatePassword = useCallback(
    async (password: string) => {
      setLoading(true)
      setError(null)

      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        })

        if (updateError) {
          throw updateError
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update password'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }
}
