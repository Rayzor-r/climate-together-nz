'use client'

import { Download } from 'lucide-react'

export default function AdminExportButton() {
  async function handleExport(type: 'users' | 'actions') {
    const response = await fetch(`/api/admin/export?type=${type}`)
    if (!response.ok) { alert('Export failed'); return }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `climate-together-${type}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('users')}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: '#1a5c38' }}
      >
        <Download className="w-4 h-4" />
        Export Users CSV
      </button>
      <button
        onClick={() => handleExport('actions')}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: '#2d7a4f' }}
      >
        <Download className="w-4 h-4" />
        Export Actions CSV
      </button>
    </div>
  )
}
