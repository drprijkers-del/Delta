'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

/**
 * Floating feedback button that opens a feedback form modal.
 * Appears on every page, positioned bottom-right on desktop.
 */
export function FeedbackButton() {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError(t('feedbackRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Simulate submission (in production, this would send to an endpoint)
    // For now, we just show success - feedback is logged to console
    console.log('[Delta Feedback]', feedback)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsSubmitting(false)
    setIsSubmitted(true)
    setFeedback('')
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset state after animation
    setTimeout(() => {
      setIsSubmitted(false)
      setFeedback('')
      setError(null)
    }, 200)
  }

  return (
    <>
      {/* Floating button - bottom right, only on desktop */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-sm transition-colors z-40 hidden sm:flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {t('feedbackButton')}
      </button>

      {/* Feedback modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isSubmitted ? t('feedbackThanks') : t('feedbackTitle')}
      >
        {isSubmitted ? (
          // Success state
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-stone-600 text-center">
              {t('feedbackConfirmation')}
            </p>
            <div className="flex gap-3 pt-2">
              <Link href="/feedback/backlog" className="flex-1" onClick={handleClose}>
                <Button variant="secondary" className="w-full">
                  {t('feedbackViewBacklog')}
                </Button>
              </Link>
              <Button onClick={handleClose} className="flex-1">
                {t('feedbackClose')}
              </Button>
            </div>
          </div>
        ) : (
          // Form state
          <div className="space-y-4">
            <p className="text-sm text-stone-500 -mt-2">
              {t('feedbackIntro')}
            </p>
            <textarea
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value)
                setError(null)
              }}
              placeholder={t('feedbackPlaceholder')}
              rows={4}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-sm"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="secondary"
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? t('feedbackSubmitting') : t('feedbackSubmit')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
