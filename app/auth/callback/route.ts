import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

type CookieItem = {
  name: string
  value: string
  options?: {
    path?: string
    domain?: string
    maxAge?: number
    expires?: Date
    secure?: boolean
    httpOnly?: boolean
    sameSite?: "lax" | "strict" | "none"
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/auth/reset-password"
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // If Supabase returned an error (expired/invalid link), surface it
  if (error) {
    const params = new URLSearchParams({
      error: errorDescription || error,
    })
    return NextResponse.redirect(`${origin}/auth/reset-password?${params.toString()}`)
  }

  if (code) {
    // We must create a mutable response to set cookies on
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: CookieItem[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      // Exchange failed -> likely expired/invalid code
      const params = new URLSearchParams({
        error: exchangeError.message,
      })
      return NextResponse.redirect(`${origin}/auth/reset-password?${params.toString()}`)
    }

    return response
  }

  // No code present (direct visit or hash flow fallback)
  // For hash-based flows (#access_token), client-side handles it.
  // Just redirect to next.
  return NextResponse.redirect(`${origin}${next}`)
}
