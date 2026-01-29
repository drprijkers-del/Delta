import { requireAdmin } from '@/lib/auth/admin'
import { AdminHeader } from '@/components/admin/header'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect all /app routes
  await requireAdmin()

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminHeader />
      {children}
    </div>
  )
}
