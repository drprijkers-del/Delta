'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function HomeContent() {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    setEmailSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-cyan-500">Δ</span>
          <span className="text-sm font-medium text-stone-500">Delta</span>
        </div>
        <Link
          href="/admin/login"
          className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          {/* Logo */}
          <div className="text-8xl font-bold text-cyan-500 mb-8">Δ</div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-6 tracking-tight">
            Delta
          </h1>

          <p className="text-xl text-stone-600 mb-4">
            One session. One focus. One experiment.
          </p>

          <p className="text-stone-500 mb-12 max-w-md mx-auto leading-relaxed">
            Not a dashboard. Not a maturity model.<br />
            A time-boxed intervention for teams who want to improve.
          </p>

          {/* What Delta produces */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 max-w-lg mx-auto">
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-xs text-stone-500">One focus area</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🧪</div>
              <div className="text-xs text-stone-500">One experiment</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-xs text-stone-500">One owner</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-xs text-stone-500">One follow-up</div>
            </div>
          </div>

          {/* Login Flow */}
          {emailSent ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-sm mx-auto mb-6 shadow-sm">
              <div className="text-4xl mb-4">📬</div>
              <h3 className="font-semibold text-stone-900 mb-1">Check your inbox</h3>
              <p className="text-sm text-stone-500 mb-3">
                We sent a login link to <span className="text-stone-900 font-medium">{email}</span>
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmail(''); }}
                className="text-xs text-stone-500 hover:text-cyan-600"
              >
                Use different email
              </button>
            </div>
          ) : showLogin ? (
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto mb-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors disabled:opacity-50 font-semibold"
                >
                  {loading ? '...' : '→'}
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
              <p className="text-xs text-stone-500 mt-3">No password needed. We&apos;ll email you a link.</p>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="text-xs text-stone-500 hover:text-cyan-600 mt-2"
              >
                ← Back
              </button>
            </form>
          ) : (
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-semibold shadow-sm"
              >
                Start a Delta session
              </button>

              <div className="text-sm text-stone-500">
                Already have an account?{' '}
                <Link href="/admin/login" className="text-cyan-600 hover:text-cyan-700">
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-stone-400">
          <a
            href="https://pinkpollos.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-600 transition-colors"
          >
            Pink Pollos
          </a>
          {' · '}Agile intervention tool
        </p>
      </footer>
    </div>
  )
}
