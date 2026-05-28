export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminPage() {
  const cookieStore = cookies()
  const isAuthed = cookieStore.get('admin_auth')?.value === 'true'

  if (!isAuthed) return <AdminLogin />
  return <AdminDashboard />
}
