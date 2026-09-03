import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

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

/**
 * Middleware for route protection and authentication
 * This runs on every request to protect routes based on authentication status
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // List of public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/callback",
  ];

  const pathname = request.nextUrl.pathname;

  // Allow callback route to handle PKCE exchange without interference
  if (pathname.startsWith("/auth/callback")) {
    return response;
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If user is not authenticated and trying to access a protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If user is authenticated and trying to access auth routes
  // IMPORTANT: Allow authenticated recovery session to access reset-password
  // Supabase creates a session when user clicks email link (type=recovery)
  if (user && isPublicRoute) {
    const isResetPassword = pathname.startsWith("/auth/reset-password");
    const hasCode = request.nextUrl.searchParams.has("code");
    const hasError = request.nextUrl.searchParams.has("error");

    // Don't redirect if user is on reset-password with recovery flow
    if (isResetPassword && (hasCode || hasError)) {
      return response;
    }

    // If user is on reset-password and has a session, allow it (recovery session)
    // The reset-password page itself will validate the session + allow password update
    if (isResetPassword && user) {
      return response;
    }

    // For other auth routes (login/signup/forgot), redirect authed users home
    if (!isResetPassword) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

// Configure which routes should be checked by middleware
export const config = {
  matcher: [
    // Include all routes except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
