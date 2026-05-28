import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, ChevronRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Fetch profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // First-time setup redirect
  if (!profile || !profile.name) redirect('/auth/setup')

  // Fetch aggregate stats from user_actions joined to actions_library
  const { data: actions } = await supabase
    .from('user_actions')
    .select('actions_library(co2_saved_kg, money_saved_nzd, points)')
    .eq('user_id', user.id)

  const totalCO2 = actions?.reduce((sum, a) => sum + ((a.actions_library as unknown as { co2_saved_kg: number } | null)?.co2_saved_kg ?? 0), 0) ?? 0
  const totalMoney = actions?.reduce((sum, a) => sum + ((a.actions_library as unknown as { money_saved_nzd: number } | null)?.money_saved_nzd ?? 0), 0) ?? 0
  const actionCount = actions?.length ?? 0

  // Fetch active challenge
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*, challenge_participants(id)')
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const isJoined = challenge?.challenge_participants?.some(
    (p: { id: string }) => p.id
  ) ?? false

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="px-4 pt-12 pb-4" style={{ backgroundColor: '#f9f7f2', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm">{greeting()},</p>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name.split(' ')[0]} 👋</h1>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base"
          style={{ backgroundColor: '#1a5c38' }}
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Points banner */}
      <div
        className="rounded-3xl p-5 mb-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a5c38 0%, #4caf50 100%)' }}
      >
        <p className="text-green-100 text-xs font-medium uppercase tracking-widest mb-1">Total points</p>
        <p className="text-5xl font-bold mb-1">{profile.points ?? 0}</p>
        <p className="text-green-100 text-sm">{actionCount} action{actionCount !== 1 ? 's' : ''} logged</p>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-2xl mb-1">🌿</div>
          <div className="text-2xl font-bold text-gray-900">{totalCO2.toFixed(1)}<span className="text-base font-medium text-gray-400">kg</span></div>
          <div className="text-xs font-medium mt-0.5" style={{ color: '#1a5c38' }}>CO₂ saved</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-2xl font-bold text-gray-900">${totalMoney.toFixed(0)}<span className="text-base font-medium text-gray-400"> NZD</span></div>
          <div className="text-xs font-medium mt-0.5" style={{ color: '#1a5c38' }}>Money saved</div>
        </div>
      </div>

      {/* Log action button */}
      <Link
        href="/log"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg mb-5"
        style={{ backgroundColor: '#4caf50' }}
      >
        <PlusCircle className="w-5 h-5" />
        Log a Climate Action
      </Link>

      {/* Active challenge card */}
      {challenge && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#4caf50' }}>
                  ACTIVE
                </span>
                <span className="text-xs text-gray-400">Challenge</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{challenge.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{challenge.description}</p>
              <p className="text-xs text-gray-400 mt-2">Ends {new Date(challenge.end_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}</p>
            </div>
            <Link href="/challenges">
              <ChevronRight className="w-5 h-5 text-gray-300 mt-1" />
            </Link>
          </div>
          {!isJoined && (
            <Link
              href="/challenges"
              className="block mt-3 text-center py-2.5 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: '#e8f5e9', color: '#1a5c38' }}
            >
              Join this challenge →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
