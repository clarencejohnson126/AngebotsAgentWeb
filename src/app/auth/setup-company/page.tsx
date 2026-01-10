'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TradeType } from '@/types/database'

export default function SetupCompanyPage() {
  const tCompany = useTranslations('company')
  const common = useTranslations('common')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState('')
  const [trade, setTrade] = useState<TradeType>('trockenbau')

  const trades: { value: TradeType; label: string }[] = [
    { value: 'trockenbau', label: tCompany('trades.trockenbau') },
    { value: 'estrich', label: tCompany('trades.estrich') },
    { value: 'abdichtung', label: tCompany('trades.abdichtung') },
    { value: 'bodenleger', label: tCompany('trades.bodenleger') },
    { value: 'maler', label: tCompany('trades.maler') },
    { value: 'fliesen', label: tCompany('trades.fliesen') },
    { value: 'sonstige', label: tCompany('trades.sonstige') },
  ]

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check if already has company
      const { data: membership } = await supabase
        .from('company_members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (membership) {
        // Already has company, redirect to dashboard
        router.push('/projekte')
        return
      }

      setUserId(user.id)
      setCheckingAuth(false)
    }

    checkUser()
  }, [router])

  const handleSetupCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          trade,
          created_by: userId,
        })
        .select()
        .single()

      if (companyError) {
        console.error('Company creation error:', companyError)
        console.error('Error details:', JSON.stringify(companyError, null, 2))
        toast.error(`Firma konnte nicht erstellt werden: ${companyError.message}`)
        return
      }

      // 2. Create company membership (owner)
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: userId,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        })

      if (memberError) {
        console.error('Membership creation error:', memberError)
        toast.error('Mitgliedschaft konnte nicht erstellt werden')
        return
      }

      toast.success('Firma erfolgreich eingerichtet!')
      router.push('/projekte')
      router.refresh()
    } catch (error) {
      console.error('Setup error:', error)
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">{common('appName')}</span>
          </Link>
          <CardTitle className="text-2xl">Firma einrichten</CardTitle>
          <CardDescription>
            Willkommen! Bitte richten Sie Ihre Firma ein, um fortzufahren.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSetupCompany}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">{tCompany('companyName')}</Label>
              <Input
                id="companyName"
                placeholder="z.B. Mustermann Trockenbau GmbH"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trade">{tCompany('trade')}</Label>
              <Select
                value={trade}
                onValueChange={(value) => setTrade(value as TradeType)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gewerk auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {trades.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {common('loading')}
                </>
              ) : (
                'Firma einrichten'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
