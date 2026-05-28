'use client'

import { adminLogout } from './actions'
import { useRouter } from 'next/navigation'

export default function AdminLogoutButton() {
  const router = useRouter()
  async function handleLogout() {
    await adminLogout()
    router.refresh()
  }
  return (
    <button
      onClick={handleLogout}
      className="text-xs text-green-200 border border-green-600 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
    >
      Sign out
    </button>
  )
}
