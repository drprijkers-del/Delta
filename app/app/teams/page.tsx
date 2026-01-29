import { getTeams } from '@/domain/teams/actions'
import { TeamsListContent } from '@/components/admin/teams-list-content'

export default async function TeamsPage() {
  const teams = await getTeams()
  return <TeamsListContent teams={teams} />
}
