import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth/password'

// Email aliases: heisenberg maps to dennis
const EMAIL_ALIASES: Record<string, string> = {
  'heisenberg@pinkpollos.com': 'dennis@pinkpollos.com',
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Resolve email alias
    const resolvedEmail = EMAIL_ALIASES[email.toLowerCase()] || email.toLowerCase()

    const supabase = await createAdminClient()

    // Find super admin user
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, role')
      .eq('email', resolvedEmail)
      .eq('role', 'super_admin')
      .single()

    if (error || !adminUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!adminUser.password_hash) {
      return NextResponse.json(
        { error: 'Password not set for this account' },
        { status: 401 }
      )
    }

    // Verify password
    const validPassword = await verifyPassword(password, adminUser.password_hash)

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session data
    const sessionData = {
      userId: adminUser.id,
      email: adminUser.email,
      role: 'super_admin' as const,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('super_admin_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminUser.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Super admin login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
