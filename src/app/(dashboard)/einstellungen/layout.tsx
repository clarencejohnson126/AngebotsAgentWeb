'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Building2, Tags, FileText } from 'lucide-react'

const settingsNav = [
  {
    title: 'Firmenprofil',
    href: '/einstellungen/firma',
    icon: Building2,
  },
  {
    title: 'Preisbibliothek',
    href: '/einstellungen/preise',
    icon: Tags,
  },
  {
    title: 'Vorlagen',
    href: '/einstellungen/vorlagen',
    icon: FileText,
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex gap-8">
      {/* Settings Navigation */}
      <aside className="w-64 shrink-0">
        <nav className="space-y-1">
          {settingsNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
