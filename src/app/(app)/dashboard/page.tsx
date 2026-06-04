export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, ChevronRight, Trophy } from 'lucide-react'

function calcStreak(loggedDates: string[]): number {
  const dates = Array.from(new Set(loggedDates.map((d) => d.split('T')[0]))).sort().reverse()
  if (dates.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const diffDays = Math.round(
      (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000
    )
    if (diffDays === 1) streak++
    else break
  }
  return streak
}

function getMotivation(points: number): string {
  if (points === 0) return 'Log your first action to get started! 🌱'
  if (points < 50) return 'Great start — every action counts 🌿'
  if (points < 200) return "You're building real momentum! 💪"
  if (points < 500) return 'Fantastic work, climate champion! 🏆'
  return "Incredible — you're an Aotearoa hero! 🌏"
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!profile || !profile.name) redirect('/auth/setup')

  const [{ data: actions }, { data: challenge }] = await Promise.all([
    supabase
      .from('user_actions')
      .select('logged_at, actions_library(co2_saved_kg, money_saved_nzd, points)')
      .eq('user_id', user.id),
    supabase
      .from('challenges')
      .select('*, challenge_participants(user_id)')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  type LibRow = { co2_saved_kg: number; money_saved_nzd: number; points: number } | null
  const totalCO2 = actions?.reduce((s, a) => s + ((a.actions_library as unknown as LibRow)?.co2_saved_kg ?? 0), 0) ?? 0
  const totalMoney = actions?.reduce((s, a) => s + ((a.actions_library as unknown as LibRow)?.money_saved_nzd ?? 0), 0) ?? 0
  const actionCount = actions?.length ?? 0

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const weeklyCO2 =
    actions
      ?.filter((a) => a.logged_at >= oneWeekAgo)
      .reduce((s, a) => s + ((a.actions_library as unknown as LibRow)?.co2_saved_kg ?? 0), 0) ?? 0

  const streak = calcStreak(actions?.map((a) => a.logged_at) ?? [])
  const points = profile.points ?? 0

  const isJoined =
    challenge?.challenge_participants?.some((p: { user_id: string }) => p.user_id === user.id) ?? false

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // SVG progress ring (500 pts = full ring)
  const circumference = 2 * Math.PI * 38
  const ringFill = Math.min(1, points / 500)
  const dashOffset = circumference * (1 - ringFill)

  return (
    <div style={{ backgroundColor: '#f9f7f2', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-10 lg:pt-8 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-gray-500 text-sm">{greeting()},</p>
            <h1 className="text-2xl font-bold text-gray-900">{profile.name.split(' ')[0]} 👋</h1>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md"
            style={{ background: 'linear-gradient(135deg, #1a5c38, #2d7a4f)' }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Points banner with ring */}
        <div
          className="rounded-3xl p-5 mb-5 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d3d24 0%, #1a5c38 50%, #2d7a4f 100%)',
            boxShadow: '0 8px 32px rgba(26,92,56,0.4)',
          }}
        >
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full" />
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-green-100/80 text-xs font-semibold uppercase tracking-widest mb-1">Total points</p>
              <p className="text-6xl font-black leading-none mb-2">{points}</p>
              <p className="text-green-100 text-sm">{actionCount} action{actionCount !== 1 ? 's' : ''} logged</p>
              <p className="text-green-200/80 text-xs mt-2 leading-snug max-w-[180px]">{getMotivation(points)}</p>
            </div>
            {/* Circular ring */}
            <div className="relative flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
                <circle
                  cx="44"
                  cy="44"
                  r="38"
                  fill="none"
                  stroke="white"
                  strokeWidth="7"
                  strokeDasharray={String(circumference)}
                  strokeDashoffset={String(dashOffset)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center rotate-0">
                <span className="text-sm font-black text-white">{Math.round(ringFill * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly impact + streak */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1.5px solid #bbf7d0',
            }}
          >
            <div className="text-xl mb-1">🌿</div>
            <div className="text-2xl font-black text-gray-900 leading-none">
              {weeklyCO2.toFixed(1)}<span className="text-sm font-medium text-gray-400">kg</span>
            </div>
            <div className="text-xs font-bold mt-1" style={{ color: '#1a5c38' }}>
              This week CO₂
            </div>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{
              background: streak > 0 ? 'linear-gradient(135deg, #fff7ed, #ffedd5)' : 'white',
              border: `1.5px solid ${streak > 0 ? '#fed7aa' : '#f3f4f6'}`,
            }}
          >
            <div className="text-xl mb-1">🔥</div>
            <div className="text-2xl font-black text-gray-900 leading-none">{streak}</div>
            <div
              className="text-xs font-bold mt-1"
              style={{ color: streak > 0 ? '#ea580c' : '#9ca3af' }}
            >
              {streak === 1 ? '1-day streak' : `${streak > 0 ? streak + '-day' : 'No'} streak`}
            </div>
          </div>
        </div>

        {/* Total CO2 + Money */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="bg-white rounded-2xl p-4 shadow-sm"
            style={{ border: '1px solid #f0fdf4' }}
          >
            <div className="text-xl mb-1">🌍</div>
            <div className="text-2xl font-black text-gray-900 leading-none">
              {totalCO2.toFixed(1)}<span className="text-sm font-medium text-gray-400">kg</span>
            </div>
            <div className="text-xs font-bold mt-1" style={{ color: '#1a5c38' }}>
              Total CO₂ saved
            </div>
          </div>
          <div
            className="bg-white rounded-2xl p-4 shadow-sm"
            style={{ border: '1px solid #f0fdf4' }}
          >
            <div className="text-xl mb-1">💰</div>
            <div className="text-2xl font-black text-gray-900 leading-none">
              ${totalMoney.toFixed(0)}<span className="text-sm font-medium text-gray-400"> NZD</span>
            </div>
            <div className="text-xs font-bold mt-1" style={{ color: '#1a5c38' }}>
              Money saved
            </div>
          </div>
        </div>

        {/* Weekly impact statement banner */}
        {weeklyCO2 > 0 && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: 'linear-gradient(135deg, #1a5c38, #2d7a4f)',
              boxShadow: '0 4px 20px rgba(26,92,56,0.25)',
            }}
          >
            <p className="text-green-100/70 text-xs font-semibold uppercase tracking-widest mb-1">
              This week&apos;s impact
            </p>
            <p className="text-white font-black text-xl leading-tight">
              You&apos;ve saved {weeklyCO2.toFixed(1)}kg CO₂ 🌏
            </p>
            <p className="text-green-200/80 text-xs mt-1">
              ≈ {Math.ceil(weeklyCO2 * 2)} tree-days of carbon absorption
            </p>
          </div>
        )}

        {/* Log action CTA */}
        <Link
          href="/log"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-white text-base mb-5 transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #1a5c38, #4caf50)',
            boxShadow: '0 6px 20px rgba(26,92,56,0.4)',
          }}
        >
          <PlusCircle className="w-5 h-5" />
          Log a Climate Action
        </Link>

        {/* Challenge + quick links */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-4">
          {challenge && (
            <div
              className="bg-white rounded-2xl p-4 shadow-sm mb-4 lg:mb-0"
              style={{ border: '1px solid #f0fdf4' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg, #1a5c38, #4caf50)' }}
                    >
                      ACTIVE
                    </span>
                    <span className="text-xs text-gray-400">Challenge</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{challenge.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{challenge.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Ends{' '}
                    {new Date(challenge.end_date).toLocaleDateString('en-NZ', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Link href="/challenges">
                  <ChevronRight className="w-5 h-5 text-gray-300 mt-1" />
                </Link>
              </div>
              {!isJoined && (
                <Link
                  href="/challenges"
                  className="block mt-3 text-center py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95"
                  style={{ backgroundColor: '#e8f5e9', color: '#1a5c38' }}
                >
                  Join this challenge →
                </Link>
              )}
            </div>
          )}

          <div className="hidden lg:flex flex-col gap-3">
            <Link
              href="/history"
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #f0fdf4' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: '#e8f5e9' }}
              >
                📋
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">Action History</div>
                <div className="text-xs text-gray-400">
                  {actionCount} action{actionCount !== 1 ? 's' : ''} logged
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
            </Link>
            <Link
              href="/leaderboard"
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #f0fdf4' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#e8f5e9' }}
              >
                <Trophy className="w-5 h-5" style={{ color: '#1a5c38' }} />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">Leaderboard</div>
                <div className="text-xs text-gray-400">See where you rank</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
