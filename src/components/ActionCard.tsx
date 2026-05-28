import type { ActionItem } from '@/lib/types'

const CATEGORY_EMOJI: Record<string, string> = {
  Transport: '🚌',
  Waste: '♻️',
  Energy: '⚡',
  Water: '💧',
  Food: '🥗',
  Nature: '🌳',
}

interface ActionCardProps {
  action: ActionItem
  onLog: (action: ActionItem) => void
  loading?: boolean
}

export default function ActionCard({ action, onLog, loading }: ActionCardProps) {
  return (
    <button
      onClick={() => onLog(action)}
      disabled={loading}
      className="bg-white rounded-2xl p-4 shadow-sm text-left w-full flex flex-col gap-2 active:scale-95 transition-transform disabled:opacity-50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">{CATEGORY_EMOJI[action.category] ?? '🌿'}</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#e8f5e9', color: '#1a5c38' }}
        >
          +{action.points} pts
        </span>
      </div>
      <div className="text-sm font-semibold text-gray-800 leading-snug">{action.name}</div>
      {action.description && (
        <div className="text-xs text-gray-400 leading-relaxed">{action.description}</div>
      )}
      <div className="flex gap-3 mt-1">
        <span className="text-xs text-green-700 font-medium">🌿 {action.co2_saved_kg}kg CO₂</span>
        {action.money_saved_nzd > 0 && (
          <span className="text-xs text-emerald-600 font-medium">💰 ${action.money_saved_nzd.toFixed(2)}</span>
        )}
      </div>
    </button>
  )
}
