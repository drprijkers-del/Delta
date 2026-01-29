import { notFound } from 'next/navigation'
import { getTeam } from '@/domain/teams/actions'
import { getTeamMetrics, getTeamInsights, getFlyFrequency } from '@/domain/metrics/actions'
import { requireAdmin } from '@/lib/auth/admin'
import { TeamDetailContent } from '@/components/admin/team-detail-content'

interface TeamDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  await requireAdmin()
  const { id } = await params

  // Fetch team and metrics in parallel
  const [team, metrics, insights, flyFrequency] = await Promise.all([
    getTeam(id),
    getTeamMetrics(id),
    getTeamInsights(id),
    getFlyFrequency(id),
  ])

  if (!team) {
    notFound()
  }

  return <TeamDetailContent team={team} metrics={metrics} insights={insights} flyFrequency={flyFrequency} />
}
