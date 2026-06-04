'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { ActionItem } from '@/lib/types'
import ActionCard from '@/components/ActionCard'
import Link from 'next/link'

const CATEGORIES = [
  { label: 'All', emoji: '✨', color: '#1a5c38', bg: '#e8f5e9' },
  { label: 'Transport', emoji: '🚌', color: '#2563eb', bg: '#eff6ff' },
  { label: 'Energy', emoji: '⚡', color: '#d97706', bg: '#fffbeb' },
  { label: 'Food', emoji: '🥗', color: '#ea580c', bg: '#fff7ed' },
  { label: 'Water', emoji: '💧', color: '#0891b2', bg: '#ecfeff' },
  { label: 'Waste', emoji: '♻️', color: '#9333ea', bg: '#faf5ff' },
  { label: 'Nature', emoji: '🌳', color: '#16a34a', bg: '#f0fdf4' },
]

export default function LogPage() {
  const supabase = createClient()
  const [actions, setActions] = useState<ActionItem[]>([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [logging, setLogging] = useState<string | null>(null)
  const [success, setSuccess] = useState<ActionItem | null>(null)
  const [logError, setLogError] = useState('')

  useEffect(() => {
    async function fetchActions() {
      try {
        const { data, error } = await supabase
          .from('actions_library')
          .select('*')
          .order('points', { ascending: false })
        if (error) throw error
        setActions(data ?? [])
      } catch (err) {
        console.error('[Log] failed to load actions:', err)
        setLoadError('Could not load actions. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    fetchActions()
  }, [])

  const filtered = category === 'All' ? actions : actions.filter((a) => a.category === category)

  async function handleLog(action: ActionItem) {
    setLogging(action.id)
    setLogError('')
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth'
        return
      }

      const { error } = await supabase.from('user_actions').insert({
        user_id: user.id,
        action_id: action.id,
      })

      if (error) {
        console.error('[Log] insert error:', error)
        setLogError('Could not log action. Please try again.')
      } else {
        setSuccess(action)
      }
    } catch (err) {
      console.error('[Log] unexpected error:', err)
      setLogError('Could not log action. Please try again.')
    } finally {
      setLogging(null)
    }
  }

  if (success) {
    const CATEGORY_ACCENT: Record<string, { color: string; bg: string }> = {
      Transport: { color: '#2563eb', bg: '#eff6ff' },
      Energy: { color: '#d97706', bg: '#fffbeb' },
      Food: { color: '#ea580c', bg: '#fff7ed' },
      Water: { color: '#0891b2', bg: '#ecfeff' },
      Waste: { color: '#9333ea', bg: '#faf5ff' },
      Nature: { color: '#16a34a', bg: '#f0fdf4' },
    }
    const accent = CATEGORY_ACCENT[success.category] ?? { color: '#1a5c38', bg: '#e8f5e9' }

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: '#f9f7f2' }}
      >
        <div className="max-w-sm w-full mx-auto animate-pop-in">
          {/* Celebration icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-5 mx-auto text-5xl shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${accent.color}, ${accent.color}cc)`,
              boxShadow: `0 12px 32px ${accent.color}44`,
            }}
          >
            ✅
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-1">Ka pai! 🎉</h2>
          <p className="text-gray-400 text-sm mb-6">Action logged successfully</p>

          {/* Action name */}
          <p className="text-base font-bold text-gray-700 mb-5">{success.name}</p>

          {/* Big impact numbers */}
          <div
            className="rounded-3xl p-6 mb-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${accent.bg}, white)`,
              border: `2px solid ${accent.color}33`,
              boxShadow: `0 8px 24px ${accent.color}22`,
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: accent.color }}>
              Your impact
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-4xl font-black leading-none" style={{ color: accent.color }}>
                  +{success.points}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">points</div>
              </div>
              <div>
                <div className="text-4xl font-black leading-none text-gray-800">
                  {success.co2_saved_kg}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">kg CO₂</div>
              </div>
              <div>
                <div className="text-4xl font-black leading-none text-emerald-600">
                  ${success.money_saved_nzd.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">saved</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setSuccess(null)}
              className="flex-1 py-4 rounded-2xl font-bold border-2 text-base transition-transform active:scale-95"
              style={{ borderColor: '#1a5c38', color: '#1a5c38' }}
            >
              Log another
            </button>
            <a
              href="/dashboard"
              className="flex-1 py-4 rounded-2xl font-bold text-white text-base text-center transition-transform active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #1a5c38, #4caf50)',
                boxShadow: '0 4px 16px rgba(26,92,56,0.35)',
              }}
            >
              Done ✓
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          className="px-4 lg:px-8 pt-10 pb-5"
          style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 100%)' }}
        >
          <div className="max-w-5xl mx-auto">
            <h1 className="text-xl font-bold text-white mb-0.5">Log an Action</h1>
            <p className="text-green-200/80 text-sm mb-4">Tap a card to log it instantly</p>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const active = category === cat.label
                return (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(cat.label)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
                    style={
                      active
                        ? {
                            backgroundColor: 'white',
                            color: cat.color,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }
                        : {
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.85)',
                          }
                    }
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {(loadError || logError) && (
          <div className="mx-4 lg:mx-8 mt-3 p-3 rounded-2xl text-sm font-medium bg-red-50 text-red-700">
            {loadError || logError}
          </div>
        )}

        {/* Action grid */}
        <div className="px-4 lg:px-8 pt-4 pb-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 h-36 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"
                style={{ backgroundColor: '#e8f5e9' }}
              >
                🌿
              </div>
              <p className="text-gray-700 font-bold mb-1">No actions in this category</p>
              <p className="text-gray-400 text-sm mb-4">Try a different category above</p>
              <button
                onClick={() => setCategory('All')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white active:scale-95"
                style={{ backgroundColor: '#1a5c38' }}
              >
                Show all actions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onLog={handleLog}
                  loading={logging === action.id}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && actions.length === 0 && !loadError && (
          <div className="text-center py-20 px-6">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-gray-700 font-bold text-lg mb-1">No actions available yet</p>
            <p className="text-gray-400 text-sm mb-5">Your admin will add actions soon</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm active:scale-95"
              style={{ backgroundColor: '#1a5c38' }}
            >
              Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
