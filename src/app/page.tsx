export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Leaf, Zap, Users, Award } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase-server'

async function getPublicStats() {
  try {
    const admin = createAdminClient()
    const [{ data: actions }, { count: userCount }] = await Promise.all([
      admin.from('user_actions').select('actions_library(co2_saved_kg)'),
      admin.from('users').select('*', { count: 'exact', head: true }).neq('name', ''),
    ])
    const totalCO2 = actions?.reduce((s, a) => {
      const lib = a.actions_library as unknown as { co2_saved_kg: number } | null
      return s + (lib?.co2_saved_kg ?? 0)
    }, 0) ?? 0
    return { totalCO2, userCount: userCount ?? 0, actionCount: actions?.length ?? 0 }
  } catch {
    return { totalCO2: 0, userCount: 0, actionCount: 0 }
  }
}

export default async function LandingPage() {
  const { totalCO2, userCount, actionCount } = await getPublicStats()

  return (
    <div className="app-shell">
      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'linear-gradient(160deg, #0d3d24 0%, #1a5c38 35%, #2d7a4f 70%, #3a9a5c 100%)' }}
      >
        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">Climate Together NZ</span>
          </div>
          <Link
            href="/auth?mode=login"
            className="text-white/80 text-sm font-medium px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            Sign in
          </Link>
        </header>

        <main className="flex-1 flex flex-col px-6 pt-6 pb-10">
          {/* Eyebrow */}
          <div className="mb-4">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            >
              Pilot Programme 2025
            </span>
          </div>

          {/* Hero headline */}
          <div className="mb-8">
            <h1 className="text-5xl font-black text-white leading-[1.05] tracking-tight mb-4">
              Every action<br />
              <span style={{ color: '#a3f5c0' }}>counts for</span><br />
              Aotearoa 🌿
            </h1>
            <p className="text-green-100/90 text-base leading-relaxed max-w-xs">
              Log daily climate actions, earn points, join challenges with your whānau, school, or business.
            </p>
          </div>

          {/* Live impact counter */}
          {totalCO2 > 0 && (
            <div
              className="rounded-2xl p-4 mb-7"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
                border: '1.5px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-green-200 text-xs font-semibold uppercase tracking-widest mb-2">
                🌍 Community impact so far
              </p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-black text-white">{totalCO2.toFixed(1)}</span>
                <span className="text-xl font-bold text-green-200">kg CO₂</span>
                <span className="text-green-200 text-sm">saved</span>
              </div>
              <p className="text-green-200/80 text-xs">
                by {userCount} member{userCount !== 1 ? 's' : ''} across {actionCount} actions
              </p>
            </div>
          )}

          {/* Feature highlights */}
          <div className="space-y-3 mb-8">
            {[
              {
                icon: Zap,
                title: 'Track your impact',
                desc: 'See CO₂ and money savings in real time with every action',
                color: '#fbbf24',
              },
              {
                icon: Users,
                title: 'Join group challenges',
                desc: 'Compete with schools, businesses, and community groups',
                color: '#60a5fa',
              },
              {
                icon: Award,
                title: 'Climb the leaderboard',
                desc: 'Earn recognition and inspire others in Aotearoa',
                color: '#a78bfa',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3.5 rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${f.color}22` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-green-200/80 text-xs leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            <Link
              href="/auth?mode=signup"
              className="block w-full text-center py-4 rounded-2xl font-black text-base transition-transform active:scale-95"
              style={{
                backgroundColor: 'white',
                color: '#1a5c38',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Join the Pilot — it&apos;s free ✨
            </Link>
            <Link
              href="/auth?mode=login"
              className="block w-full text-center py-4 rounded-2xl font-semibold text-base transition-transform active:scale-95"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.3)',
              }}
            >
              I already have an account
            </Link>
          </div>

          <p className="text-center text-green-200/60 text-xs mt-6">
            Free to join · No spam · Kia ora 🤙
          </p>
        </main>
      </div>
    </div>
  )
}
