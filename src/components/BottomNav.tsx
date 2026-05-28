'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Trophy, BarChart3, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard',    icon: Home,        label: 'Home' },
  { href: '/log',          icon: PlusCircle,  label: 'Log' },
  { href: '/challenges',   icon: Trophy,      label: 'Challenges' },
  { href: '/leaderboard',  icon: BarChart3,   label: 'Ranks' },
  { href: '/profile',      icon: User,        label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around py-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors"
            >
              <Icon
                className="w-5 h-5 transition-colors"
                style={{ color: active ? '#1a5c38' : '#9ca3af' }}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: active ? '#1a5c38' : '#9ca3af' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
