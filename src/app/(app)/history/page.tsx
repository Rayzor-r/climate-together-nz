export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_CONFIG: Record<string, { emoji: string; bg: string; color: string }> = {
  Transport: { emoji: '🚌', bg: '#eff6ff', color: '#2563eb' },
  Energy:    { emoji: '⚡', bg: '#fffbeb', color: '#d97706' },
  Food:      { emoji: '🥗', bg: '#fff7ed', color: '#ea580c' },
  Water:     { emoji: '💧', bg: '#ecfeff', color: '#0891b2' },
  Waste:     { emoji: '♻️', bg: '#faf5ff', color: '#9333ea' },
  Nature:    { emoji: '🌳', bg: '#f0fdf4', color: '#16a34a' },
}
const DEFAULT_CAT = { emoji: '🌿', bg: '#f0fdf4', color: '#1a5c38' }

export default async function HistoryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: userActions } = await supabase
    .from('user_actions')
    .select('*, actions_library(*)')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  type LibRow = { co2_saved_kg: number; money_saved_nzd: number } | null
  const totalCO2 =
    userActions?.reduce(
      (s, a) => s + ((a.actions_library as unknown as LibRow)?.co2_saved_kg ?? 0),
      0
    ) ?? 0
  const totalMoney =
    userActions?.reduce(
      (s, a) => s + ((a.actions_library as unknown as LibRow)?.money_saved_nzd ?? 0),
      0
    ) ?? 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div
        className="px-4 lg:px-8 pt-10 pb-5"
        style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-white mb-0.5">Action History</h1>
          <p className="text-green-200/80 text-sm">{userActions?.length ?? 0} actions logged</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-4 pb-8">
        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1.5px solid #bbf7d0',
            }}
          >
            <div className="text-2xl font-black text-gray-900 leading-none">
              {totalCO2.toFixed(1)}<span className="text-sm font-medium text-gray-400">kg</span>
            </div>
            <div className="text-xs font-bold mt-1" style={{ color: '#1a5c38' }}>
              CO₂ saved
            </div>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1.5px solid #bbf7d0',
            }}
          >
            <div className="text-2xl font-black text-gray-900 leading-none">
              ${totalMoney.toFixed(2)}
            </div>
            <div className="text-xs font-bold mt-1" style={{ color: '#1a5c38' }}>
              Money saved
            </div>
          </div>
        </div>

        {/* Action list */}
        {!userActions || userActions.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl"
              style={{ backgroundColor: '#e8f5e9' }}
            >
              🌱
            </div>
            <p className="text-gray-800 font-bold text-lg mb-1">No actions yet</p>
            <p className="text-gray-400 text-sm mb-5">
              Start logging to see your impact history here!
            </p>
            <Link
              href="/log"
              className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #1a5c38, #4caf50)',
                boxShadow: '0 4px 16px rgba(26,92,56,0.3)',
              }}
            >
              Log your first action →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {userActions.map((ua) => {
              const action = ua.actions_library as {
                name: string
                category: string
                co2_saved_kg: number
                money_saved_nzd: number
                points: number
              } | null
              const cat = CATEGORY_CONFIG[action?.category ?? ''] ?? DEFAULT_CAT
              return (
                <div
                  key={ua.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-3"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: cat.bg }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{action?.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(ua.logged_at).toLocaleDateString('en-NZ', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-xs font-semibold" style={{ color: cat.color }}>
                      {action?.co2_saved_kg}kg CO₂
                    </div>
                    <div className="text-xs text-emerald-600 font-semibold">
                      ${action?.money_saved_nzd?.toFixed(2)} saved
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black" style={{ color: '#1a5c38' }}>
                      +{action?.points}
                    </div>
                    <div className="text-xs text-gray-400">pts</div>
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
