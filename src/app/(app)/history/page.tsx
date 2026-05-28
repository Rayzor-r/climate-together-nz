import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const CATEGORY_EMOJI: Record<string, string> = {
  Transport: '🚌', Waste: '♻️', Energy: '⚡', Water: '💧', Food: '🥗', Nature: '🌳',
}

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: userActions } = await supabase
    .from('user_actions')
    .select('*, actions_library(*)')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  const totalCO2 = userActions?.reduce(
    (s, a) => s + ((a.actions_library as unknown as { co2_saved_kg: number } | null)?.co2_saved_kg ?? 0), 0
  ) ?? 0
  const totalMoney = userActions?.reduce(
    (s, a) => s + ((a.actions_library as unknown as { money_saved_nzd: number } | null)?.money_saved_nzd ?? 0), 0
  ) ?? 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 100%)' }}
      >
        <h1 className="text-xl font-bold text-white mb-0.5">Action History</h1>
        <p className="text-green-200 text-sm">{userActions?.length ?? 0} actions logged</p>
      </div>

      {/* Summary strip */}
      <div className="px-4 -mt-0 pt-4">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="text-xl font-bold text-gray-900">
              {totalCO2.toFixed(1)}<span className="text-sm font-medium text-gray-400">kg</span>
            </div>
            <div className="text-xs font-medium" style={{ color: '#1a5c38' }}>CO₂ saved</div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="text-xl font-bold text-gray-900">${totalMoney.toFixed(2)}</div>
            <div className="text-xs font-medium" style={{ color: '#1a5c38' }}>Money saved</div>
          </div>
        </div>
      </div>

      {/* Action list */}
      <div className="px-4 space-y-2 pb-8">
        {!userActions || userActions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-gray-600 font-medium">No actions yet</p>
            <p className="text-gray-400 text-sm mt-1">Start logging to see your impact here!</p>
            <Link
              href="/log"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ backgroundColor: '#1a5c38' }}
            >
              Log your first action →
            </Link>
          </div>
        ) : (
          userActions.map((ua) => {
            const action = ua.actions_library as {
              name: string; category: string; co2_saved_kg: number;
              money_saved_nzd: number; points: number
            } | null
            return (
              <div key={ua.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: '#e8f5e9' }}
                >
                  {CATEGORY_EMOJI[action?.category ?? ''] ?? '🌿'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{action?.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(ua.logged_at).toLocaleDateString('en-NZ', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: '#1a5c38' }}>+{action?.points} pts</div>
                  <div className="text-xs text-gray-400">{action?.co2_saved_kg}kg CO₂</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
