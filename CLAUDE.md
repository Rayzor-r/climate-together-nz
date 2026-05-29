# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build (also runs TypeScript type-check)
npm run lint     # ESLint
npm run start    # Start production server (requires build first)
```

There are no tests. The build command is the primary correctness check — always run it before committing.

## Deployment

Deployed on Railway via Docker. The `Dockerfile` uses a multi-stage build:
1. `deps` — installs node_modules
2. `builder` — runs `next build` (standalone output), creates `/app/public` if absent
3. `runner` — copies `.next/standalone`, `.next/static`, and `public/`

`railway.json` configures the build to use the Dockerfile. The server binds to `0.0.0.0:3000` (`ENV HOSTNAME="0.0.0.0"` in Dockerfile). Railway terminates TLS and sets `x-forwarded-host` / `x-forwarded-proto`.

**Critical**: Never use `new URL(request.url)` to build redirect targets in Route Handlers or middleware — `request.url` contains the internal container address (`0.0.0.0:3000`). Always use `request.nextUrl.clone()` instead, which reads `x-forwarded-host`.

## Architecture

### Stack
- **Next.js 14 App Router** with `output: 'standalone'`
- **Supabase** (auth + Postgres) via `@supabase/ssr`
- **Tailwind CSS** — custom colours: `green-deep` (#1a5c38), `green-mid` (#2d7a4f), `green-light` (#4caf50), `cream` (#f9f7f2)
- No test framework, no state management library

### Route groups
- `src/app/(app)/` — authenticated app shell. All pages here render inside `(app)/layout.tsx` which adds `<BottomNav>`. Pages: `dashboard`, `log`, `history`, `challenges`, `leaderboard`, `profile`.
- `src/app/auth/` — unauthenticated pages (`page.tsx`, `setup/page.tsx`, `callback/route.ts`). These are **outside** the `(app)` group and do not get `BottomNav`.
- `src/app/admin/` — password-protected admin panel. Auth is a plain cookie (`admin_auth=true`), not Supabase. Password checked server-side via `actions.ts` (Server Action).

### Supabase client pattern
Two separate clients — never mix them:

| File | Used in | Notes |
|---|---|---|
| `src/lib/supabase.ts` | Client components (`'use client'`) | `createBrowserClient` — reads/writes cookies in the browser |
| `src/lib/supabase-server.ts` | Server Components, Route Handlers | `createServerClient` with `cookies()` from `next/headers` |

`createAdminClient()` in `supabase-server.ts` uses the `SUPABASE_SERVICE_ROLE_KEY` and bypasses RLS — only used in the admin dashboard and export API.

### Authentication flow
1. `auth/page.tsx` calls `supabase.auth.signUp()` or `signInWithPassword()`
2. After success, navigate with `window.location.href` (not `router.push`) — forces a full reload so middleware and server components read fresh cookies
3. New users land on `/auth/setup`, save their profile via upsert, then `window.location.href = '/dashboard'`
4. Email confirmation links hit `/auth/callback/route.ts`, which handles both `token_hash+type` (OTP flow) and `code` (PKCE flow). Session cookies are set directly on the `NextResponse.redirect` object — not via `cookies()` from next/headers.

### Middleware (`src/middleware.ts`)
Runs on all routes except static assets. Logic:
- **Public paths** (`/`, `/auth`, `/auth/setup`, `/auth/callback`) — return immediately, no auth check
- **Protected paths** (`/dashboard`, `/log`, `/history`, `/challenges`, `/leaderboard`, `/profile`) — call `getUser()`; redirect to `/auth` if no session
- All other paths pass through without auth checks

### Database schema key points
- `users` table has a Postgres trigger `on_auth_user_created` that auto-inserts a row with `name = ''` on every signup. The dashboard checks `!profile.name` (empty string is falsy) and redirects to `/auth/setup` if true.
- `user_actions` insert triggers `award_action_points()` which updates `users.points` automatically — never update points manually.
- RLS is enabled on all tables. The `users` table allows public SELECT but restricts INSERT/UPDATE to `auth.uid() = id`.

### Redirect rules
Always use `window.location.href` for client-side redirects (not `router.push`). The Next.js App Router client cache can serve stale server component output; a hard reload guarantees fresh data from Supabase. Server components use `redirect()` from `next/navigation` which is fine.

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY       # Service role key (server-only, never expose to client)
ADMIN_PASSWORD                  # Plain-text password for /admin
```
The build injects `NEXT_PUBLIC_*` vars as Docker build args (see Dockerfile `ARG`/`ENV` lines).
