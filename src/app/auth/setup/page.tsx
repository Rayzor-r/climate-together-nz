'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Leaf } from 'lucide-react'

const NZ_REGIONS = [
  'Northland', 'Auckland', 'Waikato', 'Bay of Plenty', 'Gisborne',
  "Hawke's Bay", 'Taranaki', 'Manawatū-Whanganui', 'Wellington',
  'Tasman', 'Nelson', 'Marlborough', 'West Coast', 'Canterbury',
  'Otago', 'Southland',
]

const USER_TYPES = [
  { value: 'individual', label: 'Individual', emoji: '🙋' },
  { value: 'school', label: 'School', emoji: '🏫' },
  { value: 'business', label: 'Business', emoji: '🏢' },
  { value: 'community', label: 'Community group', emoji: '🤝' },
]

interface Group { id: string; name: string; type: string }

export default function SetupPage() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [userType, setUserType] = useState('')
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      const [{ data: userData }, { data: groupData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('groups').select('id, name, type').order('name'),
      ])
      console.log('[Setup] mount getUser:', {
        userId: userData?.user?.id ?? null,
        email: userData?.user?.email ?? null,
      })
      if (!userData?.user) {
        console.warn('[Setup] no user on mount — redirecting to /auth')
        window.location.href = '/auth'
        return
      }
      if (groupData) setGroups(groupData)
    }
    init()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name'); return }
    setLoading(true)
    setError('')

    try {
      const { data: { user }, error: getUserError } = await supabase.auth.getUser()
      console.log('[Setup] handleSave getUser:', { userId: user?.id ?? null, error: getUserError?.message ?? null })

      if (!user) {
        setError('Session expired. Please sign in again.')
        setLoading(false)
        window.location.href = '/auth'
        return
      }

      const payload: Record<string, unknown> = {
        id: user.id,
        email: user.email!,
        name: name.trim(),
        region: region || null,
        user_type: (userType || 'individual') as 'individual' | 'school' | 'business' | 'community',
        group_id: groupId || null,
      }
      console.log('[Setup] upserting payload:', payload)

      const { data: upsertData, error: upsertError } = await supabase
        .from('users')
        .upsert(payload)
        .select()

      console.log('[Setup] upsert result:', {
        data: upsertData,
        error: upsertError?.message ?? null,
        code: upsertError?.code ?? null,
      })

      if (upsertError) {
        setError(`Could not save profile: ${upsertError.message}`)
        setLoading(false)
        return
      }

      console.log('[Setup] upsert succeeded — navigating to /dashboard')
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('[Setup] unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-8" style={{ backgroundColor: '#f9f7f2' }}>
      <div className="max-w-lg mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a5c38' }}>
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold" style={{ color: '#1a5c38' }}>Climate Together NZ</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set up your profile</h1>
        <p className="text-gray-500 text-sm mb-8">Just a few details to get you started 🌿</p>

        {error && (
          <div className="mb-4 p-4 rounded-2xl text-sm font-medium bg-red-50 text-red-700">{error}</div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Aroha Tane"
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 text-base"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Region <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 text-base appearance-none"
            >
              <option value="">Select your region…</option>
              {NZ_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* User type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I&apos;m joining as</label>
            <div className="grid grid-cols-2 gap-2">
              {USER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setUserType(t.value)}
                  className="py-3 px-4 rounded-2xl border-2 text-left transition-all"
                  style={userType === t.value
                    ? { borderColor: '#1a5c38', backgroundColor: '#e8f5e9' }
                    : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
                >
                  <div className="text-xl mb-0.5">{t.emoji}</div>
                  <div className="text-sm font-medium text-gray-800">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Group — only shown if groups exist */}
          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Group or community <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 text-base appearance-none"
              >
                <option value="">No group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg disabled:opacity-60 mt-2"
            style={{ backgroundColor: '#1a5c38' }}
          >
            {loading ? 'Saving…' : "Let's go! 🌿"}
          </button>
        </form>
      </div>
    </div>
  )
}
