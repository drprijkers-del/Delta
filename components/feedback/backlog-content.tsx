'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BacklogItem, ReleaseNote, BacklogCategory, BacklogStatus, ProductType, submitWish } from '@/domain/backlog/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation, useLanguage, TranslationFunction } from '@/lib/i18n/context'

type FilterStatus = BacklogStatus | 'all'
type FilterCategory = BacklogCategory | 'all'
type WishState = 'browsing' | 'form' | 'submitting' | 'success'

interface BacklogContentProps {
  backlogItems: BacklogItem[]
  releaseNotes: ReleaseNote[]
}

export function BacklogContent({ backlogItems, releaseNotes }: BacklogContentProps) {
  const t = useTranslation()
  const { language } = useLanguage()
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showReleaseNotes, setShowReleaseNotes] = useState(false)

  // Wish form state
  const [wishState, setWishState] = useState<WishState>('browsing')
  const [wishText, setWishText] = useState('')
  const [wishWhy, setWishWhy] = useState('')
  const [wishError, setWishError] = useState('')

  // Filter items
  const filteredItems = backlogItems.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    return true
  })

  // Group by status for display
  const reviewItems = filteredItems.filter(i => i.status === 'review')
  const exploringItems = filteredItems.filter(i => i.status === 'exploring')
  const decidedItems = filteredItems.filter(i => i.status === 'decided')

  // Get unique categories from items
  const availableCategories = [...new Set(backlogItems.map(item => item.category))]

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getCategoryLabel = (category: BacklogCategory) => {
    const map: Record<BacklogCategory, string> = {
      ux: t('backlogCategoryUx'),
      statements: t('backlogCategoryStatements'),
      analytics: t('backlogCategoryAnalytics'),
      integration: t('backlogCategoryIntegration'),
      features: 'Features',
    }
    return map[category]
  }

  const getCategoryColor = (category: BacklogCategory) => {
    const map: Record<BacklogCategory, string> = {
      ux: 'bg-cyan-100 text-cyan-700',
      statements: 'bg-amber-100 text-amber-700',
      analytics: 'bg-purple-100 text-purple-700',
      integration: 'bg-stone-200 text-stone-700',
      features: 'bg-green-100 text-green-700',
    }
    return map[category]
  }

  const getStatusLabel = (status: BacklogStatus, decision?: 'building' | 'not_doing' | null) => {
    if (status === 'decided' && decision) {
      return decision === 'building' ? t('backlogDecisionBuilding') : t('backlogDecisionNotDoing')
    }
    const map: Record<BacklogStatus, string> = {
      review: t('backlogStatusReview'),
      exploring: t('backlogStatusExploring'),
      decided: t('backlogStatusDecided'),
    }
    return map[status]
  }

  const getStatusColor = (status: BacklogStatus, decision?: 'building' | 'not_doing' | null) => {
    if (status === 'decided') {
      return decision === 'building'
        ? 'bg-green-100 text-green-700'
        : 'bg-stone-200 text-stone-500'
    }
    const map: Record<BacklogStatus, string> = {
      review: 'bg-cyan-100 text-cyan-700',
      exploring: 'bg-amber-100 text-amber-700',
      decided: 'bg-stone-200 text-stone-600',
    }
    return map[status]
  }

  const getProductBadge = (product: ProductType) => {
    if (product === 'shared') return null
    const colors = {
      delta: 'bg-cyan-50 text-cyan-600',
      pulse: 'bg-purple-50 text-purple-600',
      shared: 'bg-stone-50 text-stone-600',
    }
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${colors[product]}`}>
        {product}
      </span>
    )
  }

  const handleShowForm = () => {
    setWishState('form')
    setWishError('')
  }

  const handleCancelForm = () => {
    setWishState('browsing')
    setWishText('')
    setWishWhy('')
    setWishError('')
  }

  const handleSubmitWish = async () => {
    if (!wishText.trim()) {
      setWishError(t('wishRequired'))
      return
    }

    setWishState('submitting')

    const result = await submitWish(wishText.trim(), wishWhy.trim())

    if (!result.success) {
      setWishError(result.error || 'Something went wrong')
      setWishState('form')
      return
    }

    setWishState('success')
    setWishText('')
    setWishWhy('')
  }

  const handleCloseSuccess = () => {
    setWishState('browsing')
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center text-stone-500 hover:text-stone-700 mb-6 min-h-11 py-2"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Delta
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">{t('backlogTitle')}</h1>
        <p className="text-stone-600">{t('backlogIntro')}</p>
        <p className="text-sm text-stone-400 mt-2">{t('backlogNotRoadmap')}</p>
      </div>

      {/* Release Notes Section (Collapsible) */}
      {releaseNotes.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowReleaseNotes(!showReleaseNotes)}
            className="w-full flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-stone-900">
                {language === 'nl' ? 'Release Notes' : 'Release Notes'}
              </span>
              <span className="text-xs text-stone-400">({releaseNotes.length})</span>
            </div>
            <svg
              className={`w-5 h-5 text-stone-400 transition-transform ${showReleaseNotes ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showReleaseNotes && (
            <div className="mt-2 space-y-3">
              {releaseNotes.map(note => (
                <Card key={note.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                            v{note.version}
                          </span>
                          <span className="text-xs text-stone-400">
                            {new Date(note.released_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="font-medium text-stone-900">
                          {language === 'nl' ? note.title_nl : note.title_en}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 mb-3">
                      {language === 'nl' ? note.description_nl : note.description_en}
                    </p>
                    {note.changes && note.changes.length > 0 && (
                      <ul className="text-sm text-stone-500 space-y-1">
                        {note.changes.map((change, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-500 mt-1">•</span>
                            <span>{language === 'nl' ? change.nl : change.en}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wish submission area */}
      {wishState === 'browsing' && (
        <div className="mb-8 p-4 bg-gradient-to-r from-cyan-50 to-stone-50 border border-cyan-100 rounded-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-stone-700 font-medium">{t('wishIntro')}</p>
            </div>
            <Button onClick={handleShowForm} className="shrink-0">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('backlogAddWish')}
            </Button>
          </div>
        </div>
      )}

      {/* Wish form */}
      {(wishState === 'form' || wishState === 'submitting') && (
        <Card className="mb-8 border-cyan-200">
          <CardContent className="py-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">{t('wishTitle')}</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="wish-text" className="block text-sm font-medium text-stone-700 mb-1">
                  {t('wishLabel')}
                </label>
                <textarea
                  id="wish-text"
                  value={wishText}
                  onChange={(e) => {
                    setWishText(e.target.value)
                    setWishError('')
                  }}
                  placeholder={t('wishPlaceholder')}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={wishState === 'submitting'}
                />
                {wishError && (
                  <p className="text-sm text-red-600 mt-1">{wishError}</p>
                )}
              </div>

              <div>
                <label htmlFor="wish-why" className="block text-sm font-medium text-stone-700 mb-1">
                  {t('wishWhyLabel')}
                </label>
                <textarea
                  id="wish-why"
                  value={wishWhy}
                  onChange={(e) => setWishWhy(e.target.value)}
                  placeholder={t('wishWhyPlaceholder')}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={wishState === 'submitting'}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmitWish}
                  disabled={wishState === 'submitting'}
                  className="flex-1"
                >
                  {wishState === 'submitting' ? t('wishSubmitting') : t('wishSubmit')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancelForm}
                  disabled={wishState === 'submitting'}
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success message */}
      {wishState === 'success' && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-2">{t('wishThanks')}</h2>
            <p className="text-sm text-stone-600 mb-4">{t('wishConfirmation')}</p>
            <Button variant="secondary" onClick={handleCloseSuccess}>
              {t('wishClose')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Status filter */}
        <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
          {(['all', 'review', 'exploring', 'decided'] as FilterStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === status
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {status === 'all' ? t('backlogViewAll') : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {availableCategories.length > 0 && (
          <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t('backlogViewAll')}
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  categoryFilter === cat
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && backlogItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-stone-500">{t('backlogEmpty')}</p>
          </CardContent>
        </Card>
      )}

      {filteredItems.length === 0 && backlogItems.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-stone-500">
              {language === 'nl' ? 'Geen items gevonden met deze filters.' : 'No items found with these filters.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Items grouped by status */}
      <div className="space-y-8">
        {/* Under Review */}
        {reviewItems.length > 0 && (statusFilter === 'all' || statusFilter === 'review') && (
          <section>
            <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wide mb-3">
              {t('backlogStatusReview')} ({reviewItems.length})
            </h2>
            <div className="space-y-3">
              {reviewItems.map(item => (
                <BacklogItemCard
                  key={item.id}
                  item={item}
                  language={language}
                  expanded={expandedItems.has(item.id)}
                  onToggle={() => toggleExpand(item.id)}
                  getCategoryLabel={getCategoryLabel}
                  getCategoryColor={getCategoryColor}
                  getStatusLabel={getStatusLabel}
                  getStatusColor={getStatusColor}
                  getProductBadge={getProductBadge}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}

        {/* Exploring */}
        {exploringItems.length > 0 && (statusFilter === 'all' || statusFilter === 'exploring') && (
          <section>
            <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wide mb-3">
              {t('backlogStatusExploring')} ({exploringItems.length})
            </h2>
            <div className="space-y-3">
              {exploringItems.map(item => (
                <BacklogItemCard
                  key={item.id}
                  item={item}
                  language={language}
                  expanded={expandedItems.has(item.id)}
                  onToggle={() => toggleExpand(item.id)}
                  getCategoryLabel={getCategoryLabel}
                  getCategoryColor={getCategoryColor}
                  getStatusLabel={getStatusLabel}
                  getStatusColor={getStatusColor}
                  getProductBadge={getProductBadge}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}

        {/* Decided */}
        {decidedItems.length > 0 && (statusFilter === 'all' || statusFilter === 'decided') && (
          <section>
            <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wide mb-3">
              {t('backlogStatusDecided')} ({decidedItems.length})
            </h2>
            <div className="space-y-3">
              {decidedItems.map(item => (
                <BacklogItemCard
                  key={item.id}
                  item={item}
                  language={language}
                  expanded={expandedItems.has(item.id)}
                  onToggle={() => toggleExpand(item.id)}
                  getCategoryLabel={getCategoryLabel}
                  getCategoryColor={getCategoryColor}
                  getStatusLabel={getStatusLabel}
                  getStatusColor={getStatusColor}
                  getProductBadge={getProductBadge}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Pulse link */}
      <div className="mt-12 p-4 bg-gradient-to-r from-purple-50 to-stone-50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-purple-600">P</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-stone-900">
              {language === 'nl' ? 'Ontdek Pulse' : 'Discover Pulse'}
            </p>
            <p className="text-xs text-stone-500">
              {language === 'nl'
                ? 'Dagelijkse team stemmings-check-ins'
                : 'Daily team mood check-ins'}
            </p>
          </div>
          <a
            href="https://mood-app-one.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {language === 'nl' ? 'Bekijken' : 'View'} →
          </a>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-stone-400 mt-8 text-center">
        {t('backlogReadOnly')}
      </p>
    </main>
  )
}

function BacklogItemCard({
  item,
  language,
  expanded,
  onToggle,
  getCategoryLabel,
  getCategoryColor,
  getStatusLabel,
  getStatusColor,
  getProductBadge,
  t,
}: {
  item: BacklogItem
  language: 'nl' | 'en'
  expanded: boolean
  onToggle: () => void
  getCategoryLabel: (cat: BacklogCategory) => string
  getCategoryColor: (cat: BacklogCategory) => string
  getStatusLabel: (status: BacklogStatus, decision?: 'building' | 'not_doing' | null) => string
  getStatusColor: (status: BacklogStatus, decision?: 'building' | 'not_doing' | null) => string
  getProductBadge: (product: ProductType) => React.ReactNode
  t: TranslationFunction
}) {
  const isNotDoing = item.status === 'decided' && item.decision === 'not_doing'

  return (
    <Card className={isNotDoing ? 'opacity-70' : ''}>
      <CardContent className="py-4">
        <button
          onClick={onToggle}
          className="w-full text-left"
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {getProductBadge(item.product)}
                <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(item.category)}`}>
                  {getCategoryLabel(item.category)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(item.status, item.decision)}`}>
                  {getStatusLabel(item.status, item.decision)}
                </span>
              </div>
              <h3 className={`font-medium ${isNotDoing ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
                {language === 'nl' ? item.title_nl : item.title_en}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {t('backlogReviewed')}: {item.reviewed_at}
                {item.decided_at && ` · ${t('backlogDecidedOn')}: ${item.decided_at}`}
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-stone-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
            <div>
              <div className="text-xs font-medium text-stone-400 mb-1">{t('backlogSource')}</div>
              <p className="text-sm text-stone-600">
                {language === 'nl' ? item.source_nl : item.source_en}
              </p>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-400 mb-1">{t('backlogOurTake')}</div>
              <p className="text-sm text-stone-600">
                {language === 'nl' ? item.our_take_nl : item.our_take_en}
              </p>
            </div>
            {(item.rationale_nl || item.rationale_en) && (
              <div>
                <div className="text-xs font-medium text-stone-400 mb-1">{t('backlogDecision')}</div>
                <p className={`text-sm ${isNotDoing ? 'text-stone-500' : 'text-stone-600'}`}>
                  {language === 'nl' ? item.rationale_nl : item.rationale_en}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
