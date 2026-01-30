'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createSession } from '@/domain/delta/actions'
import { ANGLES, DeltaAngle } from '@/domain/delta/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n/context'

export default function NewDeltaSessionPage() {
  const router = useRouter()
  const params = useParams()
  const t = useTranslation()
  const teamId = params.id as string

  const [selectedAngle, setSelectedAngle] = useState<DeltaAngle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!selectedAngle) return

    setLoading(true)
    setError(null)

    const result = await createSession(teamId, selectedAngle)

    if (!result.success) {
      setError(result.error || 'Failed to create session')
      setLoading(false)
      return
    }

    router.push(`/app/delta/${result.sessionId}`)
  }

  // Map angle IDs to translation keys
  const getAngleLabel = (angleId: string) => {
    const labelMap: Record<string, string> = {
      scrum: t('angleScrum'),
      flow: t('angleFlow'),
      ownership: t('angleOwnership'),
      collaboration: t('angleCollaboration'),
      technical_excellence: t('angleTechnicalExcellence'),
      refinement: t('angleRefinement'),
      planning: t('anglePlanning'),
      retro: t('angleRetro'),
      demo: t('angleDemo'),
    }
    return labelMap[angleId] || angleId
  }

  const getAngleDesc = (angleId: string) => {
    const descMap: Record<string, string> = {
      scrum: t('angleScrumDesc'),
      flow: t('angleFlowDesc'),
      ownership: t('angleOwnershipDesc'),
      collaboration: t('angleCollaborationDesc'),
      technical_excellence: t('angleTechnicalExcellenceDesc'),
      refinement: t('angleRefinementDesc'),
      planning: t('anglePlanningDesc'),
      retro: t('angleRetroDesc'),
      demo: t('angleDemoDesc'),
    }
    return descMap[angleId] || ''
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
      {/* Back link */}
      <Link
        href={`/app/teams/${teamId}`}
        className="inline-flex items-center text-stone-500 hover:text-stone-700 mb-6 min-h-11 py-2"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('adminBack')}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">{t('pickAngle')}</h1>
        <p className="text-stone-600 mt-1">{t('justOne')}</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Angle selection */}
      <div className="space-y-3 mb-8">
        {ANGLES.map(angle => (
          <button
            key={angle.id}
            onClick={() => setSelectedAngle(angle.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedAngle === angle.id
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-stone-200 hover:border-stone-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                selectedAngle === angle.id
                  ? 'bg-cyan-500'
                  : 'bg-stone-300'
              }`}>
                {getAngleLabel(angle.id).charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-stone-900">{getAngleLabel(angle.id)}</div>
                <div className="text-sm text-stone-500">{getAngleDesc(angle.id)}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Link href={`/app/teams/${teamId}`} className="flex-1">
          <Button type="button" variant="secondary" className="w-full">
            {t('cancel')}
          </Button>
        </Link>
        <Button
          onClick={handleSubmit}
          disabled={!selectedAngle}
          loading={loading}
          className="flex-1"
        >
          {t('startSession')}
        </Button>
      </div>
    </main>
  )
}
