'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BacklogItem,
  ReleaseNote,
  ProductType,
  BacklogCategory,
  BacklogStatus,
  BacklogDecision,
  createBacklogItem,
  updateBacklogItem,
  deleteBacklogItem,
  createReleaseNote,
  updateReleaseNote,
  deleteReleaseNote,
} from '@/domain/backlog/actions'
import { AdminHeader } from '@/components/admin/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ConfirmModal } from '@/components/ui/modal'
import { useTranslation, useLanguage } from '@/lib/i18n/context'

interface BacklogManagementContentProps {
  backlogItems: BacklogItem[]
  releaseNotes: ReleaseNote[]
}

type Tab = 'backlog' | 'releases'

export function BacklogManagementContent({ backlogItems, releaseNotes }: BacklogManagementContentProps) {
  const t = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('backlog')
  const [showBacklogForm, setShowBacklogForm] = useState(false)
  const [showReleaseForm, setShowReleaseForm] = useState(false)
  const [editingBacklog, setEditingBacklog] = useState<BacklogItem | null>(null)
  const [editingRelease, setEditingRelease] = useState<ReleaseNote | null>(null)
  const [deleteBacklogId, setDeleteBacklogId] = useState<string | null>(null)
  const [deleteReleaseId, setDeleteReleaseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Group backlog items by status
  const itemsByStatus = {
    review: backlogItems.filter(i => i.status === 'review'),
    exploring: backlogItems.filter(i => i.status === 'exploring'),
    decided: backlogItems.filter(i => i.status === 'decided'),
  }

  async function handleBacklogSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    if (editingBacklog) {
      await updateBacklogItem(editingBacklog.id, formData)
    } else {
      await createBacklogItem(formData)
    }

    setLoading(false)
    setShowBacklogForm(false)
    setEditingBacklog(null)
    router.refresh()
  }

  async function handleReleaseSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    if (editingRelease) {
      await updateReleaseNote(editingRelease.id, formData)
    } else {
      await createReleaseNote(formData)
    }

    setLoading(false)
    setShowReleaseForm(false)
    setEditingRelease(null)
    router.refresh()
  }

  async function handleDeleteBacklog() {
    if (!deleteBacklogId) return
    setLoading(true)
    await deleteBacklogItem(deleteBacklogId)
    setLoading(false)
    setDeleteBacklogId(null)
    router.refresh()
  }

  async function handleDeleteRelease() {
    if (!deleteReleaseId) return
    setLoading(true)
    await deleteReleaseNote(deleteReleaseId)
    setLoading(false)
    setDeleteReleaseId(null)
    router.refresh()
  }

  function getProductBadge(product: ProductType) {
    const colors = {
      delta: 'bg-cyan-100 text-cyan-700',
      pulse: 'bg-purple-100 text-purple-700',
      shared: 'bg-stone-100 text-stone-700',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[product]}`}>
        {product}
      </span>
    )
  }

  function getCategoryLabel(category: BacklogCategory) {
    const labels = {
      ux: 'UX',
      statements: language === 'nl' ? 'Stellingen' : 'Statements',
      analytics: 'Analytics',
      integration: language === 'nl' ? 'Integratie' : 'Integration',
      features: 'Features',
    }
    return labels[category]
  }

  function getStatusBadge(status: BacklogStatus, decision?: BacklogDecision | null) {
    if (status === 'decided' && decision) {
      const colors = decision === 'building' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      const label = decision === 'building'
        ? (language === 'nl' ? 'Bouwen' : 'Building')
        : (language === 'nl' ? 'Niet doen' : 'Not doing')
      return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors}`}>{label}</span>
    }

    const statusLabels = {
      review: { nl: 'Review', en: 'Review', color: 'bg-yellow-100 text-yellow-700' },
      exploring: { nl: 'Verkennen', en: 'Exploring', color: 'bg-blue-100 text-blue-700' },
      decided: { nl: 'Besloten', en: 'Decided', color: 'bg-stone-100 text-stone-700' },
    }

    const s = statusLabels[status]
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.color}`}>{s[language]}</span>
  }

  return (
    <div className="relative overflow-hidden">
      <AdminHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/admin/teams"
          className="inline-flex items-center text-stone-500 hover:text-stone-700 mb-6 min-h-11 py-2"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('adminBack')}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Backlog & Release Notes</h1>
            <p className="text-stone-500 mt-1">
              {language === 'nl' ? 'Beheer backlog items en release notes voor Delta en Pulse' : 'Manage backlog items and release notes for Delta and Pulse'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('backlog')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'backlog'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Backlog ({backlogItems.length})
          </button>
          <button
            onClick={() => setActiveTab('releases')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'releases'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Release Notes ({releaseNotes.length})
          </button>
        </div>

        {/* Backlog Tab */}
        {activeTab === 'backlog' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button onClick={() => { setEditingBacklog(null); setShowBacklogForm(true) }}>
                + {language === 'nl' ? 'Nieuw item' : 'New item'}
              </Button>
            </div>

            {/* Backlog Form Modal */}
            {showBacklogForm && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="font-medium text-stone-900">
                    {editingBacklog
                      ? (language === 'nl' ? 'Item bewerken' : 'Edit item')
                      : (language === 'nl' ? 'Nieuw backlog item' : 'New backlog item')
                    }
                  </h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBacklogSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Product</label>
                        <select
                          name="product"
                          defaultValue={editingBacklog?.product || 'delta'}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        >
                          <option value="delta">Delta</option>
                          <option value="pulse">Pulse</option>
                          <option value="shared">{language === 'nl' ? 'Gedeeld' : 'Shared'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          {language === 'nl' ? 'Categorie' : 'Category'}
                        </label>
                        <select
                          name="category"
                          defaultValue={editingBacklog?.category || 'ux'}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        >
                          <option value="ux">UX</option>
                          <option value="statements">{language === 'nl' ? 'Stellingen' : 'Statements'}</option>
                          <option value="analytics">Analytics</option>
                          <option value="integration">{language === 'nl' ? 'Integratie' : 'Integration'}</option>
                          <option value="features">Features</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                        <select
                          name="status"
                          defaultValue={editingBacklog?.status || 'review'}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        >
                          <option value="review">Review</option>
                          <option value="exploring">{language === 'nl' ? 'Verkennen' : 'Exploring'}</option>
                          <option value="decided">{language === 'nl' ? 'Besloten' : 'Decided'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          {language === 'nl' ? 'Beslissing (indien status = besloten)' : 'Decision (if status = decided)'}
                        </label>
                        <select
                          name="decision"
                          defaultValue={editingBacklog?.decision || ''}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        >
                          <option value="">-</option>
                          <option value="building">{language === 'nl' ? 'Bouwen' : 'Building'}</option>
                          <option value="not_doing">{language === 'nl' ? 'Niet doen' : 'Not doing'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          {language === 'nl' ? 'Reviewed datum' : 'Reviewed date'}
                        </label>
                        <input
                          type="date"
                          name="reviewed_at"
                          defaultValue={editingBacklog?.reviewed_at || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        name="title_nl"
                        label="Titel (NL)"
                        defaultValue={editingBacklog?.title_nl || ''}
                        required
                      />
                      <Input
                        name="title_en"
                        label="Title (EN)"
                        defaultValue={editingBacklog?.title_en || ''}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Bron (NL)</label>
                        <input
                          name="source_nl"
                          defaultValue={editingBacklog?.source_nl || ''}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Source (EN)</label>
                        <input
                          name="source_en"
                          defaultValue={editingBacklog?.source_en || ''}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          {language === 'nl' ? 'Onze kijk (NL)' : 'Our take (NL)'}
                        </label>
                        <textarea
                          name="our_take_nl"
                          rows={3}
                          defaultValue={editingBacklog?.our_take_nl || ''}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Our take (EN)</label>
                        <textarea
                          name="our_take_en"
                          rows={3}
                          defaultValue={editingBacklog?.our_take_en || ''}
                          required
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Rationale (NL)</label>
                        <textarea
                          name="rationale_nl"
                          rows={2}
                          defaultValue={editingBacklog?.rationale_nl || ''}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Rationale (EN)</label>
                        <textarea
                          name="rationale_en"
                          rows={2}
                          defaultValue={editingBacklog?.rationale_en || ''}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="secondary" type="button" onClick={() => { setShowBacklogForm(false); setEditingBacklog(null) }}>
                        {language === 'nl' ? 'Annuleren' : 'Cancel'}
                      </Button>
                      <Button type="submit" loading={loading}>
                        {editingBacklog
                          ? (language === 'nl' ? 'Opslaan' : 'Save')
                          : (language === 'nl' ? 'Toevoegen' : 'Add')
                        }
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Backlog Items List */}
            <div className="space-y-6">
              {(['review', 'exploring', 'decided'] as BacklogStatus[]).map(status => (
                <div key={status}>
                  <h3 className="text-sm font-medium text-stone-500 mb-3 uppercase tracking-wide">
                    {status === 'review' && (language === 'nl' ? 'In review' : 'Under review')}
                    {status === 'exploring' && (language === 'nl' ? 'Verkennen' : 'Exploring')}
                    {status === 'decided' && (language === 'nl' ? 'Besloten' : 'Decided')}
                    {' '}({itemsByStatus[status].length})
                  </h3>

                  {itemsByStatus[status].length === 0 ? (
                    <p className="text-sm text-stone-400 italic">
                      {language === 'nl' ? 'Geen items' : 'No items'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {itemsByStatus[status].map(item => (
                        <Card key={item.id} className="hover:border-stone-300 transition-colors">
                          <CardContent className="py-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  {getProductBadge(item.product)}
                                  <span className="text-xs text-stone-400">{getCategoryLabel(item.category)}</span>
                                  {getStatusBadge(item.status, item.decision)}
                                </div>
                                <p className="font-medium text-stone-900">
                                  {language === 'nl' ? item.title_nl : item.title_en}
                                </p>
                                <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                                  {language === 'nl' ? item.our_take_nl : item.our_take_en}
                                </p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => { setEditingBacklog(item); setShowBacklogForm(true) }}
                                  className="p-2 text-stone-400 hover:text-stone-600"
                                  title={language === 'nl' ? 'Bewerken' : 'Edit'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeleteBacklogId(item.id)}
                                  className="p-2 text-stone-400 hover:text-red-600"
                                  title={language === 'nl' ? 'Verwijderen' : 'Delete'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Release Notes Tab */}
        {activeTab === 'releases' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button onClick={() => { setEditingRelease(null); setShowReleaseForm(true) }}>
                + {language === 'nl' ? 'Nieuwe release' : 'New release'}
              </Button>
            </div>

            {/* Release Form Modal */}
            {showReleaseForm && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="font-medium text-stone-900">
                    {editingRelease
                      ? (language === 'nl' ? 'Release bewerken' : 'Edit release')
                      : (language === 'nl' ? 'Nieuwe release note' : 'New release note')
                    }
                  </h2>
                </CardHeader>
                <CardContent>
                  <ReleaseNoteForm
                    editingRelease={editingRelease}
                    language={language}
                    loading={loading}
                    onSubmit={handleReleaseSubmit}
                    onCancel={() => { setShowReleaseForm(false); setEditingRelease(null) }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Release Notes List */}
            {releaseNotes.length === 0 ? (
              <p className="text-sm text-stone-400 italic text-center py-8">
                {language === 'nl' ? 'Nog geen release notes' : 'No release notes yet'}
              </p>
            ) : (
              <div className="space-y-2">
                {releaseNotes.map(note => (
                  <Card key={note.id} className="hover:border-stone-300 transition-colors">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {getProductBadge(note.product)}
                            <span className="text-xs font-mono text-stone-500">v{note.version}</span>
                            <span className="text-xs text-stone-400">
                              {new Date(note.released_at).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US')}
                            </span>
                          </div>
                          <p className="font-medium text-stone-900">
                            {language === 'nl' ? note.title_nl : note.title_en}
                          </p>
                          <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                            {language === 'nl' ? note.description_nl : note.description_en}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => { setEditingRelease(note); setShowReleaseForm(true) }}
                            className="p-2 text-stone-400 hover:text-stone-600"
                            title={language === 'nl' ? 'Bewerken' : 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteReleaseId(note.id)}
                            className="p-2 text-stone-400 hover:text-red-600"
                            title={language === 'nl' ? 'Verwijderen' : 'Delete'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Backlog Modal */}
      <ConfirmModal
        isOpen={!!deleteBacklogId}
        onClose={() => setDeleteBacklogId(null)}
        onConfirm={handleDeleteBacklog}
        title={language === 'nl' ? 'Item verwijderen' : 'Delete item'}
        message={language === 'nl' ? 'Weet je zeker dat je dit item wilt verwijderen? Dit kan niet ongedaan worden gemaakt.' : 'Are you sure you want to delete this item? This cannot be undone.'}
        confirmLabel={language === 'nl' ? 'Verwijderen' : 'Delete'}
        confirmVariant="danger"
        loading={loading}
      />

      {/* Delete Release Modal */}
      <ConfirmModal
        isOpen={!!deleteReleaseId}
        onClose={() => setDeleteReleaseId(null)}
        onConfirm={handleDeleteRelease}
        title={language === 'nl' ? 'Release note verwijderen' : 'Delete release note'}
        message={language === 'nl' ? 'Weet je zeker dat je deze release note wilt verwijderen? Dit kan niet ongedaan worden gemaakt.' : 'Are you sure you want to delete this release note? This cannot be undone.'}
        confirmLabel={language === 'nl' ? 'Verwijderen' : 'Delete'}
        confirmVariant="danger"
        loading={loading}
      />
    </div>
  )
}

// Separate component for release form to handle changes array
interface ReleaseNoteFormProps {
  editingRelease: ReleaseNote | null
  language: 'nl' | 'en'
  loading: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

function ReleaseNoteForm({ editingRelease, language, loading, onSubmit, onCancel }: ReleaseNoteFormProps) {
  const [changes, setChanges] = useState<{ nl: string; en: string }[]>(
    editingRelease?.changes || [{ nl: '', en: '' }]
  )

  function addChange() {
    setChanges([...changes, { nl: '', en: '' }])
  }

  function removeChange(index: number) {
    setChanges(changes.filter((_, i) => i !== index))
  }

  function updateChange(index: number, lang: 'nl' | 'en', value: string) {
    const updated = [...changes]
    updated[index][lang] = value
    setChanges(updated)
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Add changes as JSON
    formData.set('changes', JSON.stringify(changes.filter(c => c.nl || c.en)))
    onSubmit({ ...e, currentTarget: { ...e.currentTarget, elements: e.currentTarget.elements } } as React.FormEvent<HTMLFormElement>)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Product</label>
          <select
            name="product"
            defaultValue={editingRelease?.product || 'delta'}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
          >
            <option value="delta">Delta</option>
            <option value="pulse">Pulse</option>
            <option value="shared">{language === 'nl' ? 'Gedeeld' : 'Shared'}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Versie</label>
          <input
            name="version"
            placeholder="1.0.0"
            defaultValue={editingRelease?.version || ''}
            required
            className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            {language === 'nl' ? 'Release datum' : 'Release date'}
          </label>
          <input
            type="date"
            name="released_at"
            defaultValue={editingRelease?.released_at || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="title_nl"
          label="Titel (NL)"
          defaultValue={editingRelease?.title_nl || ''}
          required
        />
        <Input
          name="title_en"
          label="Title (EN)"
          defaultValue={editingRelease?.title_en || ''}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Beschrijving (NL)</label>
          <textarea
            name="description_nl"
            rows={2}
            defaultValue={editingRelease?.description_nl || ''}
            required
            className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description (EN)</label>
          <textarea
            name="description_en"
            rows={2}
            defaultValue={editingRelease?.description_en || ''}
            required
            className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900"
          />
        </div>
      </div>

      {/* Changes list */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {language === 'nl' ? 'Wijzigingen' : 'Changes'}
        </label>
        <div className="space-y-2">
          {changes.map((change, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  value={change.nl}
                  onChange={(e) => updateChange(index, 'nl', e.target.value)}
                  placeholder="NL"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                />
                <input
                  value={change.en}
                  onChange={(e) => updateChange(index, 'en', e.target.value)}
                  placeholder="EN"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeChange(index)}
                className="p-2 text-stone-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addChange}
          className="mt-2 text-sm text-cyan-600 hover:text-cyan-700"
        >
          + {language === 'nl' ? 'Wijziging toevoegen' : 'Add change'}
        </button>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>
          {language === 'nl' ? 'Annuleren' : 'Cancel'}
        </Button>
        <Button type="submit" loading={loading}>
          {editingRelease
            ? (language === 'nl' ? 'Opslaan' : 'Save')
            : (language === 'nl' ? 'Toevoegen' : 'Add')
          }
        </Button>
      </div>

      {/* Hidden input for changes JSON - will be set on submit */}
      <input type="hidden" name="changes" value={JSON.stringify(changes)} />
    </form>
  )
}
