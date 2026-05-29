'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Trophy, BarChart3, User, Leaf } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/log', icon: PlusCircle, label: 'Log Action' },
  { href: '/challenges', icon: Trophy, label: 'Challenges' },
  { href: '/leaderboard', icon: BarChart3, label: 'Leaderboard' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function SideNav({ displayName }: { displayName: string }) {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex flex-col w-64 fixed top-0 left-0 h-screen z-40"
      style={{ backgroundColor: '#1a5c38' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">Climate Together</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Aotearoa NZ</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
              style={active
                ? { backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }
                : { color: 'rgba(255,255,255,0.65)' }
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 pb-6 pt-4 border-t border-white/10">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            {displayName.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-sm truncate">{displayName || 'My Profile'}</span>
        </Link>
      </div>
    </aside>
  )
}
