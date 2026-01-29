import { notFound } from 'next/navigation'
import { getTeam } from '@/domain/teams/actions'
import { getTeamSessions } from '@/domain/delta/actions'
import { TeamDetailContent } from '@/components/delta/team-detail-content'

interface TeamDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = await params

  const [team, sessions] = await Promise.all([
    getTeam(id),
    getTeamSessions(id),
  ])

  if (!team) {
    notFound()
  }

  return <TeamDetailContent team={team} sessions={sessions} />
}
