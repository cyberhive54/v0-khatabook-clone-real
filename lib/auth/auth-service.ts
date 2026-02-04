import { createClient } from '@/lib/supabase/client'
import type { SignUpData, SignInData, ResetPasswordData, UpdatePasswordData } from './types'

export class AuthService {
  private supabase = createClient()

  async signUp(data: SignUpData) {
    const { email, password, fullName } = data

    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    })

    if (authError) {
      throw new Error(authError.message)
    }

    return authData
  }

  async signIn(data: SignInData) {
    const { email, password } = data

    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    return authData
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  async resetPassword(data: ResetPasswordData, redirectUrl?: string) {
    const { email } = data

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl || `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async updatePassword(data: UpdatePasswordData) {
    const { password } = data

    const { error } = await this.supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser()

    if (error) {
      return null
    }

    return data.user
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession()

    if (error) {
      return null
    }

    return data.session
  }

  onAuthStateChange(callback: (user: any) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  }
}

export const authService = new AuthService()
