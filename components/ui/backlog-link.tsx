'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'

/**
 * Subtle, fixed backlog link that appears on every page.
 * Small text in bottom-left corner, doesn't interfere with main content.
 */
export function BacklogLink() {
  const t = useTranslation()

  return (
    <Link
      href="/feedback/backlog"
      className="fixed bottom-4 left-4 text-xs text-stone-400 hover:text-stone-600 transition-colors z-40 hidden sm:block"
    >
      {t('backlogLink')}
    </Link>
  )
}
