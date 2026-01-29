import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/super-admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireSuperAdmin()
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, role, created_at, last_login_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireSuperAdmin()

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Prevent deleting super admin
    const { data: user } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .single()

    if (user?.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
