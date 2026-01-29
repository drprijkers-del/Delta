'use client'

import Link from 'next/link'
import { TeamWithStats } from '@/domain/teams/actions'
import { AdminHeader } from '@/components/admin/header'
import { TeamActions } from '@/components/admin/team-actions'
import { ShareLinkSection } from '@/components/admin/share-link-section'
import { TeamSettings } from '@/components/admin/team-settings'
import { useTranslation, useLanguage } from '@/lib/i18n/context'

interface TeamDetailContentProps {
  team: TeamWithStats
}

export function TeamDetailContent({ team }: TeamDetailContentProps) {
  const t = useTranslation()
  const { language } = useLanguage()

  const dateLocale = language === 'nl' ? 'nl-NL' : 'en-US'

  return (
    <div className="relative overflow-hidden">
      <AdminHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/admin/teams"
          className="inline-flex items-center text-stone-500 hover:text-stone-700 mb-6 min-h-11 py-2"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('adminBack')}
        </Link>

        {/* Team header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{team.name}</h1>
              {team.description && (
                <p className="text-stone-500 mt-1">{team.description}</p>
              )}
              <p className="text-sm text-stone-400 mt-2">
                {t('adminCreatedOn')} {new Date(team.created_at).toLocaleDateString(dateLocale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <TeamActions team={team} />
          </div>
        </div>

        {/* Delta sessions placeholder - will be implemented in Phase 4 */}
        <div className="mb-8 p-6 border border-dashed border-stone-300 rounded-lg">
          <div className="text-center text-stone-500">
            <p className="text-lg font-medium mb-2">Delta Sessions</p>
            <p className="text-sm">No sessions yet. Create your first Delta session.</p>
            <button
              disabled
              className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg opacity-50 cursor-not-allowed"
            >
              + New Delta Session
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Share link */}
          <ShareLinkSection teamId={team.id} teamSlug={team.slug} />

          {/* Team settings */}
          <TeamSettings team={team} />
        </div>
      </main>
    </div>
  )
}
