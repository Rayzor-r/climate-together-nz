'use client'

import { useState } from 'react'
import { createChallenge, toggleChallenge } from './actions'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export default function AdminChallengeManager({ challenges }: { challenges: Challenge[] }) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startDate || !endDate) {
      setError('Title, start date and end date are required.')
      return
    }
    if (endDate <= startDate) {
      setError('End date must be after start date.')
      return
    }
    setSaving(true)
    setError('')
    const result = await createChallenge({ title: title.trim(), description: description.trim(), start_date: startDate, end_date: endDate })
    setSaving(false)
    if (result.success) {
      setTitle(''); setDescription(''); setStartDate(''); setEndDate('')
      setShowForm(false)
      setSuccess('Challenge created.')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error ?? 'Failed to create challenge.')
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    setToggling(id)
    await toggleChallenge(id, !currentActive)
    setToggling(null)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700">Challenges ({challenges.length})</h2>
        <button
          onClick={() => { setShowForm(!showForm); setError('') }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
          style={{ backgroundColor: '#1a5c38' }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Challenge
        </button>
      </div>

      {success && <div className="mb-3 p-3 rounded-xl text-sm bg-green-50 text-green-700 font-medium">{success}</div>}
      {error && <div className="mb-3 p-3 rounded-xl text-sm bg-red-50 text-red-700 font-medium">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Create Challenge</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. June Low-Carbon Week"
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this challenge about?"
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#1a5c38' }}
            >
              {saving ? 'Saving…' : 'Create Challenge'}
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

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {challenges.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">No challenges yet. Create one above.</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#f9f7f2' }}>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Title</th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-500 hidden sm:table-cell">Start</th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-500 hidden sm:table-cell">End</th>
                <th className="text-center px-3 py-2.5 font-semibold text-gray-500">Status</th>
                <th className="text-center px-3 py-2.5 font-semibold text-gray-500">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {challenges.map((ch) => (
                <tr key={ch.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium text-gray-900">{ch.title}</td>
                  <td className="px-3 py-2.5 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                    {new Date(ch.start_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                    {new Date(ch.end_date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={ch.is_active
                        ? { backgroundColor: '#e8f5e9', color: '#1a5c38' }
                        : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
                    >
                      {ch.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => handleToggle(ch.id, ch.is_active)}
                      disabled={toggling === ch.id}
                      className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 disabled:opacity-40"
                      title={ch.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {ch.is_active
                        ? <ToggleRight className="w-5 h-5" style={{ color: '#1a5c38' }} />
                        : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
