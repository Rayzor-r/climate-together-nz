import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { BarChart3 } from 'lucide-react'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const tab = searchParams.tab === 'group' ? 'group' : 'individual'

  let leaderboard: { id: string; name: string; points: number; region: string | null; user_type: string | null }[] = []

  if (tab === 'individual') {
    const { data } = await supabase
      .from('users')
      .select('id, name, points, region, user_type')
      .order('points', { ascending: false })
      .limit(50)
    leaderboard = data ?? []
  } else {
    // Group leaderboard: sum user points by group
    const { data } = await supabase
      .from('users')
      .select('group_id, points, groups(name, type)')
      .not('group_id', 'is', null)
    // Aggregate client-side
    const map = new Map<string, { id: string; name: string; points: number; region: null; user_type: string | null }>()
    for (const u of data ?? []) {
      const g = u.groups as unknown as { name: string; type: string } | null
      if (!g || !u.group_id) continue
      const existing = map.get(u.group_id as string)
      if (existing) {
        existing.points += u.points ?? 0
      } else {
        map.set(u.group_id as string, { id: u.group_id as string, name: g.name, points: u.points ?? 0, region: null, user_type: g.type })
      }
    }
    leaderboard = Array.from(map.values()).sort((a, b) => b.points - a.points).slice(0, 50)
  }

  const rankEmoji = (i: number) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `${i + 1}`
  }

  const myRank = leaderboard.findIndex((e) => e.id === user.id)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div
        className="px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 100%)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-green-300" />
          <h1 className="text-xl font-bold text-white">Leaderboard</h1>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 bg-white/10 rounded-xl p-1">
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

      {/* My rank */}
      {tab === 'individual' && myRank >= 0 && (
        <div className="mx-4 mt-4 p-3 rounded-2xl flex items-center gap-3" style={{ backgroundColor: '#e8f5e9', borderWidth: 1.5, borderColor: '#4caf50', borderStyle: 'solid' }}>
          <span className="text-lg font-bold w-8 text-center" style={{ color: '#1a5c38' }}>
            {rankEmoji(myRank)}
          </span>
          <div className="flex-1">
            <span className="text-sm font-bold text-gray-900">You</span>
            <span className="text-xs text-gray-500 ml-2">Rank #{myRank + 1}</span>
          </div>
          <span className="font-bold text-sm" style={{ color: '#1a5c38' }}>{leaderboard[myRank].points} pts</span>
        </div>
      )}

      {/* List */}
      <div className="px-4 pt-3 pb-8 space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-gray-600 font-medium">No data yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to log actions and top the board!</p>
          </div>
        ) : (
          leaderboard.map((entry, i) => (
            <div
              key={entry.id}
              className={`bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3 ${entry.id === user.id ? 'ring-2' : ''}`}
              style={entry.id === user.id ? { ringColor: '#4caf50' } as React.CSSProperties : {}}
            >
              <span className={`text-lg font-bold w-8 text-center ${i < 3 ? '' : 'text-gray-400'}`}>
                {rankEmoji(i)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {entry.name || 'Anonymous'}
                  {entry.id === user.id && <span className="text-xs text-gray-400 ml-1">(you)</span>}
                </p>
                {entry.region && <p className="text-xs text-gray-400">{entry.region}</p>}
                {entry.user_type && !entry.region && <p className="text-xs text-gray-400 capitalize">{entry.user_type}</p>}
              </div>
              <div className="text-right">
                <div className="font-bold text-sm" style={{ color: '#1a5c38' }}>{entry.points}</div>
                <div className="text-xs text-gray-400">pts</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
