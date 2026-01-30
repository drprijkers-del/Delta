'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'

/**
 * Prominent backlog link - we're Agile, customer is important!
 * Fixed position, visible on all pages except the backlog page itself.
 */
export function BacklogLink() {
  const t = useTranslation()
  const pathname = usePathname()

  // Don't show on backlog page - we're already there
  if (pathname?.includes('/feedback/backlog')) {
    return null
  }

  return (
    <Link
      href="/feedback/backlog"
      className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 min-h-11 bg-white border border-stone-200 rounded-full text-sm text-stone-600 hover:text-cyan-600 hover:border-cyan-300 shadow-sm hover:shadow active:shadow-none active:bg-stone-50 transition-all z-40"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <span className="hidden sm:inline">{t('backlogCTA')}</span>
      <span className="sm:hidden">{t('backlogCTAMobile')}</span>
    </Link>
  )
}
