import { getBacklogItems, getReleaseNotes } from '@/domain/backlog/actions'
import { BacklogContent } from '@/components/feedback/backlog-content'

export const metadata = {
  title: 'Delta Backlog',
  description: 'See what we\'re considering, exploring, and deciding based on your feedback.',
}

export default async function BacklogPage() {
  const [backlogItems, releaseNotes] = await Promise.all([
    getBacklogItems('delta'),
    getReleaseNotes('delta'),
  ])

  return <BacklogContent backlogItems={backlogItems} releaseNotes={releaseNotes} />
}
