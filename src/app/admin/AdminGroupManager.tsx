'use client'

import { useState } from 'react'
import { createGroup } from './actions'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'

interface Group {
  id: string
  name: string
  type: string
  created_at: string
  member_count: number
  members: { name: string; email: string; points: number }[]
}

const GROUP_TYPES = [
  { value: 'school', label: 'School' },
  { value: 'business', label: 'Business / Workplace' },
  { value: 'community', label: 'Community Group' },
]

const TYPE_EMOJI: Record<string, string> = {
  school: '🏫',
  business: '🏢',
  community: '🤝',
}

export default function AdminGroupManager({ groups }: { groups: Group[] }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'school' | 'business' | 'community'>('community')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Group name is required.'); return }
    setSaving(true)
    setError('')
    const result = await createGroup({ name: name.trim(), type })
    setSaving(false)
    if (result.success) {
      setName(''); setType('community'); setShowForm(false)
      setSuccess('Group created.')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error ?? 'Failed to create group.')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700">Groups ({groups.length})</h2>
        <button
          onClick={() => { setShowForm(!showForm); setError('') }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
          style={{ backgroundColor: '#1a5c38' }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Group
        </button>
      </div>

      {success && <div className="mb-3 p-3 rounded-xl text-sm bg-green-50 text-green-700 font-medium">{success}</div>}
      {error && <div className="mb-3 p-3 rounded-xl text-sm bg-red-50 text-red-700 font-medium">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Create Group</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Group name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kaitaia Primary School"
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'school' | 'business' | 'community')}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2"
            >
              {GROUP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#1a5c38' }}
            >
              {saving ? 'Saving…' : 'Create Group'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400 shadow-sm">
          No groups yet. Create one above.
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{TYPE_EMOJI[g.type] ?? '👥'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">{g.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{g.type} · {g.member_count} member{g.member_count !== 1 ? 's' : ''}</div>
                </div>
                {expanded === g.id
                  ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>

              {expanded === g.id && g.members.length > 0 && (
                <div className="border-t border-gray-50 px-4 pb-3">
                  <table className="w-full text-xs mt-2">
                    <thead>
                      <tr>
                        <th className="text-left py-1.5 font-semibold text-gray-500">Member</th>
                        <th className="text-right py-1.5 font-semibold text-gray-500">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.members.map((m, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="py-1.5 text-gray-700">{m.name || m.email}</td>
                          <td className="py-1.5 text-right font-semibold" style={{ color: '#1a5c38' }}>{m.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {expanded === g.id && g.members.length === 0 && (
                <div className="border-t border-gray-50 px-4 py-3 text-xs text-gray-400">No members yet.</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
