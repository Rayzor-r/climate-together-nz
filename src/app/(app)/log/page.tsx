'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { ActionItem } from '@/lib/types'
import ActionCard from '@/components/ActionCard'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['All', 'Transport', 'Energy', 'Waste', 'Water', 'Food', 'Nature']

export default function LogPage() {
  const supabase = createClient()
  const router = useRouter()
  const [actions, setActions] = useState<ActionItem[]>([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [logging, setLogging] = useState<string | null>(null)
  const [success, setSuccess] = useState<ActionItem | null>(null)

  useEffect(() => {
    supabase.from('actions_library').select('*').order('points', { ascending: false }).then(({ data }) => {
      if (data) setActions(data)
      setLoading(false)
    })
  }, [])

  const filtered = category === 'All' ? actions : actions.filter((a) => a.category === category)

  async function handleLog(action: ActionItem) {
    setLogging(action.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { error } = await supabase.from('user_actions').insert({
      user_id: user.id,
      action_id: action.id,
    })

    setLogging(null)
    if (!error) {
      setSuccess(action)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: '#f9f7f2' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
          style={{ backgroundColor: '#1a5c38' }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ka pai! 🎉</h2>
        <p className="text-gray-500 text-base mb-6">You logged:</p>
        <div className="bg-white rounded-2xl p-5 w-full shadow-sm mb-8 text-left">
          <p className="font-bold text-gray-900 text-lg mb-3">{success.name}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="font-bold text-xl" style={{ color: '#1a5c38' }}>+{success.points}</div>
              <div className="text-xs text-gray-400">points</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-gray-800">{success.co2_saved_kg}kg</div>
              <div className="text-xs text-gray-400">CO₂ saved</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-gray-800">${success.money_saved_nzd.toFixed(2)}</div>
              <div className="text-xs text-gray-400">saved</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setSuccess(null)}
            className="flex-1 py-4 rounded-2xl font-bold border-2 text-base"
            style={{ borderColor: '#1a5c38', color: '#1a5c38' }}
          >
            Log another
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-4 rounded-2xl font-bold text-white text-base text-center"
            style={{ backgroundColor: '#1a5c38' }}
          >
            Done
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="p-1.5 -ml-1.5">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Log an Action</h1>
            <p className="text-xs text-gray-400">Tap any card to log it</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={
                category === cat
                  ? { backgroundColor: '#1a5c38', color: 'white' }
                  : { backgroundColor: 'white', color: '#6b7280' }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Action grid */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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
    </div>
  )
}
