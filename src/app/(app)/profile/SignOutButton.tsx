'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={signOut}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 text-sm font-semibold text-red-500 border-red-100 bg-white mb-4"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  )
}
