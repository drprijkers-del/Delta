'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DeltaSessionWithStats, SynthesisResult, StatementScore, getAngleInfo, DeltaAngle } from '@/domain/delta/types'
import { getStatements } from '@/domain/delta/statements'
import { closeSession, deleteSession } from '@/domain/delta/actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useTranslation, TranslationFunction } from '@/lib/i18n/context'

interface SessionDetailContentProps {
  session: DeltaSessionWithStats
  synthesis: SynthesisResult | null
  shareLink: string | null
}

export function SessionDetailContent({ session, synthesis, shareLink }: SessionDetailContentProps) {
  const router = useRouter()
  const t = useTranslation()
  const angleInfo = getAngleInfo(session.angle)
  const isActive = session.status === 'active'
  const isClosed = session.status === 'closed'

  const [copied, setCopied] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [closing, setClosing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Close form state
  const [focusArea, setFocusArea] = useState(synthesis?.focus_area || '')
  const [experiment, setExperiment] = useState(synthesis?.suggested_experiment || '')
  const [owner, setOwner] = useState('')
  const [followupDate, setFollowupDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )

  async function handleCopy() {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleClose() {
    if (!focusArea || !experiment || !owner) return

    setClosing(true)
    const result = await closeSession(
      session.id,
      focusArea,
      experiment,
      owner,
      followupDate
    )

    if (result.success) {
      setShowCloseModal(false)
      router.refresh()
    }
    setClosing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteSession(session.id)
    if (result.success) {
      router.push(`/app/teams/${session.team_id}`)
    }
    setDeleting(false)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pt-8 pb-24">
      {/* Back link */}
      <Link
        href={`/app/teams/${session.team_id}`}
        className="inline-flex items-center text-stone-500 hover:text-stone-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to {session.team_name || 'team'}
      </Link>

      {/* Session header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-stone-900">
            {session.title || angleInfo.label}
          </h1>
          {isActive && (
            <span className="text-sm bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full">
              Active
            </span>
          )}
          {isClosed && (
            <span className="text-sm bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
              Closed
            </span>
          )}
        </div>
        <p className="text-stone-500">
          {angleInfo.label} • {session.response_count} response{session.response_count !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Session Setup View (before 3 responses) */}
      {isActive && session.response_count < 3 && shareLink && (
        <SessionSetupView
          shareLink={shareLink}
          session={session}
          copied={copied}
          onCopy={handleCopy}
          t={t}
        />
      )}

      {/* Share link (when 3+ responses, compact view) */}
      {isActive && session.response_count >= 3 && shareLink && (
        <Card className="mb-8 border-cyan-200 bg-cyan-50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-stone-700 mb-1">{t('shareWithTeam')}</div>
                <code className="text-sm text-cyan-700 break-all">{shareLink}</code>
              </div>
              <Button onClick={handleCopy} variant="secondary" className="shrink-0">
                {copied ? t('copied') : t('copyLink')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Synthesis results */}
      {synthesis && session.response_count >= 3 && (
        <div className="space-y-6 mb-8">
          {/* Overall Score Card */}
          <Card className="border-cyan-200 bg-linear-to-r from-cyan-50 to-white">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-stone-500">{t('overallTeamScore')}</div>
                  <div className="text-4xl font-bold text-cyan-700">{synthesis.overall_score.toFixed(1)}</div>
                  <div className="text-sm text-stone-500 mt-1">
                    {synthesis.response_count} {t('responsesCount')} • {synthesis.disagreement_count > 0
                      ? `${synthesis.disagreement_count} ${t('areasOfDisagreement')}`
                      : t('teamAligned')}
                  </div>
                </div>
                <div className="text-right">
                  <ScoreGauge score={synthesis.overall_score} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Statements Breakdown */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-stone-900">{t('allStatements')}</h2>
              <p className="text-sm text-stone-500">{t('sortedByScore')}. {t('useInRetro')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {synthesis.all_scores.map((item, i) => (
                <StatementRow key={item.statement.id} item={item} rank={i + 1} t={t} />
              ))}
            </CardContent>
          </Card>

          {/* Focus area & experiment suggestion */}
          {isActive && (
            <Card className="border-cyan-200">
              <CardHeader>
                <h2 className="text-lg font-semibold text-stone-900">{t('suggestedFocus')}</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-stone-500 mb-1">{t('focusArea')}</div>
                  <p className="text-stone-900 font-medium">{synthesis.focus_area}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-500 mb-1">{t('suggestedExperiment')}</div>
                  <p className="text-stone-700">{synthesis.suggested_experiment}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Closed session outcome */}
      {isClosed && session.focus_area && (
        <Card className="mb-8 border-stone-300">
          <CardHeader>
            <h2 className="text-lg font-semibold text-stone-900">{t('sessionOutcome')}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-stone-500 mb-1">{t('focusArea')}</div>
              <p className="text-stone-900 font-medium">{session.focus_area}</p>
            </div>
            <div>
              <div className="text-sm font-medium text-stone-500 mb-1">{t('experiment')}</div>
              <p className="text-stone-700">{session.experiment}</p>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="text-sm font-medium text-stone-500 mb-1">{t('owner')}</div>
                <p className="text-stone-900">{session.experiment_owner}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-stone-500 mb-1">{t('followUp')}</div>
                <p className="text-stone-900">{session.followup_date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isActive && (
        <div className="flex gap-3">
          <Button
            onClick={() => setShowCloseModal(true)}
            disabled={session.response_count < 3}
            className="flex-1"
          >
            {t('closeSession')}
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="secondary"
            className="text-red-600 hover:text-red-700"
          >
            {t('deleteSession')}
          </Button>
        </div>
      )}

      {/* Close modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title={t('closeSession')}
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-500 -mt-2 mb-4">{t('closeSessionInfo')}</p>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {t('focusArea')}
            </label>
            <input
              type="text"
              value={focusArea}
              onChange={e => setFocusArea(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder={t('focusAreaPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {t('experiment')}
            </label>
            <textarea
              value={experiment}
              onChange={e => setExperiment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder={t('experimentPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {t('owner')}
            </label>
            <input
              type="text"
              value={owner}
              onChange={e => setOwner(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder={t('ownerPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              {t('followUp')}
            </label>
            <input
              type="date"
              value={followupDate}
              onChange={e => setFollowupDate(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowCloseModal(false)}
              variant="secondary"
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleClose}
              loading={closing}
              disabled={!focusArea || !experiment || !owner}
              className="flex-1"
            >
              {t('closeSession')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteSession')}
      >
        <p className="text-stone-600 mb-6">
          {t('deleteSessionConfirm')}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowDeleteModal(false)}
            variant="secondary"
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            loading={deleting}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {t('deleteSession')}
          </Button>
        </div>
      </Modal>
    </main>
  )
}

// Score gauge visualization
function ScoreGauge({ score }: { score: number }) {
  const percentage = ((score - 1) / 4) * 100 // Convert 1-5 to 0-100%
  const color = score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-cyan-500' : score >= 2 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="w-24 h-24 relative">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-stone-200"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className={color.replace('bg-', 'text-')}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${percentage}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-stone-700">{score.toFixed(1)}</span>
      </div>
    </div>
  )
}

// Statement row with distribution bars
function StatementRow({ item, rank, t }: { item: StatementScore; rank: number; t: TranslationFunction }) {
  const isStrength = rank <= 2
  const isTension = rank >= 9
  const hasDisagreement = item.variance > 1.0

  // Color based on score
  const scoreColor = item.score >= 4 ? 'bg-green-100 text-green-700'
    : item.score >= 3 ? 'bg-cyan-100 text-cyan-700'
    : item.score >= 2 ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700'

  // Calculate max for distribution bar scaling
  const maxDist = Math.max(...item.distribution, 1)

  return (
    <div className={`p-3 rounded-lg ${isStrength ? 'bg-green-50' : isTension ? 'bg-amber-50' : 'bg-stone-50'}`}>
      <div className="flex items-start gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg ${scoreColor} flex items-center justify-center text-sm font-bold shrink-0`}>
          {item.score.toFixed(1)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-stone-800 text-sm leading-relaxed">{item.statement.text}</p>
          <div className="flex items-center gap-2 mt-1">
            {isStrength && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">{t('strength')}</span>}
            {isTension && <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">{t('tension')}</span>}
            {hasDisagreement && <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">{t('disagreement')}</span>}
          </div>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="flex items-end gap-1 h-8 ml-13">
        {item.distribution.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full rounded-t ${i < 2 ? 'bg-red-300' : i === 2 ? 'bg-amber-300' : 'bg-green-300'}`}
              style={{ height: `${(count / maxDist) * 24}px`, minHeight: count > 0 ? '4px' : '0' }}
            />
            <span className="text-xs text-stone-400 mt-0.5">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Session Setup View - Coach-friendly pre-response interface
function SessionSetupView({
  shareLink,
  session,
  copied,
  onCopy,
  t
}: {
  shareLink: string
  session: DeltaSessionWithStats
  copied: boolean
  onCopy: () => void
  t: TranslationFunction
}) {
  const [showStatements, setShowStatements] = useState(false)
  const statements = getStatements(session.angle as DeltaAngle)

  return (
    <div className="space-y-6 mb-8">
      {/* Step 1: Session Link */}
      <Card className="border-cyan-200 bg-linear-to-br from-cyan-50 to-white">
        <CardContent className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="font-semibold text-stone-900">{t('readyToShare')}</h3>
          </div>

          {/* Link display */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
            <code className="text-sm text-cyan-700 break-all block">{shareLink}</code>
          </div>

          {/* Actions: Open (primary) + Copy (secondary) */}
          <div className="flex gap-3">
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t('openLink')}
              </Button>
            </a>
            <Button onClick={onCopy} variant="secondary" className="shrink-0">
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </Button>
          </div>

          <p className="text-xs text-stone-500 mt-3">{t('previewFirst')}</p>
        </CardContent>
      </Card>

      {/* Step 2: Sharing Guidance */}
      <Card className="border-stone-200">
        <CardContent className="py-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-1">{t('shareWithTeam')}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('sharingTip')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Statements Preview (collapsed) */}
      <Card className="border-stone-200">
        <CardContent className="py-5">
          <button
            onClick={() => setShowStatements(!showStatements)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold shrink-0">
                3
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-stone-900">
                  {t('viewStatements')} <span className="text-stone-500 font-normal">({statements.length})</span>
                </h3>
                <p className="text-sm text-stone-500">{t('statementsNote')}</p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-stone-400 transition-transform ${showStatements ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showStatements && (
            <div className="mt-4 ml-11 space-y-2">
              {statements.map((statement, i) => (
                <div key={statement.id} className="p-3 rounded-lg bg-stone-50 text-sm text-stone-700">
                  {i + 1}. {statement.text}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* What you will get */}
      <Card className="border-stone-200 bg-stone-50">
        <CardContent className="py-5">
          <h3 className="font-semibold text-stone-900 mb-4">{t('whatYouWillGet')}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-sm font-medium text-stone-800">{t('metricCapability')}</span>
              </div>
              <p className="text-xs text-stone-500 ml-4">{t('metricCapabilityDesc')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-sm font-medium text-stone-800">{t('metricAlignment')}</span>
              </div>
              <p className="text-xs text-stone-500 ml-4">{t('metricAlignmentDesc')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-stone-800">{t('metricFocus')}</span>
              </div>
              <p className="text-xs text-stone-500 ml-4">{t('metricFocusDesc')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-stone-800">{t('metricExperiment')}</span>
              </div>
              <p className="text-xs text-stone-500 ml-4">{t('metricExperimentDesc')}</p>
            </div>
          </div>

          <p className="text-xs text-stone-400 mt-4 pt-4 border-t border-stone-200">
            {t('minimumResponses')}
          </p>
        </CardContent>
      </Card>

      {/* Response counter */}
      {session.response_count > 0 && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-stone-600">
            {session.response_count} {t('waitingMessagePartial')}
          </span>
        </div>
      )}
    </div>
  )
}
