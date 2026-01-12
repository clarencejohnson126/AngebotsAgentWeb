'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient, isDemoMode } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Loader2, Info, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

// Google icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function LoginForm() {
  const t = useTranslations('auth')
  const common = useTranslations('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirect') || '/projekte'

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  // Register state
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Check for existing session and sign out
  useEffect(() => {
    setIsDemo(isDemoMode())

    // Auto sign out any existing session so user always sees login form
    const signOutExisting = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    signOutExisting()
  }, [])

  const handleGoogleLogin = async () => {
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
        toast.error('Google-Anmeldung fehlgeschlagen')
        setGoogleLoading(false)
      }
    } catch (error) {
      toast.error('Google-Anmeldung fehlgeschlagen')
      setGoogleLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // In demo mode, just redirect
      if (isDemo) {
        toast.success(t('welcomeBack'))
        router.push('/projekte')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(t('loginError'))
        return
      }

      toast.success(t('welcomeBack'))
      router.push('/projekte')
      router.refresh()
    } catch (error) {
      toast.error(t('loginError'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerPassword.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein')
      return
    }

    if (registerPassword !== registerPasswordConfirm) {
      toast.error('Passwoerter stimmen nicht ueberein')
      return
    }

    setRegisterLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Diese E-Mail ist bereits registriert')
        } else {
          toast.error('Registrierung fehlgeschlagen')
        }
        return
      }

      // Show confirmation message
      setShowConfirmation(true)
    } catch (error) {
      toast.error('Registrierung fehlgeschlagen')
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setLoading(true)
    toast.success('Willkommen im Demo-Modus!')
    router.push('/projekte')
  }

  // Show email confirmation message after successful registration
  if (showConfirmation) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">{common('appName')}</span>
          </Link>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">E-Mail bestaetigen</CardTitle>
          <CardDescription>
            Wir haben Ihnen eine E-Mail an <strong>{registerEmail}</strong> gesendet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowConfirmation(false)}
          >
            Zurueck zur Anmeldung
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <Link href="/" className="mx-auto mb-4 flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">{common('appName')}</span>
        </Link>
        <CardTitle className="text-2xl">Willkommen</CardTitle>
        <CardDescription>
          Melden Sie sich an oder erstellen Sie ein Konto
        </CardDescription>
      </CardHeader>

      {isDemo && (
        <div className="px-6">
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Demo-Modus aktiv:</strong> Klicken Sie auf &quot;Demo starten&quot; um die App mit Beispieldaten zu erkunden.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {isDemo ? (
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Demo-Benutzer:</strong><br />
              Klaus Mustermann<br />
              Mustermann Trockenbau GmbH
            </p>
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Laden...
              </>
            ) : (
              'Demo starten'
            )}
          </Button>
        </CardContent>
      ) : (
        <Tabs defaultValue="login" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="register">Registrieren</TabsTrigger>
            </TabsList>
          </div>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@firma.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Link
                      href="/passwort-vergessen"
                      className="text-sm text-primary hover:underline"
                    >
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {common('loading')}
                    </>
                  ) : (
                    t('login')
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">oder</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verbinden...
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="mr-2" />
                      Mit Google anmelden
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-Mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="name@firma.de"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    disabled={registerLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Passwort</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mindestens 8 Zeichen"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    disabled={registerLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password-confirm">Passwort bestaetigen</Label>
                  <Input
                    id="register-password-confirm"
                    type="password"
                    placeholder="Passwort wiederholen"
                    value={registerPasswordConfirm}
                    onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                    required
                    disabled={registerLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={registerLoading || googleLoading}>
                  {registerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrieren...
                    </>
                  ) : (
                    'Konto erstellen'
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">oder</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={registerLoading || googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verbinden...
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="mr-2" />
                      Mit Google registrieren
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Mit der Registrierung akzeptieren Sie unsere{' '}
                  <Link href="/datenschutz" className="text-primary hover:underline">
                    Datenschutzerklaerung
                  </Link>
                </p>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
