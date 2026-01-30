'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TeamWithStats, deleteTeam, resetTeam, updateTeam } from '@/domain/teams/actions'
import { DeltaSessionWithStats, getAngleInfo } from '@/domain/delta/types'
import { TeamStats } from '@/domain/delta/actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmModal } from '@/components/ui/modal'
import { useTranslation, useLanguage, TranslationFunction } from '@/lib/i18n/context'

interface TeamDetailContentProps {
  team: TeamWithStats
  sessions: DeltaSessionWithStats[]
  stats: TeamStats
}

export function TeamDetailContent({ team, sessions, stats }: TeamDetailContentProps) {
  const t = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()
  const dateLocale = language === 'nl' ? 'nl-NL' : 'en-US'

  // Settings dropdown state
  const [showSettings, setShowSettings] = useState(false)
  const [showTeamSettings, setShowTeamSettings] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsSuccess, setSettingsSuccess] = useState(false)

  const activeSessions = sessions.filter(s => s.status === 'active')
  const closedSessions = sessions.filter(s => s.status === 'closed')

  // Get score color based on health framing
  const getHealthColor = (score: number | null) => {
    if (score === null) return 'text-stone-400'
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-cyan-600'
    if (score >= 2) return 'text-amber-600'
    return 'text-red-600'
  }

  const getHealthBg = (score: number | null) => {
    if (score === null) return 'bg-stone-100'
    if (score >= 4) return 'bg-green-50'
    if (score >= 3) return 'bg-cyan-50'
    if (score >= 2) return 'bg-amber-50'
    return 'bg-red-50'
  }

  const getHealthLabel = (score: number | null) => {
    if (score === null) return '—'
    if (score >= 4) return language === 'nl' ? 'Gezond' : 'Healthy'
    if (score >= 3) return language === 'nl' ? 'Stabiel' : 'Stable'
    if (score >= 2) return language === 'nl' ? 'Aandacht' : 'Attention'
    return language === 'nl' ? 'Actie nodig' : 'Action needed'
  }

  // Get trend icon
  const getTrendIcon = () => {
    if (stats.trend === 'up') {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
    if (stats.trend === 'down') {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    )
  }

  // Get trend label
  const getTrendLabel = () => {
    if (stats.trend === 'up') return t('trendUp')
    if (stats.trend === 'down') return t('trendDown')
    if (stats.trend === 'stable') return t('trendStable')
    return null
  }

  // Format trend drivers
  const formatTrendDrivers = () => {
    if (stats.trendDrivers.length === 0) return null
    const driverLabels = stats.trendDrivers.map(angle => getAngleInfo(angle as any).label)
    return `${t('trendDrivenBy')} ${driverLabels.join(', ')}`
  }

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSettingsError(null)
    setSettingsSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await updateTeam(team.id, formData)

    setLoading(false)

    if (!result.success) {
      setSettingsError(result.error || t('error'))
      return
    }

    setSettingsSuccess(true)
    router.refresh()
    setTimeout(() => {
      setSettingsSuccess(false)
      setShowTeamSettings(false)
    }, 1500)
  }

  async function handleReset() {
    setLoading(true)
    const result = await resetTeam(team.id)
    setLoading(false)
    if (result.success) {
      setShowResetModal(false)
      setShowSettings(false)
      router.refresh()
    }
  }

  async function handleDelete() {
    setLoading(true)
    const result = await deleteTeam(team.id)
    setLoading(false)
    if (result.success) {
      router.push('/app/teams')
    }
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

      {/* Team header with settings gear */}
      <div className="mb-8">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
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

          {/* Settings gear icon - always top-right aligned */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 min-h-11 min-w-11 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors"
              aria-label={t('teamActions')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowTeamSettings(true)
                    setShowSettings(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('teamSettings')}
                </button>
                <div className="border-t border-stone-100 my-1" />
                <button
                  onClick={() => {
                    setShowResetModal(true)
                    setShowSettings(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('clearData')}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(true)
                    setShowSettings(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('deleteTeam')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Settings Panel - expandable */}
      {showTeamSettings && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-900">{t('teamSettings')}</span>
              <button
                onClick={() => setShowTeamSettings(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {settingsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {settingsError}
              </div>
            )}

            {settingsSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                {t('teamSettingsSaved')}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <Input
                id="name"
                name="name"
                label={t('newTeamName')}
                defaultValue={team.name}
                required
                minLength={2}
              />

              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-stone-700">
                  {t('newTeamDescription')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  defaultValue={team.description || ''}
                  className="block w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <Input
                id="expected_team_size"
                name="expected_team_size"
                type="number"
                label={t('newTeamSize')}
                placeholder={t('newTeamSizePlaceholder')}
                defaultValue={team.expected_team_size || ''}
                min={1}
                max={100}
              />
              <p className="text-xs text-stone-400 -mt-2">{t('newTeamSizeHelp')}</p>

              <Button type="submit" loading={loading} className="w-full">
                {t('save')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Team Health Overview - show when there are any sessions */}
      {stats.totalSessions > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {/* Health Score - framed as signal */}
          <Card className={`${getHealthBg(stats.averageScore)} border-0`}>
            <CardContent className="py-4">
              <div className="text-xs font-medium text-stone-500 mb-2">{t('teamHealth')}</div>
              {stats.averageScore !== null ? (
                <>
                  <div className={`text-3xl font-bold ${getHealthColor(stats.averageScore)}`}>
                    {stats.averageScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">{getHealthLabel(stats.averageScore)}</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-stone-400">
                    {t('collecting')}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">{t('needsClosedSessions')}</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trend - with direction and drivers */}
          <Card className="bg-stone-50 border-0">
            <CardContent className="py-4">
              <div className="text-xs font-medium text-stone-500 mb-2">{t('trendLabel')}</div>
              {stats.trend ? (
                <>
                  <div className="flex items-center gap-1.5">
                    {getTrendIcon()}
                    <span className="text-lg font-medium text-stone-700">
                      {getTrendLabel()}
                    </span>
                  </div>
                  {stats.trendDrivers.length > 0 && (
                    <div className="text-xs text-stone-400 mt-1 truncate">
                      {formatTrendDrivers()}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-stone-400">
                    {stats.closedSessions >= 2 ? t('trendStable') : t('needsMoreData')}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">
                    {stats.closedSessions < 2 ? t('needsTwoSessions') : ''}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sessions completed - with context */}
          <Card className="bg-stone-50 border-0">
            <CardContent className="py-4">
              <div className="text-xs font-medium text-stone-500 mb-2">{t('sessions')}</div>
              <div className="text-3xl font-bold text-stone-700">
                {stats.closedSessions}
                <span className="text-lg text-stone-400">/{stats.totalSessions}</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {stats.activeSessions > 0
                  ? `${stats.activeSessions} ${t('active').toLowerCase()}`
                  : t('sessionsCompleted')
                }
              </div>
            </CardContent>
          </Card>

          {/* Responses collected - with context */}
          <Card className="bg-stone-50 border-0">
            <CardContent className="py-4">
              <div className="text-xs font-medium text-stone-500 mb-2">{t('responses')}</div>
              <div className="text-3xl font-bold text-stone-700">
                {stats.totalResponses}
              </div>
              <div className="text-xs text-stone-500 mt-1">{t('responsesCollected')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Delta Session CTA - most prominent element */}
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

      {/* Session Diary / History - with coaching framing */}
      {closedSessions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-stone-500">{t('teamDiary')}</h2>
          </div>
          <p className="text-sm text-stone-400 mb-4">{t('teamDiarySubtitle')}</p>

          {/* Collective signal note */}
          {closedSessions.length >= 2 && (
            <div className="text-xs text-stone-400 mb-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('collectiveSignal')}
            </div>
          )}

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

      {/* Pulse CTA - subtle link */}
      <div className="mt-12 pt-8 border-t border-stone-100">
        <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
          <span>{t('pulseTeaser')}</span>
          <a
            href="https://mood-app-one.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            {t('pulseLink')} →
          </a>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title={t('teamResetTitle')}
        message={t('teamResetMessage')}
        confirmLabel={t('teamResetButton')}
        confirmVariant="danger"
        loading={loading}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('teamDeleteTitle')}
        message={t('teamDeleteMessage')}
        confirmLabel={t('teamDeleteButton')}
        confirmVariant="danger"
        loading={loading}
      />
    </main>
  )
}

// Generate coach insight based on session data
function getCoachInsight(session: DeltaSessionWithStats, t: TranslationFunction): string | null {
  // If session is active and waiting for responses
  if (session.status === 'active') {
    if (session.response_count < 3) {
      return t('insightWaitingForResults')
    }
    return null
  }

  // For closed sessions, generate insight based on data
  if (!session.overall_score || !session.focus_area) return null

  const angle = session.angle
  const score = session.overall_score

  // Low score insights by angle
  if (score < 3) {
    switch (angle) {
      case 'flow': return t('insightFlowBlocked')
      case 'refinement': return t('insightRefinementWeak')
      case 'scrum': return t('insightScrumCeremonies')
      case 'ownership': return t('insightOwnershipWeak')
      case 'collaboration': return t('insightCollaborationTension')
      default: return t('insightUnplannedWork')
    }
  }

  // High score insights
  if (score >= 4) {
    switch (angle) {
      case 'ownership': return t('insightOwnershipStrong')
      default: return t('insightGoodAlignment')
    }
  }

  // Medium score - focus area based
  return t('insightFocusSlicing')
}

function SessionCard({ session, t }: { session: DeltaSessionWithStats; t: TranslationFunction }) {
  const angleInfo = getAngleInfo(session.angle)
  const isActive = session.status === 'active'
  const isClosed = session.status === 'closed'
  const hasScore = session.overall_score !== null && session.overall_score !== undefined

  // Coach insight line
  const insight = getCoachInsight(session, t)

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
              </div>
              <p className="text-sm text-stone-500">
                {angleInfo.label} • {session.response_count} {t('responses').toLowerCase()}
              </p>

              {/* Coach insight - for closed sessions */}
              {insight && isClosed && (
                <p className="text-sm text-stone-400 mt-1 italic truncate">
                  {insight}
                </p>
              )}

              {/* Focus area for closed sessions without insight */}
              {isClosed && session.focus_area && !insight && (
                <p className="text-sm text-stone-400 mt-1 truncate">
                  {t('focusArea')}: {session.focus_area}
                </p>
              )}

              {/* Waiting indicator for active sessions */}
              {isActive && insight && (
                <p className="text-sm text-cyan-600 mt-1">
                  {insight}
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
