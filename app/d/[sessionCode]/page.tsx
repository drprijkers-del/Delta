import { validateSessionCode } from '@/domain/delta/actions'
import { ParticipationContent } from '@/components/delta/participation-content'
import { InvalidSession } from '@/components/delta/invalid-session'

interface ParticipationPageProps {
  params: Promise<{ sessionCode: string }>
}

export default async function ParticipationPage({ params }: ParticipationPageProps) {
  const { sessionCode } = await params

  const validation = await validateSessionCode(sessionCode)

  if (!validation.valid || !validation.session) {
    return <InvalidSession />
  }

  return (
    <ParticipationContent
      sessionId={validation.session.id}
      sessionCode={sessionCode}
      teamName={validation.session.team_name}
      angle={validation.session.angle}
      title={validation.session.title}
    />
  )
}
