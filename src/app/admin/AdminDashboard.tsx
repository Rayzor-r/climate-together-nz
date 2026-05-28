import { createAdminClient } from '@/lib/supabase-server'
import AdminLogoutButton from './AdminLogoutButton'
import AdminExportButton from './AdminExportButton'
import { Users, Activity, Leaf, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  // Fetch all users
  const { data: users } = await supabase
    .from('users')
    .select('*, groups(name)')
    .order('created_at', { ascending: false })

  // Fetch all actions with join
  const { data: userActions } = await supabase
    .from('user_actions')
    .select('*, users(name, email), actions_library(name, co2_saved_kg, money_saved_nzd, points)')
    .order('logged_at', { ascending: false })
    .limit(200)

  const totalUsers = users?.length ?? 0
  const totalActions = userActions?.length ?? 0
  const totalCO2 = userActions?.reduce((s, a) => s + ((a.actions_library as unknown as { co2_saved_kg: number } | null)?.co2_saved_kg ?? 0), 0) ?? 0
  const totalMoney = userActions?.reduce((s, a) => s + ((a.actions_library as unknown as { money_saved_nzd: number } | null)?.money_saved_nzd ?? 0), 0) ?? 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      {/* Header */}
      <div className="px-4 pt-10 pb-5" style={{ background: 'linear-gradient(135deg, #1a5c38 0%, #2d7a4f 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-xs font-medium uppercase tracking-widest">Admin</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Climate Together NZ</h1>
            <p className="text-green-200 text-sm">Dashboard overview</p>
          </div>
          <AdminLogoutButton />
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: 'Total users', value: totalUsers, color: '#1a5c38' },
            { icon: Activity, label: 'Actions logged', value: totalActions, color: '#4caf50' },
            { icon: Leaf, label: 'CO₂ saved', value: `${totalCO2.toFixed(1)}kg`, color: '#2d7a4f' },
            { icon: DollarSign, label: 'Money saved', value: `$${totalMoney.toFixed(2)}`, color: '#10b981' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <s.icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Export button */}
        <AdminExportButton />

        {/* Users table */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 mb-2">Users ({totalUsers})</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: '#f9f7f2' }}>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Name</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Email</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Type</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Region</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-500">Pts</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users?.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{u.name || '—'}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{u.email}</td>
                      <td className="px-3 py-2.5 text-gray-500 capitalize whitespace-nowrap">{u.user_type ?? '—'}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{u.region ?? '—'}</td>
                      <td className="px-3 py-2.5 font-bold text-right whitespace-nowrap" style={{ color: '#1a5c38' }}>{u.points}</td>
                      <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Actions table */}
        <section className="pb-8">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Recent Actions (last 200)</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: '#f9f7f2' }}>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">User</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Action</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-500">CO₂</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-500">$</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {userActions?.map((ua) => {
                    const action = ua.actions_library as unknown as { name: string; co2_saved_kg: number; money_saved_nzd: number } | null
                    const user = ua.users as unknown as { name: string; email: string } | null
                    return (
                      <tr key={ua.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{user?.name || user?.email || '—'}</td>
                        <td className="px-3 py-2.5 text-gray-500">{action?.name ?? '—'}</td>
                        <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">{action?.co2_saved_kg}kg</td>
                        <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">${action?.money_saved_nzd?.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">
                          {new Date(ua.logged_at).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
