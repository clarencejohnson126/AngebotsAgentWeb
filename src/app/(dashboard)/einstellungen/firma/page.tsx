'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save, Building2 } from 'lucide-react'
import type { Company, TradeType } from '@/types/database'

const TRADE_OPTIONS: { value: TradeType; label: string }[] = [
  { value: 'trockenbau', label: 'Trockenbau' },
  { value: 'estrich', label: 'Estrich' },
  { value: 'abdichtung', label: 'Abdichtung' },
  { value: 'bodenleger', label: 'Bodenleger' },
]

export default function CompanySettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    trade: '' as TradeType | '',
    street: '',
    postal_code: '',
    city: '',
    tax_number: '',
    vat_id: '',
    profit_margin: 15,
    overhead_percent: 10,
    risk_percent: 3,
  })

  useEffect(() => {
    async function loadCompany() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Get user's company membership
        const { data: membership } = await supabase
          .from('company_members')
          .select('company_id, role')
          .eq('user_id', user.id)
          .single()

        if (membership) {
          // Load existing company
          const { data: companyData, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', membership.company_id)
            .single()

          if (error) throw error

          if (companyData) {
            setCompany(companyData)
            setFormData({
              name: companyData.name || '',
              trade: companyData.trade || '',
              street: companyData.address?.street || '',
              postal_code: companyData.address?.postal_code || '',
              city: companyData.address?.city || '',
              tax_number: companyData.tax_number || '',
              vat_id: companyData.vat_id || '',
              profit_margin: companyData.default_markups?.profit_margin || 15,
              overhead_percent: companyData.default_markups?.overhead_percent || 10,
              risk_percent: companyData.default_markups?.risk_percent || 3,
            })
          }
        }
      } catch (error) {
        console.error('Error loading company:', error)
        toast.error('Fehler beim Laden der Firmendaten')
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [supabase, router])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Nicht angemeldet')

      const companyPayload = {
        name: formData.name,
        trade: formData.trade || null,
        address: {
          street: formData.street,
          postal_code: formData.postal_code,
          city: formData.city,
        },
        tax_number: formData.tax_number || null,
        vat_id: formData.vat_id || null,
        default_markups: {
          profit_margin: Number(formData.profit_margin),
          overhead_percent: Number(formData.overhead_percent),
          risk_percent: Number(formData.risk_percent),
        },
      }

      if (company) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update(companyPayload)
          .eq('id', company.id)

        if (error) throw error
        toast.success('Firmenprofil aktualisiert')
      } else {
        // Create new company
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert(companyPayload)
          .select()
          .single()

        if (createError) throw createError

        // Create membership
        const { error: memberError } = await supabase
          .from('company_members')
          .insert({
            company_id: newCompany.id,
            user_id: user.id,
            role: 'owner',
          })

        if (memberError) throw memberError

        setCompany(newCompany)
        toast.success('Firma erfolgreich erstellt')
      }
    } catch (error) {
      console.error('Error saving company:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Firmenprofil</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Unternehmensdaten und Standardeinstellungen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Stammdaten
            </CardTitle>
            <CardDescription>
              Grundlegende Informationen zu Ihrem Unternehmen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Firmenname *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Mustermann GmbH"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trade">Gewerk</Label>
                <Select
                  value={formData.trade}
                  onValueChange={(value) => handleChange('trade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gewerk auswählen" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Straße und Hausnummer</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="Musterstraße 123"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postal_code">PLZ</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Musterstadt"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Info */}
        <Card>
          <CardHeader>
            <CardTitle>Steuerliche Angaben</CardTitle>
            <CardDescription>
              Für Rechnungen und offizielle Dokumente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax_number">Steuernummer</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => handleChange('tax_number', e.target.value)}
                  placeholder="123/456/78901"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat_id">USt-IdNr.</Label>
                <Input
                  id="vat_id"
                  value={formData.vat_id}
                  onChange={(e) => handleChange('vat_id', e.target.value)}
                  placeholder="DE123456789"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Markups */}
        <Card>
          <CardHeader>
            <CardTitle>Standard-Aufschläge</CardTitle>
            <CardDescription>
              Diese Werte werden als Voreinstellung für neue Angebote verwendet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="profit_margin">Gewinn (%)</Label>
                <Input
                  id="profit_margin"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.profit_margin}
                  onChange={(e) =>
                    handleChange('profit_margin', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overhead_percent">AGK (%)</Label>
                <Input
                  id="overhead_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.overhead_percent}
                  onChange={(e) =>
                    handleChange('overhead_percent', parseFloat(e.target.value) || 0)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Allgemeine Geschäftskosten
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk_percent">Wagnis (%)</Label>
                <Input
                  id="risk_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.risk_percent}
                  onChange={(e) =>
                    handleChange('risk_percent', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                <strong>Gesamtaufschlag:</strong>{' '}
                {(
                  Number(formData.profit_margin) +
                  Number(formData.overhead_percent) +
                  Number(formData.risk_percent)
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Beispiel: Bei Materialkosten von 1.000 € ergibt sich ein
                Angebotspreis von{' '}
                {(
                  1000 *
                  (1 +
                    (Number(formData.profit_margin) +
                      Number(formData.overhead_percent) +
                      Number(formData.risk_percent)) /
                      100)
                ).toFixed(2)}{' '}
                € (netto)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {company ? 'Speichern' : 'Firma erstellen'}
          </Button>
        </div>
      </form>
    </div>
  )
}
