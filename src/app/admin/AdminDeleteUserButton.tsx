'use client'

import { useState } from 'react'
import { deleteUser } from './actions'
import { Trash2 } from 'lucide-react'

interface Props {
  userId: string
  userName: string
}

export default function AdminDeleteUserButton({ userId, userName }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (!window.confirm(`Delete user "${userName}"? This will permanently remove their account, profile, and all logged actions. This cannot be undone.`)) return

    setLoading(true)
    setError('')
    const result = await deleteUser(userId)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? 'Delete failed')
    }
    // On success, revalidatePath('/admin') in the server action refreshes the table.
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={loading}
        title={`Delete ${userName}`}
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      {error && (
        <div className="text-xs text-red-600 mt-0.5 max-w-[120px]">{error}</div>
      )}
    </div>
  )
}
