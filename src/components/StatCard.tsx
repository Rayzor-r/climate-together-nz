interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: string
  color?: string
}

export default function StatCard({ label, value, sub, icon, color = '#1a5c38' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1">
      <div className="text-2xl">{icon}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
      <div className="text-xs font-medium mt-0.5" style={{ color }}>{label}</div>
    </div>
  )
}
