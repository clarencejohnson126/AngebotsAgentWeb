'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Company } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { LogOut, Settings, User as UserIcon, Menu } from 'lucide-react'
import { toast } from 'sonner'

interface DashboardHeaderProps {
  user: User
  company: Company
}

export function DashboardHeader({ user, company }: DashboardHeaderProps) {
  const router = useRouter()
  const t = useTranslations('auth')
  const tNav = useTranslations('nav')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Erfolgreich abgemeldet')
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer for desktop */}
      <div className="hidden md:block" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline-block">{user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">{company.name}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/einstellungen/firma')}>
            <UserIcon className="mr-2 h-4 w-4" />
            {tNav('company')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/einstellungen')}>
            <Settings className="mr-2 h-4 w-4" />
            {tNav('settings')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
