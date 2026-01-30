import { requireSuperAdmin } from '@/lib/auth/admin'
import { getBacklogItems, getReleaseNotes } from '@/domain/backlog/actions'
import { BacklogManagementContent } from '@/components/admin/backlog-management-content'

export default async function BacklogAdminPage() {
  await requireSuperAdmin()

  const [backlogItems, releaseNotes] = await Promise.all([
    getBacklogItems(),
    getReleaseNotes(),
  ])

  return (
    <BacklogManagementContent
      backlogItems={backlogItems}
      releaseNotes={releaseNotes}
    />
  )
}
