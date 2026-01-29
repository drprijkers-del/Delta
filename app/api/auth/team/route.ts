import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const TEAM_COOKIE_NAME = 'mood_team_session'
const DEVICE_COOKIE_NAME = 'mood_device_id'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateDeviceId(): string {
  return crypto.randomUUID()
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('k')
  const slug = searchParams.get('slug')

  if (!token || !slug) {
    return NextResponse.json({ error: 'Missing token or slug' }, { status: 400 })
  }

  const supabase = await createClient()
  const tokenHash = hashToken(token)

  // Validate token
  const { data: teamData, error } = await supabase
    .rpc('validate_invite_token', { p_token_hash: tokenHash })

  if (error || !teamData || teamData.length === 0) {
    return NextResponse.redirect(new URL(`/t/${slug}?error=invalid`, request.url))
  }

  const team = teamData[0]

  // Verify slug matches
  if (team.team_slug !== slug) {
    return NextResponse.redirect(new URL(`/t/${slug}?error=invalid`, request.url))
  }

  // Get or create device ID
  const cookieStore = await cookies()
  let deviceId = cookieStore.get(DEVICE_COOKIE_NAME)?.value
  if (!deviceId) {
    deviceId = generateDeviceId()
  }

  // Create session data
  const session = JSON.stringify({
    teamId: team.team_id,
    teamSlug: team.team_slug,
    teamName: team.team_name,
    deviceId,
  })

  // Create response with redirect
  const response = NextResponse.redirect(new URL(`/t/${slug}`, request.url))

  // Set cookies on response
  response.cookies.set(DEVICE_COOKIE_NAME, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  response.cookies.set(TEAM_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return response
}
