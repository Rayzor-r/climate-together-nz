export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SignOutButton from './SignOutButton'
import { User, MapPin, Star, Leaf, DollarSign, Users } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: profile }, { data: actions }] = await Promise.all([
    supabase.from('users').select('*, groups(name, type)').eq('id', user.id).single(),
    supabase.from('user_actions').select('actions_library(co2_saved_kg, money_saved_nzd)').eq('user_id', user.id),
  ])

  const totalCO2 = actions?.reduce((s, a) => s + ((a.actions_library as unknown as { co2_saved_kg: number } | null)?.co2_saved_kg ?? 0), 0) ?? 0
  const totalMoney = actions?.reduce((s, a) => s + ((a.actions_library as unknown as { money_saved_nzd: number } | null)?.money_saved_nzd ?? 0), 0) ?? 0
  const actionCount = actions?.length ?? 0

  const USER_TYPE_LABELS: Record<string, string> = {
    individual: '🙋 Individual',
    school: '🏫 School',
    business: '🏢 Business',
    community: '🤝 Community group',
  }

  const group = profile?.groups as unknown as { name: string; type: string } | null

  const infoRows = [
    { icon: User, label: 'Account type', value: profile?.user_type ? (USER_TYPE_LABELS[profile.user_type] ?? profile.user_type) : 'Not set' },
    { icon: MapPin, label: 'Region', value: profile?.region ?? 'Not set' },
    { icon: Star, label: 'Actions logged', value: String(actionCount) },
    ...(group ? [{ icon: Users, label: 'Group', value: `${group.name} (${group.type})` }] : []),
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div
        className="px-4 lg:px-8 pt-10 pb-8 text-center"
        style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-4xl font-bold text-white">
              {profile?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-0.5">{profile?.name || 'Kia ora!'}</h1>
          <p className="text-green-200 text-sm">{user.email}</p>
          {profile?.region && (
            <p className="text-green-200 text-sm flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />{profile.region}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-8">
        {/* Stats */}
        <div className="-mt-5 mb-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Star, value: String(profile?.points ?? 0), label: 'Points', color: '#f59e0b' },
              { icon: Leaf, value: `${totalCO2.toFixed(1)}kg`, label: 'CO₂ saved', color: '#1a5c38' },
              { icon: DollarSign, value: `$${totalMoney.toFixed(0)}`, label: 'Saved', color: '#10b981' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
                <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                <div className="font-bold text-gray-900 text-base">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info + sign out — 2-col on desktop */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Profile details */}
          <div className="space-y-2 mb-5 lg:mb-0">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-1 mb-2">Profile details</h2>
            {infoRows.map((row) => (
              <div key={row.label} className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3">
                <row.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-gray-400">{row.label}</div>
                  <div className="text-sm font-medium text-gray-900">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Account actions */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-1 mb-2">Account</h2>
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  )
}
