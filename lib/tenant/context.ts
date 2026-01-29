import { cookies } from 'next/headers'
import crypto from 'crypto'

const TEAM_COOKIE_NAME = 'mood_team_session'
const DEVICE_COOKIE_NAME = 'mood_device_id'

export interface TeamContext {
  teamId: string
  teamSlug: string
  teamName: string
  deviceId: string
  participantId?: string
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateDeviceId(): string {
  return crypto.randomUUID()
}

export async function getTeamContext(): Promise<TeamContext | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(TEAM_COOKIE_NAME)?.value

  if (!sessionCookie) return null

  try {
    return JSON.parse(sessionCookie) as TeamContext
  } catch {
    return null
  }
}

export async function getDeviceId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(DEVICE_COOKIE_NAME)?.value || null
}
