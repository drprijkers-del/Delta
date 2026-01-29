'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'
import { LanguageToggle } from '@/components/ui/language-toggle'

export function HomeContent() {
  const t = useTranslation()
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
    <div className="min-h-screen flex flex-col bg-stone-50 relative overflow-hidden">
      {/* Easter egg: The Fly - subtly flying around */}
      <div className="absolute top-20 right-10 text-xs opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>
        🪰
      </div>

      {/* Easter egg: Pizza on the roof - hidden in corner */}
      <div className="absolute -top-2 right-1/4 text-2xl opacity-10 rotate-12">
        🍕
      </div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚗️</span>
          <span className="text-sm font-medium text-stone-400">{t('pulse')}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/login"
            className="text-xs text-stone-400 hover:text-cyan-600 transition-colors"
          >
            {t('homeAdminLogin')}
          </Link>
          <LanguageToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center max-w-xl">
          {/* Lab Tool badge */}
          <div className="inline-flex items-center gap-2 text-xs text-stone-400 border border-stone-200 px-3 py-1 rounded-full mb-8">
            <span>⚗️</span>
            {t('labTool')}
          </div>

          {/* Lab flask icon - Heisenberg style - links to super admin */}
          <Link href="/super-admin/login" className="block text-6xl mb-8 hover:scale-110 transition-transform" title="Lab access">
            🧪
          </Link>

          {/* Title */}
          <h1 className="text-5xl font-bold mb-4 tracking-tight text-stone-900">
            {t('homeTitle')}
          </h1>

          <p className="text-xl text-stone-500 mb-4">
            {t('homeSubtitle')}
          </p>

          <p className="text-stone-400 mb-10 max-w-md mx-auto">
            {t('homeDescription')}
          </p>

          {/* Features */}
          <div className="flex justify-center gap-8 mb-10">
            <div className="flex items-center gap-2 text-stone-500">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-sm">{t('homeFeature1')}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-sm">{t('homeFeature2')}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-sm">{t('homeFeature3')}</span>
            </div>
          </div>

          {/* Signal scale - clean with cyan accent */}
          <div className="flex justify-center gap-3 mb-10">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-lg font-bold text-stone-500 hover:border-cyan-400 hover:text-cyan-600 transition-all duration-200 cursor-default"
              >
                {num}
              </div>
            ))}
          </div>

          {/* Inline Login Flow */}
          {emailSent ? (
            // Success state - RV driving away
            <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm mx-auto mb-6">
              <div className="text-4xl mb-4">🚐💨</div>
              <h3 className="font-semibold text-stone-900 mb-1">{t('loginCheckInbox')}</h3>
              <p className="text-sm text-stone-500 mb-3">
                {t('loginEmailSent')} <span className="font-medium text-stone-900">{email}</span>
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmail(''); }}
                className="text-xs text-stone-400 hover:text-stone-600"
              >
                {t('loginOtherEmail')}
              </button>
            </div>
          ) : showLogin ? (
            // Email input form
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto mb-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('loginEmailPlaceholder')}
                  required
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    '→'
                  )}
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
              <p className="text-xs text-stone-400 mt-3">{t('loginNoPassword')}</p>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="text-xs text-stone-400 hover:text-stone-600 mt-2"
              >
                ← {t('cancel')}
              </button>
            </form>
          ) : (
            // CTA Buttons
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex flex-col items-center gap-1 px-8 py-4 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
              >
                <span className="font-medium">{t('homeScrumMasterCTA')}</span>
                <span className="text-xs text-stone-400">{t('homeScrumMasterSubtext')}</span>
              </button>

              <div className="text-xs text-stone-400">
                {t('homeAlreadyAccount')}{' '}
                <Link href="/admin/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
                  {t('homeAdminLogin')}
                </Link>
              </div>
            </div>
          )}

          <p className="text-xs text-stone-400">
            {t('homeAskTeamLead')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-xs text-stone-400">
          <a
            href="https://pinkpollos.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-600 transition-colors"
          >
            {t('pinkPollos')}
          </a>
          {' · '}{t('homeFooter')}
          <span className="ml-2 opacity-30" title="99.1% pure">⚗️</span>
        </p>
      </footer>
    </div>
  )
}
