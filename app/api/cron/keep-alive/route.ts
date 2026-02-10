import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

/**
 * Keep-alive cron endpoint to prevent Supabase free tier database from pausing
 * Runs every 5 days via Vercel Cron
 * 
 * Endpoint: POST /api/cron/keep-alive
 * Cron Schedule: 0 0 */5 * * (every 5 days at 00:00 UTC)
 */
export async function POST(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.error('[v0] Unauthorized cron request')
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const cookieStore = await cookies()

    // Create Supabase client with service role key for admin access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: any[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // ignored
            }
          },
        },
      }
    )

    // Insert a keep-alive ping record
    const { data, error } = await supabase
      .from('keep_alive_pings')
      .insert([
        {
          cron_job_name: 'vercel-cron-5-days',
          status: 'success',
        },
      ])
      .select()

    if (error) {
      console.error('[v0] Keep-alive ping failed:', error.message)
      return Response.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    console.log('[v0] Keep-alive ping successful:', {
      recordCount: data?.length || 0,
      timestamp: new Date().toISOString(),
    })

    return Response.json(
      {
        success: true,
        message: 'Keep-alive ping recorded successfully',
        recordCount: data?.length || 0,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[v0] Keep-alive cron error:', errorMessage)

    return Response.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
