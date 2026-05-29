'use client'

import { createClient } from '@/lib/supabase'
import { useState } from 'react'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signOut() {
    setLoading(true)
    setError('')
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error('[SignOut] error:', signOutError)
        setError('Could not sign out. Please try again.')
        setLoading(false)
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      console.error('[SignOut] unexpected error:', err)
      setError('Could not sign out. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-3 p-3 rounded-2xl text-sm font-medium bg-red-50 text-red-700">{error}</div>
      )}
      <button
        onClick={signOut}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 text-sm font-semibold text-red-500 border-red-100 bg-white mb-4 disabled:opacity-60"
      >
        <LogOut className="w-4 h-4" />
        {loading ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
