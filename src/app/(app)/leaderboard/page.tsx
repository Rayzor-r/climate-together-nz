export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const tab = searchParams.tab === 'group' ? 'group' : 'individual'

  let leaderboard: {
    id: string
    name: string
    points: number
    region: string | null
    user_type: string | null
  }[] = []

  if (tab === 'individual') {
    const { data } = await supabase
      .from('users')
      .select('id, name, points, region, user_type')
      .order('points', { ascending: false })
      .limit(50)
    leaderboard = data ?? []
  } else {
    const { data } = await supabase
      .from('users')
      .select('group_id, points, groups(name, type)')
      .not('group_id', 'is', null)
    const map = new Map<
      string,
      { id: string; name: string; points: number; region: null; user_type: string | null }
    >()
    for (const u of data ?? []) {
      const g = u.groups as unknown as { name: string; type: string } | null
      if (!g || !u.group_id) continue
      const existing = map.get(u.group_id as string)
      if (existing) {
        existing.points += u.points ?? 0
      } else {
        map.set(u.group_id as string, {
          id: u.group_id as string,
          name: g.name,
          points: u.points ?? 0,
          region: null,
          user_type: g.type,
        })
      }
    }
    leaderboard = Array.from(map.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 50)
  }

  const myRank = leaderboard.findIndex((e) => e.id === user.id)

  const PODIUM = [
    {
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      ring: '#fef3c7',
      podiumBg: 'linear-gradient(180deg, #f59e0b, #d97706)',
      height: 64,
      medal: '🥇',
      label: '#FFD700',
    },
    {
      gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)',
      ring: '#f3f4f6',
      podiumBg: 'linear-gradient(180deg, #9ca3af, #6b7280)',
      height: 48,
      medal: '🥈',
      label: '#9ca3af',
    },
    {
      gradient: 'linear-gradient(135deg, #cd7f32, #92400e)',
      ring: '#fde68a',
      podiumBg: 'linear-gradient(180deg, #cd7f32, #92400e)',
      height: 40,
      medal: '🥉',
      label: '#cd7f32',
    },
  ]

  const podiumOrder = [1, 0, 2] // silver | gold | bronze layout

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div
        className="px-4 lg:px-8 pt-10 pb-5"
        style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-white mb-3">Leaderboard</h1>
          <div className="flex gap-2 bg-white/10 rounded-xl p-1 max-w-xs">
            <a
              href="/leaderboard?tab=individual"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'individual' ? 'bg-white text-gray-900' : 'text-white/80'
              }`}
            >
              Individual
            </a>
            <a
              href="/leaderboard?tab=group"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'group' ? 'bg-white text-gray-900' : 'text-white/80'
              }`}
            >
              Group
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-5 pb-8">
        {leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl"
              style={{ backgroundColor: '#e8f5e9' }}
            >
              🌱
            </div>
            <p className="text-gray-800 font-bold text-lg mb-1">No data yet</p>
            <p className="text-gray-400 text-sm">Be the first to log actions and top the board!</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium — shown when there are at least 3 entries */}
            {tab === 'individual' && leaderboard.length >= 3 && (
              <div className="mb-6 px-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-4">
                  Top 3
                </p>
                <div className="flex items-end justify-center gap-3">
                  {podiumOrder.map((rankIdx) => {
                    const entry = leaderboard[rankIdx]
                    const cfg = PODIUM[rankIdx]
                    return (
                      <div key={rankIdx} className={`flex flex-col items-center gap-1 ${rankIdx === 0 ? 'scale-110' : ''}`}>
                        <span className="text-2xl">{cfg.medal}</span>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg"
                          style={{
                            background: cfg.gradient,
                            boxShadow: `0 4px 16px ${cfg.label}55, 0 0 0 3px ${cfg.ring}`,
                          }}
                        >
                          {(entry.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs font-bold text-gray-700 max-w-[64px] text-center truncate">
                          {entry.name?.split(' ')[0] || 'Anonymous'}
                        </p>
                        {entry.id === user.id && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#1a5c38' }}>
                            YOU
                          </span>
                        )}
                        <div
                          className="w-16 rounded-t-xl flex flex-col items-center justify-center py-2"
                          style={{
                            height: cfg.height,
                            background: cfg.podiumBg,
                          }}
                        >
                          <span className="text-white font-black text-sm">{entry.points}</span>
                          <span className="text-white/70 text-[10px]">pts</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* My rank banner */}
            {tab === 'individual' && myRank >= 0 && myRank >= 3 && (
              <div
                className="mb-3 p-4 rounded-2xl flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  border: '2px solid #4caf50',
                }}
              >
                <span className="text-xl font-black w-8 text-center" style={{ color: '#1a5c38' }}>
                  #{myRank + 1}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-bold text-gray-900">You</span>
                  <p className="text-xs text-gray-500">Rank #{myRank + 1} overall</p>
                </div>
                <span className="font-black text-base" style={{ color: '#1a5c38' }}>
                  {leaderboard[myRank].points} pts
                </span>
              </div>
            )}

            {/* Desktop table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #f0fdf4' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 w-14">Rank</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Region</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 capitalize">Type</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaderboard.map((entry, i) => {
                    const isMe = entry.id === user.id
                    const isTop3 = i < 3
                    const medalColors = ['#f59e0b', '#9ca3af', '#cd7f32']
                    return (
                      <tr
                        key={entry.id}
                        style={
                          isMe
                            ? { background: 'linear-gradient(90deg, #f0fdf4, #dcfce7)' }
                            : isTop3
                            ? { backgroundColor: `${medalColors[i]}08` }
                            : {}
                        }
                        className={!isMe && !isTop3 ? 'hover:bg-gray-50' : ''}
                      >
                        <td className="px-4 py-3 text-center">
                          {isTop3 ? (
                            <span className="text-lg">{['🥇', '🥈', '🥉'][i]}</span>
                          ) : (
                            <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-sm text-gray-900">
                          {entry.name || 'Anonymous'}
                          {isMe && (
                            <span
                              className="text-[10px] font-bold ml-1.5 px-1.5 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: '#1a5c38' }}
                            >
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{entry.region ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                          {entry.user_type ?? '—'}
                        </td>
                        <td
                          className="px-4 py-3 text-right font-black text-sm"
                          style={{ color: '#1a5c38' }}
                        >
                          {entry.points}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="lg:hidden space-y-2">
              {leaderboard.map((entry, i) => {
                const isMe = entry.id === user.id
                const isTop3 = i < 3
                const medalColors = ['#f59e0b', '#9ca3af', '#cd7f32']
                const medals = ['🥇', '🥈', '🥉']

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={
                      isMe
                        ? {
                            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                            border: '2px solid #4caf50',
                            boxShadow: '0 4px 16px rgba(76,175,80,0.2)',
                          }
                        : isTop3
                        ? {
                            backgroundColor: 'white',
                            border: `2px solid ${medalColors[i]}40`,
                            boxShadow: `0 2px 8px ${medalColors[i]}20`,
                          }
                        : {
                            backgroundColor: 'white',
                            border: '1px solid #f3f4f6',
                          }
                    }
                  >
                    <div className="w-9 text-center flex-shrink-0">
                      {isTop3 ? (
                        <span className="text-2xl">{medals[i]}</span>
                      ) : (
                        <span className="text-sm font-black text-gray-400">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {entry.name || 'Anonymous'}
                        </p>
                        {isMe && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                            style={{ backgroundColor: '#1a5c38' }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                      {(entry.region || entry.user_type) && (
                        <p className="text-xs text-gray-400 capitalize">
                          {entry.region ?? entry.user_type}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className="font-black text-sm"
                        style={{ color: isTop3 ? medalColors[i] : '#1a5c38' }}
                      >
                        {entry.points}
                      </div>
                      <div className="text-xs text-gray-400">pts</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
