'use client'

import Link from 'next/link'
import { TeamWithStats } from '@/domain/teams/actions'
import { DeltaSessionWithStats, getAngleInfo } from '@/domain/delta/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TeamSettings } from '@/components/admin/team-settings'
import { TeamActions } from '@/components/admin/team-actions'
import { useTranslation, useLanguage } from '@/lib/i18n/context'

interface TeamDetailContentProps {
  team: TeamWithStats
  sessions: DeltaSessionWithStats[]
}

export function TeamDetailContent({ team, sessions }: TeamDetailContentProps) {
  const t = useTranslation()
  const { language } = useLanguage()
  const dateLocale = language === 'nl' ? 'nl-NL' : 'en-US'

  const activeSessions = sessions.filter(s => s.status === 'active')
  const closedSessions = sessions.filter(s => s.status === 'closed')

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/app/teams"
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

      {/* New Delta Session CTA */}
      <Card className="mb-8 border-cyan-200 bg-gradient-to-r from-cyan-50 to-white">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Start a Delta Session</h2>
              <p className="text-sm text-stone-600">One session. One focus. One experiment.</p>
            </div>
            <Link href={`/app/teams/${team.id}/delta/new`}>
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Session
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Active Sessions</h2>
          <div className="grid gap-4">
            {activeSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Closed Sessions */}
      {closedSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-500 mb-4">Completed Sessions</h2>
          <div className="grid gap-4">
            {closedSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* No sessions yet */}
      {sessions.length === 0 && (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">No sessions yet</h3>
            <p className="text-stone-500 mb-6">Start your first Delta session to gather team insights.</p>
          </CardContent>
        </Card>
      )}

      {/* Team settings */}
      <div className="mt-8">
        <TeamSettings team={team} />
      </div>
    </main>
  )
}

function SessionCard({ session }: { session: DeltaSessionWithStats }) {
  const angleInfo = getAngleInfo(session.angle)
  const isActive = session.status === 'active'
  const isClosed = session.status === 'closed'

  return (
    <Link href={`/app/delta/${session.id}`}>
      <Card className="card-hover cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            {/* Angle icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${
              isActive ? 'bg-gradient-to-br from-cyan-400 to-cyan-600' : 'bg-stone-300'
            }`}>
              {angleInfo.label.charAt(0)}
            </div>

            {/* Session info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-900 truncate">
                  {session.title || angleInfo.label}
                </h3>
                {isActive && (
                  <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
                {isClosed && (
                  <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    Closed
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500">
                {angleInfo.label} • {session.response_count} response{session.response_count !== 1 ? 's' : ''}
              </p>
              {isClosed && session.focus_area && (
                <p className="text-sm text-stone-400 mt-1 truncate">
                  Focus: {session.focus_area}
                </p>
              )}
            </div>

            {/* Arrow */}
            <svg className="w-5 h-5 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
