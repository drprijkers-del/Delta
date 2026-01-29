import { getTeams } from '@/domain/teams/actions'
import { requireAdmin } from '@/lib/auth/admin'
import { TeamsListContent } from '@/components/admin/teams-list-content'

export default async function TeamsPage() {
  await requireAdmin()
  const teams = await getTeams()

  return <TeamsListContent teams={teams} />
}
