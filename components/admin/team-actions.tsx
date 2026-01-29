'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TeamWithStats, deleteTeam, resetTeam } from '@/domain/teams/actions'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'
import { useTranslation } from '@/lib/i18n/context'

interface TeamActionsProps {
  team: TeamWithStats
}

export function TeamActions({ team }: TeamActionsProps) {
  const t = useTranslation()
  const router = useRouter()
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    setLoading(true)
    const result = await resetTeam(team.id)
    setLoading(false)

    if (result.success) {
      setShowResetModal(false)
      router.refresh()
    }
  }

  async function handleDelete() {
    setLoading(true)
    const result = await deleteTeam(team.id)
    setLoading(false)

    if (result.success) {
      router.push('/admin/teams')
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShowResetModal(true)}>
          {t('teamReset')}
        </Button>
        <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
          {t('teamDeleteButton')}
        </Button>
      </div>

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
    </>
  )
}
