export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
  created_at: string
  updated_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string | null
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
  confirmPassword: string
}
