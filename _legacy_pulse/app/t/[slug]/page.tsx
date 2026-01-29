import { redirect } from 'next/navigation'
import { getTeamContext } from '@/lib/tenant/context'
import { hasCheckedInToday } from '@/domain/moods/actions'
import { TeamCheckin } from '@/components/team/team-checkin'
import { AlreadyCheckedIn } from '@/components/team/already-checked-in'
import { InvalidLink } from '@/components/team/invalid-link'

interface TeamPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ k?: string; error?: string }>
}

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
  const { slug } = await params
  const { k: token, error } = await searchParams

  // If token is provided, redirect to API route to set cookies
  if (token) {
    redirect(`/api/auth/team?slug=${slug}&k=${token}`)
  }

  // Show error if redirected with error
  if (error === 'invalid') {
    return <InvalidLink message="Deze link is niet geldig of verlopen." />
  }

  // Get team context from cookie
  const context = await getTeamContext()

  if (!context || context.teamSlug !== slug) {
    return <InvalidLink message="Je hebt geen toegang tot dit team. Gebruik de uitnodigingslink." />
  }

  // Check if already checked in today
  const alreadyCheckedIn = await hasCheckedInToday()

  if (alreadyCheckedIn) {
    return <AlreadyCheckedIn teamName={context.teamName} />
  }

  return <TeamCheckin teamName={context.teamName} />
}
