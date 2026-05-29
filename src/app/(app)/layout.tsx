export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import SideNav from '@/components/SideNav'
import BottomNav from '@/components/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName = user?.email ?? ''
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()
    if (profile?.name) displayName = profile.name
  }

  return (
    <div className="lg:flex min-h-screen" style={{ backgroundColor: '#f9f7f2' }}>
      <SideNav displayName={displayName} />
      <main className="flex-1 pb-20 lg:pb-0 lg:ml-64 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
