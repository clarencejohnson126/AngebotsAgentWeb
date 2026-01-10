'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Company } from '@/types/database'
import {
  FileText,
  FolderKanban,
  Settings,
  Building2,
  Coins,
  LayoutTemplate,
} from 'lucide-react'

interface DashboardNavProps {
  company: Company
}

export function DashboardNav({ company }: DashboardNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tCompany = useTranslations('company')

  const navItems = [
    {
      title: t('projects'),
      href: '/projekte',
      icon: FolderKanban,
    },
    {
      title: t('settings'),
      href: '/einstellungen',
      icon: Settings,
      children: [
        {
          title: t('company'),
          href: '/einstellungen/firma',
          icon: Building2,
        },
        {
          title: t('priceLibrary'),
          href: '/einstellungen/preise',
          icon: Coins,
        },
        {
          title: t('templates'),
          href: '/einstellungen/vorlagen',
          icon: LayoutTemplate,
        },
      ],
    },
  ]

  const tradeLabels: Record<string, string> = {
    trockenbau: tCompany('trades.trockenbau'),
    estrich: tCompany('trades.estrich'),
    abdichtung: tCompany('trades.abdichtung'),
    bodenleger: tCompany('trades.bodenleger'),
    maler: tCompany('trades.maler'),
    fliesen: tCompany('trades.fliesen'),
    sonstige: tCompany('trades.sonstige'),
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/projekte" className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">AngebotsAgent</span>
        </Link>
      </div>

      {/* Company Info */}
      <div className="border-b px-6 py-4">
        <p className="font-medium truncate">{company.name}</p>
        <p className="text-sm text-muted-foreground">
          {tradeLabels[company.trade] || company.trade}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          const Icon = item.icon

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>

              {/* Sub-items */}
              {item.children && isActive && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href
                    const ChildIcon = child.icon

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          isChildActive
                            ? 'bg-muted font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <ChildIcon className="h-4 w-4" />
                        {child.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">
          AngebotsAgent MVP v0.1.0
        </p>
      </div>
    </aside>
  )
}
