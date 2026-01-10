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
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error('Google Registrierung fehlgeschlagen')
        setGoogleLoading(false)
      }
    } catch (error) {
      toast.error('Google Registrierung fehlgeschlagen')
      setGoogleLoading(false)
    }
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
        console.error('Error details:', JSON.stringify(companyError, null, 2))
        toast.error(`Firma konnte nicht erstellt werden: ${companyError.message}`)
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
              <Button type="submit" className="w-full" disabled={googleLoading}>
                {common('next')}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">oder</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {common('loading')}
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Mit Google registrieren
                  </>
                )}
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
