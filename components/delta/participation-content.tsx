'use client'

import { useState, useEffect } from 'react'
import { submitResponse, hasResponded } from '@/domain/delta/actions'
import { getStatements } from '@/domain/delta/statements'
import { DeltaAngle, getAngleInfo, ResponseAnswers, Statement } from '@/domain/delta/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { v4 as uuidv4 } from 'uuid'

interface ParticipationContentProps {
  sessionId: string
  sessionCode: string
  teamName: string
  angle: DeltaAngle
  title: string | null
}

type ViewState = 'loading' | 'intro' | 'statements' | 'submitting' | 'done' | 'already_responded'

export function ParticipationContent({
  sessionId,
  sessionCode,
  teamName,
  angle,
  title,
}: ParticipationContentProps) {
  const [viewState, setViewState] = useState<ViewState>('loading')
  const [statements, setStatements] = useState<Statement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<ResponseAnswers>({})
  const [deviceId, setDeviceId] = useState<string>('')

  const angleInfo = getAngleInfo(angle)

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Get or create device ID
      let storedDeviceId = localStorage.getItem('delta_device_id')
      if (!storedDeviceId) {
        storedDeviceId = uuidv4()
        localStorage.setItem('delta_device_id', storedDeviceId)
      }
      setDeviceId(storedDeviceId)

      // Check if already responded
      const alreadyDone = await hasResponded(sessionId, storedDeviceId)
      if (alreadyDone) {
        setViewState('already_responded')
        return
      }

      // Load statements
      const stmts = getStatements(angle)
      setStatements(stmts)
      setViewState('intro')
    }

    init()
  }, [sessionId, angle])

  function handleStart() {
    setViewState('statements')
  }

  function handleAnswer(score: number) {
    const statement = statements[currentIndex]
    setAnswers(prev => ({ ...prev, [statement.id]: score }))

    if (currentIndex < statements.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleSubmit({ ...answers, [statement.id]: score })
    }
  }

  async function handleSubmit(finalAnswers: ResponseAnswers) {
    setViewState('submitting')

    const result = await submitResponse(sessionId, deviceId, finalAnswers)

    if (result.alreadyResponded) {
      setViewState('already_responded')
    } else if (result.success) {
      setViewState('done')
    } else {
      // On error, go back to last statement
      setViewState('statements')
    }
  }

  // Loading state
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Already responded
  if (viewState === 'already_responded') {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">Already Responded</h1>
            <p className="text-stone-500">
              You&apos;ve already submitted your response to this session.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Intro screen
  if (viewState === 'intro') {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center">
            <div className="text-sm text-cyan-600 font-medium mb-2">Delta Session</div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">{teamName}</h1>
            <p className="text-stone-500 mb-8">{title || angleInfo.label}</p>

            <div className="text-left bg-stone-50 rounded-xl p-4 mb-8">
              <div className="text-sm font-medium text-stone-700 mb-2">How it works</div>
              <ul className="text-sm text-stone-600 space-y-2">
                <li>• {statements.length} statements. Be honest.</li>
                <li>• Rate each from 1 (disagree) to 5 (agree).</li>
                <li>• Your responses are anonymous.</li>
              </ul>
            </div>

            <Button onClick={handleStart} className="w-full">
              Start
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Statements flow
  if (viewState === 'statements' || viewState === 'submitting') {
    const statement = statements[currentIndex]
    const progress = ((currentIndex) / statements.length) * 100

    return (
      <div className="min-h-screen bg-stone-900 flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-stone-800">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-4 text-center">
          <div className="text-stone-500 text-sm">
            {currentIndex + 1} of {statements.length}
          </div>
        </div>

        {/* Statement */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <p className="text-white text-xl sm:text-2xl font-medium text-center leading-relaxed">
              &ldquo;{statement.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Answer buttons */}
        <div className="p-6 pb-12">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between text-stone-500 text-sm mb-3 px-2">
              <span>Disagree</span>
              <span>Agree</span>
            </div>
            <div className="flex gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  onClick={() => handleAnswer(score)}
                  disabled={viewState === 'submitting'}
                  className="flex-1 aspect-square rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-cyan-600 text-white text-xl sm:text-2xl font-bold transition-colors disabled:opacity-50"
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Done
  if (viewState === 'done') {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">Done.</h1>
            <p className="text-stone-500">
              Your responses have been recorded. Thank you.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
