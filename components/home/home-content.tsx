'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'

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
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-cyan-500">Δ</span>
          <span className="text-sm font-medium text-stone-500">Delta</span>
        </div>
        <Link
          href="/admin/login"
          className="text-sm text-stone-500 hover:text-stone-900 transition-colors py-2 px-3 rounded-lg hover:bg-stone-100"
        >
          {t('homeAdminLogin')}
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-6 pt-8 sm:pt-12">
        <div className="w-full max-w-2xl">

          {/* Hero Section */}
          <section className="text-center mb-16">
            <div className="text-6xl sm:text-7xl font-bold text-cyan-500 mb-6">Δ</div>

            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4 tracking-tight">
              {t('heroTitle')}
            </h1>

            <p className="text-lg text-stone-600 mb-3">
              {t('heroSubtitle')}
            </p>

            <p className="text-stone-500 max-w-md mx-auto">
              {t('heroBarrier')}
            </p>
          </section>

          {/* How Delta Works */}
          <section className="mb-16">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide text-center mb-6">
              {t('howDeltaWorks')}
            </h2>

            <div className="grid gap-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <div className="font-medium text-stone-900">{t('step1Title')}</div>
                  <div className="text-sm text-stone-500">{t('step1Desc')}</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <div className="font-medium text-stone-900">{t('step2Title')}</div>
                  <div className="text-sm text-stone-500">{t('step2Desc')}</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <div className="font-medium text-stone-900">{t('step3Title')}</div>
                  <div className="text-sm text-stone-500">{t('step3Desc')}</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </div>
                <div>
                  <div className="font-medium text-stone-900">{t('step4Title')}</div>
                  <div className="text-sm text-stone-500">{t('step4Desc')}</div>
                </div>
              </div>
            </div>
          </section>

          {/* What You Get */}
          <section className="mb-16">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide text-center mb-6">
              {t('whatYouGet')}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-xs font-medium text-stone-700">{t('outcome1')}</div>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🧪</div>
                <div className="text-xs font-medium text-stone-700">{t('outcome2')}</div>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="text-xs font-medium text-stone-700">{t('outcome3')}</div>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="text-xs font-medium text-stone-700">{t('outcome4')}</div>
              </div>
            </div>

            <p className="text-center text-sm text-stone-500 mt-4">
              {t('outcomeSubtext')}
            </p>
          </section>

          {/* Who It's For */}
          <section className="mb-16 text-center">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">
              {t('whoItsFor')}
            </h2>
            <p className="text-stone-600">
              {t('whoItsForList')}
            </p>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            {emailSent ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-sm mx-auto shadow-sm">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">{t('loginCheckInbox')}</h3>
                <p className="text-sm text-stone-500 mb-3">
                  {t('loginEmailSent')} <span className="text-stone-900 font-medium">{email}</span>
                </p>
                <button
                  onClick={() => { setEmailSent(false); setEmail(''); }}
                  className="text-xs text-stone-500 hover:text-cyan-600 py-2"
                >
                  {t('loginOtherEmail')}
                </button>
              </div>
            ) : showLogin ? (
              <div className="max-w-sm mx-auto">
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('loginEmailPlaceholder')}
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
                  <p className="text-xs text-stone-500 mt-3">{t('loginNoPassword')}</p>
                </form>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="text-xs text-stone-500 hover:text-cyan-600 mt-3 py-2"
                >
                  ← {t('adminBack')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-4 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-semibold shadow-sm"
                >
                  {t('ctaButton')}
                </button>
                <p className="text-xs text-stone-500">{t('ctaSubtext')}</p>

                <div className="text-sm text-stone-500 pt-4">
                  {t('homeAlreadyAccount')}{' '}
                  <Link href="/admin/login" className="text-cyan-600 hover:text-cyan-700">
                    {t('homeAdminLogin')}
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="pt-6 pb-24 text-center">
        <p className="text-xs text-stone-400">
          <a
            href="https://pinkpollos.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-600 transition-colors"
          >
            Pink Pollos
          </a>
          {' '}Agile MethVan tool
        </p>
      </footer>
    </div>
  )
}
