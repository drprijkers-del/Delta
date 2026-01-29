'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createSession } from '@/domain/delta/actions'
import { ANGLES, DeltaAngle } from '@/domain/delta/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NewDeltaSessionPage() {
  const router = useRouter()
  const params = useParams()
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

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href={`/app/teams/${teamId}`}
        className="inline-flex items-center text-stone-500 hover:text-stone-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Pick an angle.</h1>
        <p className="text-stone-600 mt-1">Just one.</p>
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
                {angle.label.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-stone-900">{angle.label}</div>
                <div className="text-sm text-stone-500">{angle.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Link href={`/app/teams/${teamId}`} className="flex-1">
          <Button type="button" variant="secondary" className="w-full">
            Cancel
          </Button>
        </Link>
        <Button
          onClick={handleSubmit}
          disabled={!selectedAngle}
          loading={loading}
          className="flex-1"
        >
          Start Session
        </Button>
      </div>
    </main>
  )
}
