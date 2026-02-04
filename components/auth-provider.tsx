'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface AuthProviderProps {
  children: ReactNode
  requireAuth?: boolean
}

export function AuthProvider({ children, requireAuth = true }: AuthProviderProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    if (!loading && !user && requireAuth) {
      router.push('/auth/login')
      return
    }

    if (user) {
      setIsAuthed(true)
    }
  }, [user, loading, requireAuth, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthed) {
    return null
  }

  return <>{children}</>
}
