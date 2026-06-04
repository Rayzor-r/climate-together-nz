import type { ActionItem } from '@/lib/types'

const CATEGORY_CONFIG: Record<string, { emoji: string; bg: string; accent: string; border: string; gradientFrom: string }> = {
  Transport: { emoji: '🚌', bg: '#eff6ff', accent: '#2563eb', border: '#bfdbfe', gradientFrom: '#dbeafe' },
  Energy:    { emoji: '⚡', bg: '#fffbeb', accent: '#d97706', border: '#fde68a', gradientFrom: '#fef3c7' },
  Food:      { emoji: '🥗', bg: '#fff7ed', accent: '#ea580c', border: '#fed7aa', gradientFrom: '#ffedd5' },
  Water:     { emoji: '💧', bg: '#ecfeff', accent: '#0891b2', border: '#a5f3fc', gradientFrom: '#cffafe' },
  Waste:     { emoji: '♻️', bg: '#faf5ff', accent: '#9333ea', border: '#e9d5ff', gradientFrom: '#f3e8ff' },
  Nature:    { emoji: '🌳', bg: '#f0fdf4', accent: '#16a34a', border: '#bbf7d0', gradientFrom: '#dcfce7' },
}

const DEFAULT_CONFIG = { emoji: '🌿', bg: '#f0fdf4', accent: '#1a5c38', border: '#bbf7d0', gradientFrom: '#dcfce7' }

interface ActionCardProps {
  action: ActionItem
  onLog: (action: ActionItem) => void
  loading?: boolean
}

export default function ActionCard({ action, onLog, loading }: ActionCardProps) {
  const cfg = CATEGORY_CONFIG[action.category] ?? DEFAULT_CONFIG

  return (
    <button
      onClick={() => onLog(action)}
      disabled={loading}
      className="rounded-2xl p-4 text-left w-full flex flex-col gap-2 transition-all duration-150 active:scale-95 disabled:opacity-50"
      style={{
        backgroundColor: 'white',
        border: `1.5px solid ${cfg.border}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${cfg.bg}, ${cfg.gradientFrom})` }}
        >
          {loading ? (
            <span
              className="w-4 h-4 border-2 border-t-transparent rounded-full inline-block"
              style={{
                borderColor: cfg.accent,
                borderTopColor: 'transparent',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          ) : (
            cfg.emoji
          )}
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full mt-0.5 flex-shrink-0"
          style={{ backgroundColor: cfg.bg, color: cfg.accent }}
        >
          +{action.points} pts
        </span>
      </div>

      <div className="text-sm font-semibold text-gray-800 leading-snug">{action.name}</div>

      {action.description && (
        <div className="text-xs text-gray-400 leading-relaxed line-clamp-2">{action.description}</div>
      )}

      <div
        className="flex gap-3 mt-auto pt-2"
        style={{ borderTop: `1px solid ${cfg.border}` }}
      >
        <span className="text-xs font-bold" style={{ color: cfg.accent }}>
          🌿 {action.co2_saved_kg}kg CO₂
        </span>
        {action.money_saved_nzd > 0 && (
          <span className="text-xs font-bold text-emerald-600">
            💰 ${action.money_saved_nzd.toFixed(2)}
          </span>
        )}
      </div>
    </button>
  )
}
