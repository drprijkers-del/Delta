import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface SuperAdminSession {
  userId: string
  email: string
  role: 'super_admin'
  exp: number
}

export async function getSuperAdminSession(): Promise<SuperAdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('super_admin_session')?.value

  if (!sessionCookie) return null

  try {
    const session = JSON.parse(sessionCookie) as SuperAdminSession

    // Check expiration
    if (session.exp < Date.now()) {
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function requireSuperAdmin(): Promise<SuperAdminSession> {
  const session = await getSuperAdminSession()

  if (!session) {
    redirect('/super-admin/login')
  }

  return session
}

export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSuperAdminSession()
  return session !== null
}
