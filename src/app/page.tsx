import Link from 'next/link'
import { Leaf, Users, BarChart3, Award } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="app-shell">
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #1a5c38 0%, #2d7a4f 50%, #4caf50 100%)' }}>
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-deep" style={{ color: '#1a5c38' }} />
          </div>
          <span className="text-white font-semibold text-lg">Climate Together NZ</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col px-6 pt-8 pb-12">
        <div className="mb-10">
          <p className="text-green-100 text-sm font-medium uppercase tracking-widest mb-3">
            Pilot Programme 2025
          </p>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Every action<br />
            counts for<br />
            Aotearoa 🌿
          </h1>
          <p className="text-green-100 text-base leading-relaxed">
            Log your daily climate actions, earn points, join challenges with your whānau, school, or business — and watch our collective impact grow.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'Actions', value: '10+', sub: 'to log' },
            { label: 'CO₂', value: 'kg', sub: 'tracked' },
            { label: 'Points', value: '50', sub: 'max/action' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
              <div className="text-white font-bold text-xl">{s.value}</div>
              <div className="text-green-100 text-xs">{s.label}</div>
              <div className="text-green-200 text-xs">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div className="space-y-3 mb-10">
          {[
            { icon: BarChart3, text: 'Track your CO₂ and money savings in real time' },
            { icon: Users, text: 'Join group challenges with schools and businesses' },
            { icon: Award, text: 'Climb the leaderboard and earn recognition' },
          ].map((f) => (
            <div key={f.text} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <f.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/auth?mode=signup"
            className="block w-full bg-white text-center py-4 rounded-2xl font-bold text-base shadow-lg"
            style={{ color: '#1a5c38' }}
          >
            Join the Pilot ✨
          </Link>
          <Link
            href="/auth?mode=login"
            className="block w-full border-2 border-white/40 text-white text-center py-4 rounded-2xl font-medium text-base"
          >
            Sign in
          </Link>
        </div>

        <p className="text-center text-green-200 text-xs mt-6">
          Free to join · No spam · Kia ora 🤙
        </p>
      </main>
    </div>
    </div>
  )
}
