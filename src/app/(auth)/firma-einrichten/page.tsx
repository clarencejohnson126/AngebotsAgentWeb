'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Loader2, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import type { TradeType } from '@/types/database'

const TRADE_OPTIONS: { value: TradeType; label: string }[] = [
  { value: 'trockenbau', label: 'Trockenbau' },
  { value: 'estrich', label: 'Estrich' },
  { value: 'abdichtung', label: 'Abdichtung' },
  { value: 'bodenleger', label: 'Bodenleger' },
  { value: 'maler', label: 'Maler' },
  { value: 'fliesen', label: 'Fliesen' },
  { value: 'sonstige', label: 'Sonstige' },
]

export default function FirmaEinrichtenPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [trade, setTrade] = useState<TradeType>('trockenbau')

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Check if user already has a company
        const { data: membership, error: memberError } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle()  // Use maybeSingle to avoid error when no rows

        console.log('Firma-einrichten check - user:', user.id, 'membership:', membership, 'error:', memberError)

        if (membership?.company_id) {
          // User already has company, redirect to projects
          router.push('/projekte')
          return
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim()) {
      toast.error('Bitte geben Sie einen Firmennamen ein')
      return
    }

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // 1. Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName.trim(),
          trade,
          created_by: user.id,
        })
        .select()
        .single()

      if (companyError) {
        console.error('Company creation error:', companyError)
        toast.error('Firma konnte nicht erstellt werden')
        return
      }

      // 2. Create company membership (owner)
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        })

      if (memberError) {
        console.error('Membership creation error:', memberError)
        // Continue anyway - the company was created
      }

      toast.success('Firma erfolgreich erstellt!')
      router.push('/projekte')
      router.refresh()
    } catch (error) {
      console.error('Error creating company:', error)
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AngebotsAgent</span>
          </Link>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Firma einrichten</CardTitle>
          <CardDescription>
            Richten Sie Ihr Unternehmen ein, um loszulegen.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Firmenname *</Label>
              <Input
                id="companyName"
                placeholder="z.B. Mustermann Trockenbau GmbH"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade">Gewerk *</Label>
              <Select
                value={trade}
                onValueChange={(value) => setTrade(value as TradeType)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gewerk auswaehlen" />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                'Firma erstellen'
              )}
            </Button>

            <div className="pt-4 border-t mt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/login')
                }}
              >
                Mit anderem Konto anmelden
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
