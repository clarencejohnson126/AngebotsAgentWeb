'use client'

import { useState } from 'react'
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

export default function RegisterPage() {
  const t = useTranslations('auth')
  const tCompany = useTranslations('company')
  const common = useTranslations('common')
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2: Company
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

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein')
      return
    }

    if (password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen haben')
      return
    }

    setStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError || !authData.user) {
        toast.error(t('registerError'))
        return
      }

      // 2. Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          trade,
          created_by: authData.user.id,
        })
        .select()
        .single()

      if (companyError) {
        console.error('Company creation error:', companyError)
        toast.error('Firma konnte nicht erstellt werden')
        return
      }

      // 3. Create company membership (owner)
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: authData.user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        })

      if (memberError) {
        console.error('Membership creation error:', memberError)
      }

      toast.success('Registrierung erfolgreich!')
      router.push('/projekte')
      router.refresh()
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(t('registerError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">{common('appName')}</span>
          </Link>
          <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
          <CardDescription>
            Schritt {step} von 2: {step === 1 ? 'Konto erstellen' : 'Firma einrichten'}
          </CardDescription>
        </CardHeader>

        {step === 1 ? (
          <form onSubmit={handleStep1}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@firma.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full">
                {common('next')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('hasAccount')}{' '}
                <Link href="/login" className="text-primary hover:underline">
                  {t('login')}
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
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
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  {common('back')}
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {common('loading')}
                    </>
                  ) : (
                    t('register')
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
