'use client'

import { useState } from 'react'
import { adminLogin } from './actions'
import { useRouter } from 'next/navigation'
import { Lock, Leaf } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await adminLogin(password)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error ?? 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#f9f7f2' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a5c38' }}>
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold" style={{ color: '#1a5c38' }}>Climate Together NZ</div>
            <div className="text-xs text-gray-500">Admin Dashboard</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ backgroundColor: '#e8f5e9' }}>
            <Lock className="w-6 h-6" style={{ color: '#1a5c38' }} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Admin access</h1>
          <p className="text-gray-500 text-sm mb-5">Enter the admin password to continue</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm bg-red-50 text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: '#1a5c38' }}
            >
              {loading ? 'Verifying…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
