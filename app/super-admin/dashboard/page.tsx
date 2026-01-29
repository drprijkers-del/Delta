import { requireSuperAdmin } from '@/lib/auth/super-admin'
import { SuperAdminDashboard } from '@/components/super-admin/dashboard'
import { createAdminClient } from '@/lib/supabase/server'

interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'scrum_master'
  created_at: string
  last_login_at: string | null
}

async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, role, created_at, last_login_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return []
  }

  return data as AdminUser[]
}

export default async function SuperAdminDashboardPage() {
  await requireSuperAdmin()
  const users = await getAdminUsers()

  return <SuperAdminDashboard users={users} />
}
