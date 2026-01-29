import { SuperAdminLoginForm } from '@/components/super-admin/login-form'
import { getSuperAdminSession } from '@/lib/auth/super-admin'
import { redirect } from 'next/navigation'

export default async function SuperAdminLoginPage() {
  // Redirect if already logged in
  const session = await getSuperAdminSession()
  if (session) {
    redirect('/super-admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white">Super Admin</h1>
          <p className="text-stone-400 text-sm mt-2">Heisenberg Labs Control Panel</p>
        </div>
        <SuperAdminLoginForm />
      </div>
    </div>
  )
}
