import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// These paths are always accessible — never redirect away from them.
const PUBLIC_PATHS = ['/', '/auth', '/auth/setup', '/auth/callback']

// These paths require a valid session — redirect to /auth if none.
const PROTECTED_PATHS = ['/dashboard', '/log', '/history', '/challenges', '/leaderboard', '/profile']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Never interfere with public paths — return immediately without auth checks.
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  if (isPublic) return supabaseResponse

  // For protected paths, check the session.
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  if (!isProtected) return supabaseResponse

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Unauthenticated user on a protected path — send to /auth.
    // Use nextUrl.clone() so x-forwarded-host gives the public hostname.
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.search = ''
    const res = NextResponse.redirect(url)
    // Forward any session-refresh cookies so they aren't lost.
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      res.cookies.set(name, value)
    })
    return res
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
