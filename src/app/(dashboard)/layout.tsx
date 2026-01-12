import { redirect } from 'next/navigation'
import { getUser, getUserCompany } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const companyData = await getUserCompany()

  if (!companyData?.company) {
    // User has no company - redirect to company setup
    redirect('/firma-einrichten')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <DashboardNav company={companyData.company} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <DashboardHeader user={user} company={companyData.company} />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
