import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Guard against open-redirect: only allow relative paths starting with /
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = rawNext.startsWith('/') ? rawNext : '/dashboard'

  // Use request.nextUrl.clone() so the redirect target uses the public-facing
  // host/protocol from x-forwarded-host / x-forwarded-proto (set by Railway's
  // reverse proxy). Using new URL(request.url) gives the internal container
  // address (0.0.0.0:PORT) instead of the real public hostname.
  const successUrl = request.nextUrl.clone()
  successUrl.pathname = next
  successUrl.search = ''
  const successResponse = NextResponse.redirect(successUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Email confirmation flow (token_hash + type=signup)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) return successResponse
  }

  // OAuth / magic-link PKCE flow (code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return successResponse
  }

  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = '/auth'
  errorUrl.search = '?error=callback_failed'
  return NextResponse.redirect(errorUrl)
}
