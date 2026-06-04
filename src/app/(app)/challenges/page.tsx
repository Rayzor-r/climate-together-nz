'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Challenge } from '@/lib/types'
import { Trophy, Calendar, Users } from 'lucide-react'

const AVATAR_COLORS = ['#1a5c38', '#3b82f6', '#f59e0b', '#9333ea', '#ea580c', '#0891b2', '#16a34a', '#e11d48']

type ChallengeWithMeta = Challenge & { joined_today: number }

export default function ChallengesPage() {
  const supabase = createClient()
  const [challenges, setChallenges] = useState<ChallengeWithMeta[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [joining, setJoining] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) setUserId(user.id)

        const { data: ch, error: fetchError } = await supabase
          .from('challenges')
          .select('*, challenge_participants(user_id, joined_at)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        if (ch) {
          const today = new Date().toISOString().split('T')[0]
          setChallenges(
            ch.map(
              (
                c: Challenge & {
                  challenge_participants: { user_id: string; joined_at: string }[]
                }
              ) => ({
                ...c,
                participant_count: c.challenge_participants?.length ?? 0,
                is_joined: user
                  ? (c.challenge_participants?.some((p) => p.user_id === user.id) ?? false)
                  : false,
                joined_today:
                  c.challenge_participants?.filter((p) =>
                    p.joined_at?.startsWith(today)
                  ).length ?? 0,
              })
            )
          )
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
        setError('Could not join challenge. Please try again.')
      } else {
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === challengeId
              ? {
                  ...c,
                  is_joined: true,
                  participant_count: (c.participant_count ?? 0) + 1,
                  joined_today: (c.joined_today ?? 0) + 1,
                }
              : c
          )
        )
      }
    } catch (err) {
      console.error('[Challenges] join error:', err)
      setError('Could not join challenge. Please try again.')
    } finally {
      setJoining(null)
    }
  }

  const daysLeft = (endDate: string) =>
    Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000))

  const timeProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div
        className="px-4 lg:px-8 pt-10 pb-6"
        style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <h1 className="text-xl font-bold text-white">Challenges</h1>
          </div>
          <p className="text-green-200/80 text-sm">Join and compete with your community</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-5 pb-8">
        {error && (
          <div className="mb-4 p-3 rounded-2xl text-sm font-medium bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-64 animate-pulse" />
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl"
              style={{ backgroundColor: '#e8f5e9' }}
            >
              🏆
            </div>
            <p className="text-gray-800 font-bold text-lg mb-1">No active challenges yet</p>
            <p className="text-gray-400 text-sm">Your admin will create one soon — check back!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {challenges.map((ch) => {
              const days = daysLeft(ch.end_date)
              const progress = timeProgress(ch.start_date, ch.end_date)
              const count = ch.participant_count ?? 0
              const avatarCount = Math.min(5, count)
              const extraCount = count > 5 ? count - 4 : 0

              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-3xl overflow-hidden"
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1.5px solid #f0fdf4',
                  }}
                >
                  {/* Card gradient header */}
                  <div
                    className="px-5 pt-5 pb-4"
                    style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ background: 'linear-gradient(135deg, #1a5c38, #4caf50)' }}
                      >
                        ACTIVE
                      </span>
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: days <= 3 ? '#fff7ed' : 'rgba(255,255,255,0.8)',
                          border: `1px solid ${days <= 3 ? '#fed7aa' : 'transparent'}`,
                        }}
                      >
                        <Calendar className="w-3.5 h-3.5" style={{ color: days <= 3 ? '#ea580c' : '#6b7280' }} />
                        <span
                          className="text-xs font-bold"
                          style={{ color: days <= 3 ? '#ea580c' : '#6b7280' }}
                        >
                          {days} day{days !== 1 ? 's' : ''} left
                        </span>
                      </div>
                    </div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{ch.title}</h3>
                  </div>

                  {/* Card body */}
                  <div className="px-5 pb-5 pt-4">
                    {ch.description && (
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">{ch.description}</p>
                    )}

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {count} participant{count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(ch.start_date).toLocaleDateString('en-NZ', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' – '}
                          {new Date(ch.end_date).toLocaleDateString('en-NZ', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div
                        className="w-full h-2.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#f0fdf4' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            background: 'linear-gradient(90deg, #1a5c38, #4caf50)',
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Participant avatars + social proof */}
                    {count > 0 && (
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="flex -space-x-2.5">
                          {[...Array(avatarCount)].map((_, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                              style={{
                                backgroundColor:
                                  idx < avatarCount - 1 || extraCount === 0
                                    ? AVATAR_COLORS[idx % AVATAR_COLORS.length]
                                    : '#9ca3af',
                                zIndex: avatarCount - idx,
                              }}
                            >
                              {idx === avatarCount - 1 && extraCount > 0
                                ? `+${extraCount}`
                                : ''}
                            </div>
                          ))}
                        </div>
                        {ch.joined_today > 0 && (
                          <span className="text-xs font-semibold" style={{ color: '#ea580c' }}>
                            🔥 {ch.joined_today} joined today
                          </span>
                        )}
                      </div>
                    )}

                    {ch.is_joined ? (
                      <div
                        className="w-full py-3 rounded-xl text-center text-sm font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                          color: '#1a5c38',
                          border: '1.5px solid #bbf7d0',
                        }}
                      >
                        ✓ You&apos;re in! Keep logging actions 🌿
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoin(ch.id)}
                        disabled={joining === ch.id}
                        className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60 transition-transform active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, #1a5c38, #4caf50)',
                          boxShadow: '0 4px 14px rgba(26,92,56,0.35)',
                        }}
                      >
                        {joining === ch.id ? 'Joining…' : '🏆 Join Challenge'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
