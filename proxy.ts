import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.get('is_authenticated')?.value === 'true'
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  // 1. If not authenticated and not on the auth page, redirect to auth
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // 2. If authenticated and on the auth page, redirect to home
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
