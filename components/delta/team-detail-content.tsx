'use client'

import Link from 'next/link'
import { TeamWithStats } from '@/domain/teams/actions'
import { DeltaSessionWithStats, getAngleInfo } from '@/domain/delta/types'
import { TeamStats } from '@/domain/delta/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TeamSettings } from '@/components/admin/team-settings'
import { TeamActions } from '@/components/admin/team-actions'
import { useTranslation, useLanguage } from '@/lib/i18n/context'

interface TeamDetailContentProps {
  team: TeamWithStats
  sessions: DeltaSessionWithStats[]
  stats: TeamStats
}

export function TeamDetailContent({ team, sessions, stats }: TeamDetailContentProps) {
  const t = useTranslation()
  const { language } = useLanguage()
  const dateLocale = language === 'nl' ? 'nl-NL' : 'en-US'

  const activeSessions = sessions.filter(s => s.status === 'active')
  const closedSessions = sessions.filter(s => s.status === 'closed')

  // Get score color
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-stone-400'
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-cyan-600'
    if (score >= 2) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-stone-100'
    if (score >= 4) return 'bg-green-50'
    if (score >= 3) return 'bg-cyan-50'
    if (score >= 2) return 'bg-amber-50'
    return 'bg-red-50'
  }

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

      {/* Team Stats Overview */}
      {stats.totalSessions > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {/* Health Score */}
          <Card className={`${getScoreBg(stats.averageScore)} border-0`}>
            <CardContent className="py-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                {stats.averageScore !== null ? stats.averageScore.toFixed(1) : '—'}
              </div>
              <div className="text-xs text-stone-500 mt-1">{t('teamScore')}</div>
            </CardContent>
          </Card>

          {/* Total Sessions */}
          <Card className="bg-stone-50 border-0">
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-stone-700">
                {stats.totalSessions}
              </div>
              <div className="text-xs text-stone-500 mt-1">{t('sessions')}</div>
            </CardContent>
          </Card>

          {/* Total Responses */}
          <Card className="bg-stone-50 border-0">
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-stone-700">
                {stats.totalResponses}
              </div>
              <div className="text-xs text-stone-500 mt-1">{t('responses')}</div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className={stats.activeSessions > 0 ? 'bg-cyan-50 border-0' : 'bg-stone-50 border-0'}>
            <CardContent className="py-4 text-center">
              <div className={`text-3xl font-bold ${stats.activeSessions > 0 ? 'text-cyan-600' : 'text-stone-400'}`}>
                {stats.activeSessions}
              </div>
              <div className="text-xs text-stone-500 mt-1">{t('active')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Delta Session CTA */}
      <Card className="mb-8 border-cyan-200 bg-gradient-to-r from-cyan-50 to-white">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">{t('startDeltaSession')}</h2>
              <p className="text-sm text-stone-600">{t('startDeltaSessionSubtitle')}</p>
            </div>
            <Link href={`/app/teams/${team.id}/delta/new`}>
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('newSession')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">{t('activeSessions')}</h2>
          <div className="grid gap-4">
            {activeSessions.map(session => (
              <SessionCard key={session.id} session={session} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* Closed Sessions */}
      {closedSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-500 mb-4">{t('completedSessions')}</h2>
          <div className="grid gap-4">
            {closedSessions.map(session => (
              <SessionCard key={session.id} session={session} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* No sessions yet */}
      {sessions.length === 0 && (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-stone-900 mb-2">{t('noSessionsYet')}</h3>
            <p className="text-stone-500 mb-6">{t('noSessionsMessage')}</p>
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

function SessionCard({ session, t }: { session: DeltaSessionWithStats; t: (key: string) => string }) {
  const angleInfo = getAngleInfo(session.angle)
  const isActive = session.status === 'active'
  const isClosed = session.status === 'closed'
  const hasScore = session.overall_score !== null && session.overall_score !== undefined

  // Score-based colors
  const getScoreBgColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) {
      return isActive ? 'bg-gradient-to-br from-cyan-400 to-cyan-600' : 'bg-stone-300'
    }
    if (score >= 4) return 'bg-green-500'
    if (score >= 3) return 'bg-cyan-500'
    if (score >= 2) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <Link href={`/app/delta/${session.id}`}>
      <Card className="card-hover cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            {/* Health score or angle icon */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${getScoreBgColor(session.overall_score)}`}>
                {hasScore ? (
                  <span className="text-lg">{session.overall_score!.toFixed(1)}</span>
                ) : (
                  <span className="text-xl">{angleInfo.label.charAt(0)}</span>
                )}
              </div>
              {hasScore && (
                <span className="text-[10px] text-stone-400 mt-1">{t('teamScore').toLowerCase()}</span>
              )}
            </div>

            {/* Session info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-900 truncate">
                  {session.title || angleInfo.label}
                </h3>
                {isActive && (
                  <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                    {t('active')}
                  </span>
                )}
                {isClosed && (
                  <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    {t('completedSessions').split(' ')[0]}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500">
                {angleInfo.label} • {session.response_count} {t('responses').toLowerCase()}
              </p>
              {isClosed && session.focus_area && (
                <p className="text-sm text-stone-400 mt-1 truncate">
                  {t('focusArea')}: {session.focus_area}
                </p>
              )}
            </div>

            {/* Arrow */}
            <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
