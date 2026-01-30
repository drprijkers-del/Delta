'use client'

import { useState } from 'react'
import Link from 'next/link'
import { backlogItems, BacklogItem, BacklogCategory, BacklogStatus } from '@/domain/feedback/backlog-data'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation, useLanguage } from '@/lib/i18n/context'

type FilterStatus = BacklogStatus | 'all'
type FilterCategory = BacklogCategory | 'all'

export function BacklogContent() {
  const t = useTranslation()
  const { language } = useLanguage()
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

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
    }
    return map[category]
  }

  const getCategoryColor = (category: BacklogCategory) => {
    const map: Record<BacklogCategory, string> = {
      ux: 'bg-cyan-100 text-cyan-700',
      statements: 'bg-amber-100 text-amber-700',
      analytics: 'bg-purple-100 text-purple-700',
      integration: 'bg-stone-200 text-stone-700',
    }
    return map[category]
  }

  const getStatusLabel = (status: BacklogStatus, decision?: 'building' | 'not_doing') => {
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

  const getStatusColor = (status: BacklogStatus, decision?: 'building' | 'not_doing') => {
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

      {/* Guardrails - what users cannot do */}
      <div className="mb-8 p-4 bg-stone-100 rounded-xl">
        <h2 className="text-sm font-medium text-stone-700 mb-2">{t('backlogGuardrailsTitle')}</h2>
        <p className="text-sm text-stone-500 mb-3">{t('backlogGuardrailsText')}</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded">
            {t('backlogNoVoting')}
          </span>
          <span className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded">
            {t('backlogNoComments')}
          </span>
          <span className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded">
            {t('backlogNoRequests')}
          </span>
          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
            {t('backlogCuratedBy')}
          </span>
        </div>
      </div>

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
        <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
          {(['all', 'ux', 'statements', 'analytics', 'integration'] as FilterCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                categoryFilter === cat
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {cat === 'all' ? t('backlogViewAll') : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-stone-500">{t('backlogEmpty')}</p>
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
                  t={t}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-stone-400 mt-12 text-center">
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
  t,
}: {
  item: BacklogItem
  language: 'nl' | 'en'
  expanded: boolean
  onToggle: () => void
  getCategoryLabel: (cat: BacklogCategory) => string
  getCategoryColor: (cat: BacklogCategory) => string
  getStatusLabel: (status: BacklogStatus, decision?: 'building' | 'not_doing') => string
  getStatusColor: (status: BacklogStatus, decision?: 'building' | 'not_doing') => string
  t: (key: any) => string
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
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(item.category)}`}>
                  {getCategoryLabel(item.category)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(item.status, item.decision)}`}>
                  {getStatusLabel(item.status, item.decision)}
                </span>
              </div>
              <h3 className={`font-medium ${isNotDoing ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
                {item.title[language]}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {t('backlogReviewed')}: {item.reviewedAt}
                {item.decidedAt && ` · ${t('backlogDecidedOn')}: ${item.decidedAt}`}
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
              <p className="text-sm text-stone-600">{item.source[language]}</p>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-400 mb-1">{t('backlogOurTake')}</div>
              <p className="text-sm text-stone-600">{item.ourTake[language]}</p>
            </div>
            {item.rationale && (
              <div>
                <div className="text-xs font-medium text-stone-400 mb-1">{t('backlogDecision')}</div>
                <p className={`text-sm ${isNotDoing ? 'text-stone-500' : 'text-stone-600'}`}>
                  {item.rationale[language]}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
