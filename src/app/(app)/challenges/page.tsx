'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Challenge } from '@/lib/types'
import { Trophy, Calendar } from 'lucide-react'

export default function ChallengesPage() {
  const supabase = createClient()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [joining, setJoining] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setUserId(user.id)

        const { data: ch, error: fetchError } = await supabase
          .from('challenges')
          .select('*, challenge_participants(user_id)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        if (ch) {
          setChallenges(ch.map((c: Challenge & { challenge_participants: { user_id: string }[] }) => ({
            ...c,
            participant_count: c.challenge_participants?.length ?? 0,
            is_joined: user
              ? (c.challenge_participants?.some((p) => p.user_id === user.id) ?? false)
              : false,
          })))
        }
      } catch (err) {
        console.error('[Challenges] load error:', err)
        setError('Could not load challenges. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleJoin(challengeId: string) {
    if (!userId) return
    setJoining(challengeId)
    setError('')
    try {
      const { error: joinError } = await supabase
        .from('challenge_participants')
        .insert({ challenge_id: challengeId, user_id: userId })

      if (joinError) {
        console.error('[Challenges] join error:', joinError)
        setError('Could not join challenge. Please try again.')
      } else {
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === challengeId
              ? { ...c, is_joined: true, participant_count: (c.participant_count ?? 0) + 1 }
              : c
          )
        )
      }
    } catch (err) {
      console.error('[Challenges] unexpected join error:', err)
      setError('Could not join challenge. Please try again.')
    } finally {
      setJoining(null)
    }
  }

  const daysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 100%)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-green-300" />
          <h1 className="text-xl font-bold text-white">Challenges</h1>
        </div>
        <p className="text-green-200 text-sm">Join and compete with your community</p>
      </div>

      <div className="px-4 pt-5 pb-8 space-y-3">
        {error && (
          <div className="p-3 rounded-2xl text-sm font-medium bg-red-50 text-red-700">{error}</div>
        )}

        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-40 animate-pulse" />
          ))
        ) : challenges.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-gray-600 font-medium">No active challenges right now</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          challenges.map((ch) => (
            <div key={ch.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#4caf50' }}>
                  ACTIVE
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {daysLeft(ch.end_date)} days left
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-1">{ch.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{ch.description}</p>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{ch.participant_count ?? 0} participants</span>
                  <span>
                    {new Date(ch.start_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                    {' – '}
                    {new Date(ch.end_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: '#4caf50',
                      width: `${Math.min(100, Math.max(0, ((Date.now() - new Date(ch.start_date).getTime()) / (new Date(ch.end_date).getTime() - new Date(ch.start_date).getTime())) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {ch.is_joined ? (
                <div
                  className="w-full py-2.5 rounded-xl text-center text-sm font-semibold"
                  style={{ backgroundColor: '#e8f5e9', color: '#1a5c38' }}
                >
                  ✓ You&apos;re in!
                </div>
              ) : (
                <button
                  onClick={() => handleJoin(ch.id)}
                  disabled={joining === ch.id}
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                  style={{ backgroundColor: '#1a5c38' }}
                >
                  {joining === ch.id ? 'Joining…' : 'Join Challenge'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
