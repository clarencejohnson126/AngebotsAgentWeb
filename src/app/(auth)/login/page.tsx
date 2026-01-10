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
import { FileText, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
  const t = useTranslations('auth')
  const common = useTranslations('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/projekte'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setIsDemo(isDemoMode())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // In demo mode, just redirect
      if (isDemo) {
        toast.success(t('welcomeBack'))
        router.push(redirectTo)
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
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      toast.error(t('loginError'))
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setLoading(true)
    toast.success('Willkommen im Demo-Modus!')
    router.push(redirectTo)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <Link href="/" className="mx-auto mb-4 flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">{common('appName')}</span>
        </Link>
        <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
        <CardDescription>
          Geben Sie Ihre E-Mail und Passwort ein
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

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {isDemo ? (
            <div className="space-y-4">
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
            </div>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
        {!isDemo && (
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {common('loading')}
                </>
              ) : (
                t('login')
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/registrieren" className="text-primary hover:underline">
                {t('register')}
              </Link>
            </p>
          </CardFooter>
        )}
      </form>
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
