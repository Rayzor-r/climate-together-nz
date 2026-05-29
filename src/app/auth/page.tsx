'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Leaf, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function AuthForm() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>(
    (searchParams.get('mode') as 'login' | 'signup') || 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    searchParams.get('error') === 'callback_failed'
      ? 'Email verification failed. Please try signing in, or request a new confirmation email.'
      : ''
  )
  const [message, setMessage] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        console.log('[Auth] signUp response:', { user: data.user?.id, session: !!data.session, error: signUpError })

        if (signUpError) {
          setError(signUpError.message)
        } else if (data.session) {
          // Email confirmation OFF — user is signed in immediately
          console.log('[Auth] signup: immediate session, navigating to /auth/setup')
          window.location.href = '/auth/setup'
        } else {
          // Email confirmation ON — ask them to check inbox
          console.log('[Auth] signup: confirmation email sent')
          setMessage("Check your email and click the confirmation link — you'll be signed in automatically.")
          setMode('login')
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        console.log('[Auth] signIn response:', { user: data.user?.id, session: !!data.session, error: signInError })

        if (signInError) {
          setError(signInError.message)
        } else {
          console.log('[Auth] login success, navigating to /dashboard')
          window.location.href = '/dashboard'
        }
      }
    } catch (err) {
      console.error('[Auth] unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Top bar */}
      <div className="flex items-center px-4 pt-12 pb-4">
        <Link href="/" className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" style={{ color: '#1a5c38' }} />
        </Link>
      </div>

      {/* Logo */}
      <div className="px-6 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a5c38' }}>
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-base" style={{ color: '#1a5c38' }}>Climate Together NZ</div>
            <div className="text-xs text-gray-500">Pilot Programme</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'Welcome back 👋' : 'Join the pilot ✨'}
        </h1>
        <p className="text-gray-500 text-sm">
          {mode === 'login'
            ? 'Sign in to track your climate actions'
            : 'Create your free account and start making a difference'}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        {message && (
          <div className="mb-4 p-4 rounded-2xl text-sm font-medium" style={{ backgroundColor: '#e8f5e9', color: '#1a5c38' }}>
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-2xl text-sm font-medium bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-deep text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 text-base pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg disabled:opacity-60 mt-2"
            style={{ backgroundColor: '#1a5c38' }}
          >
            {loading
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-500 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
            className="text-sm font-semibold"
            style={{ color: '#1a5c38' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9f7f2' }}>
        <div className="text-gray-400">Loading…</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
