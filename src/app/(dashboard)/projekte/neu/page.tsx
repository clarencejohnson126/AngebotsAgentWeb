'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NewProjectPage() {
  const t = useTranslations('project')
  const common = useTranslations('common')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [projectNumber, setProjectNumber] = useState('')
  const [description, setDescription] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientContact, setClientContact] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [siteStreet, setSiteStreet] = useState('')
  const [siteZipCode, setSiteZipCode] = useState('')
  const [siteCity, setSiteCity] = useState('')
  const [submissionDeadline, setSubmissionDeadline] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Get user and company
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Nicht angemeldet')
        return
      }

      const { data: membership } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        toast.error('Keine Firma gefunden')
        return
      }

      // Create project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          company_id: membership.company_id,
          title,
          project_number: projectNumber || null,
          description: description || null,
          client_name: clientName,
          client_contact: clientContact || null,
          client_email: clientEmail || null,
          client_phone: clientPhone || null,
          site_street: siteStreet || null,
          site_zip_code: siteZipCode || null,
          site_city: siteCity || null,
          submission_deadline: submissionDeadline || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        toast.error('Projekt konnte nicht erstellt werden')
        return
      }

      toast.success('Projekt erfolgreich erstellt')
      router.push(`/projekte/${project.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projekte">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('newProject')}</h1>
          <p className="text-muted-foreground">
            Erstellen Sie ein neues Projekt für eine Ausschreibung
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>Projektinformationen</CardTitle>
            <CardDescription>
              Grundlegende Informationen zum Bauvorhaben
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">{t('projectName')} *</Label>
                <Input
                  id="title"
                  placeholder="z.B. Bürogebäude Musterstraße"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectNumber">{t('projectNumber')}</Label>
                <Input
                  id="projectNumber"
                  placeholder="z.B. 2024-001"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{common('description')}</Label>
              <Textarea
                id="description"
                placeholder="Kurze Beschreibung des Projekts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">{t('deadline')}</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Auftraggeber</CardTitle>
            <CardDescription>
              Informationen zum Generalunternehmer oder Bauherrn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">{t('clientName')} *</Label>
                <Input
                  id="clientName"
                  placeholder="z.B. Baufirma Müller GmbH"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientContact">{t('clientContact')}</Label>
                <Input
                  id="clientContact"
                  placeholder="Ansprechpartner"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">{t('clientEmail')}</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="email@firma.de"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">{t('clientPhone')}</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  placeholder="+49 123 456789"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Location */}
        <Card>
          <CardHeader>
            <CardTitle>Bauvorhaben-Adresse</CardTitle>
            <CardDescription>
              Standort des Bauprojekts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteStreet">{t('street')}</Label>
              <Input
                id="siteStreet"
                placeholder="Straße und Hausnummer"
                value={siteStreet}
                onChange={(e) => setSiteStreet(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteZipCode">{t('zipCode')}</Label>
                <Input
                  id="siteZipCode"
                  placeholder="PLZ"
                  value={siteZipCode}
                  onChange={(e) => setSiteZipCode(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteCity">{t('city')}</Label>
                <Input
                  id="siteCity"
                  placeholder="Ort"
                  value={siteCity}
                  onChange={(e) => setSiteCity(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/projekte">
            <Button type="button" variant="outline" disabled={loading}>
              {common('cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {common('loading')}
              </>
            ) : (
              t('newProject')
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
