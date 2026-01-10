'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatNumber, calculateVAT, generateOfferNumber } from '@/lib/utils'
import { UnitType, RiskSeverity, RiskCategory, OfferLineItem, RiskFlag } from '@/types/database'
import {
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
  Trash2,
  GripVertical,
  Calculator,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import useSWR, { mutate } from 'swr'

interface OfferTabProps {
  projectId: string
}

const severityColors: Record<RiskSeverity, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export function OfferTab({ projectId }: OfferTabProps) {
  const t = useTranslations('offer')
  const tRisk = useTranslations('riskFlags')
  const tUnits = useTranslations('units')
  const common = useTranslations('common')

  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Fetch offer draft
  const { data: offerDraft, isLoading: loadingOffer } = useSWR(
    `offer-draft-${projectId}`,
    async () => {
      const { data, error } = await supabase
        .from('offer_drafts')
        .select('*, offer_line_items(*)')
        .eq('project_id', projectId)
        .eq('is_current', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  )

  // Fetch risk flags
  const { data: riskFlags, isLoading: loadingRisks } = useSWR(
    `risk-flags-${projectId}`,
    async () => {
      const { data, error } = await supabase
        .from('risk_flags')
        .select('*')
        .eq('project_id', projectId)
        .order('severity', { ascending: false })

      if (error) throw error
      return data
    }
  )

  // Fetch extracted data from documents
  const { data: extractedDocuments } = useSWR(
    `extracted-docs-${projectId}`,
    async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'extracted')

      if (error) throw error
      return data
    }
  )

  // Fetch takeoff results (from area extraction)
  const { data: takeoffResults } = useSWR(
    `takeoffs-for-offer-${projectId}`,
    async () => {
      const { data, error } = await supabase
        .from('takeoff_results')
        .select('*')
        .eq('project_id', projectId)
        .order('position_number', { ascending: true })

      if (error) throw error
      return data
    }
  )

  const createNewOffer = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('offer_drafts')
        .insert({
          project_id: projectId,
          title: 'Angebot',
          offer_number: generateOfferNumber(),
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      mutate(`offer-draft-${projectId}`)
      toast.success('Angebotsentwurf erstellt')
    } catch (error) {
      toast.error('Fehler beim Erstellen')
    } finally {
      setSaving(false)
    }
  }

  // Generate offer from extracted data
  const generateFromExtraction = async () => {
    if (!offerDraft) {
      toast.error('Bitte zuerst ein Angebot erstellen')
      return
    }

    setSaving(true)
    try {
      const itemsToAdd: any[] = []
      let posCounter = 1

      // Add items from takeoff results (area extraction)
      if (takeoffResults && takeoffResults.length > 0) {
        for (const takeoff of takeoffResults) {
          itemsToAdd.push({
            offer_draft_id: offerDraft.id,
            position_number: takeoff.position_number || `${String(posCounter).padStart(2, '0')}.001`,
            sort_order: posCounter - 1,
            title: takeoff.description,
            description: takeoff.notes || '',
            quantity: takeoff.quantity,
            unit: takeoff.unit,
            unit_price: 0, // User needs to fill in prices
            source_document_id: takeoff.document_id,
            source_reference: takeoff.position_number,
          })
          posCounter++
        }
      }

      // Add items from LV extractions stored in document extraction_summary
      if (extractedDocuments && extractedDocuments.length > 0) {
        for (const doc of extractedDocuments) {
          const summary = doc.extraction_summary as any
          if (summary?.type === 'lv_extraction' && summary?.positions_found > 0) {
            // LV positions are stored differently - we'll add a placeholder
            // In production, these would come from extracted_data table
            toast.info(`${doc.name}: ${summary.positions_found} LV-Positionen gefunden`)
          }
        }
      }

      if (itemsToAdd.length === 0) {
        toast.error('Keine extrahierten Daten gefunden. Bitte zuerst Dokumente extrahieren.')
        return
      }

      // Delete existing items first
      await supabase
        .from('offer_line_items')
        .delete()
        .eq('offer_draft_id', offerDraft.id)

      // Insert new items
      const { error } = await supabase
        .from('offer_line_items')
        .insert(itemsToAdd)

      if (error) throw error

      mutate(`offer-draft-${projectId}`)
      toast.success(`${itemsToAdd.length} Positionen aus Extraktion übernommen`)
    } catch (error) {
      console.error('Error generating from extraction:', error)
      toast.error('Fehler bei der Übernahme')
    } finally {
      setSaving(false)
    }
  }

  const addLineItem = async () => {
    if (!offerDraft) return

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const existingItems = offerDraft.offer_line_items?.length || 0
      const positionNumber = `${(existingItems + 1).toString().padStart(2, '0')}.001`

      await supabase
        .from('offer_line_items')
        .insert({
          offer_draft_id: offerDraft.id,
          position_number: positionNumber,
          sort_order: existingItems,
          title: 'Neue Position',
          quantity: 0,
          unit: 'm2',
          unit_price: 0,
        })

      mutate(`offer-draft-${projectId}`)
    } catch (error) {
      toast.error('Fehler beim Hinzufügen')
    }
  }

  const updateLineItem = async (id: string, updates: Record<string, any>) => {
    try {
      await supabase
        .from('offer_line_items')
        .update(updates)
        .eq('id', id)

      mutate(`offer-draft-${projectId}`)
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  const deleteLineItem = async (id: string) => {
    if (!confirm('Position löschen?')) return

    try {
      await supabase.from('offer_line_items').delete().eq('id', id)
      mutate(`offer-draft-${projectId}`)
      toast.success('Position gelöscht')
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  const acknowledgeRisk = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase
        .from('risk_flags')
        .update({
          is_acknowledged: true,
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', id)

      mutate(`risk-flags-${projectId}`)
      toast.success('Zur Kenntnis genommen')
    } catch (error) {
      toast.error('Fehler')
    }
  }

  const resolveRisk = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase
        .from('risk_flags')
        .update({
          is_resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)

      mutate(`risk-flags-${projectId}`)
      toast.success('Risiko erledigt')
    } catch (error) {
      toast.error('Fehler')
    }
  }

  const units: { value: UnitType; label: string }[] = [
    { value: 'm', label: tUnits('m') },
    { value: 'm2', label: tUnits('m2') },
    { value: 'm3', label: tUnits('m3') },
    { value: 'stk', label: tUnits('stk') },
    { value: 'kg', label: tUnits('kg') },
    { value: 'psch', label: tUnits('psch') },
  ]

  const severityLabels: Record<RiskSeverity, string> = {
    low: tRisk('severities.low'),
    medium: tRisk('severities.medium'),
    high: tRisk('severities.high'),
    critical: tRisk('severities.critical'),
  }

  const categoryLabels: Record<RiskCategory, string> = {
    mengenabweichung: tRisk('categories.mengenabweichung'),
    leistungsaenderung: tRisk('categories.leistungsaenderung'),
    bauablaufstoerung: tRisk('categories.bauablaufstoerung'),
    mangelhafte_planung: tRisk('categories.mangelhafte_planung'),
    unklare_abgrenzung: tRisk('categories.unklare_abgrenzung'),
    fehlende_position: tRisk('categories.fehlende_position'),
    normabweichung: tRisk('categories.normabweichung'),
    sonstige: tRisk('categories.sonstige'),
  }

  // Calculate totals
  const lineItems = offerDraft?.offer_line_items || []
  const subtotal = lineItems.reduce((sum: number, item: OfferLineItem) => sum + (item.quantity * item.unit_price), 0)
  const { vat, gross } = calculateVAT(subtotal)

  const unresolvedRisks = riskFlags?.filter((r: RiskFlag) => !r.is_resolved) || []

  return (
    <Tabs defaultValue="items" className="space-y-4">
      <TabsList>
        <TabsTrigger value="items" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          {t('lineItems')}
        </TabsTrigger>
        <TabsTrigger value="risks" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          {tRisk('title')}
          {unresolvedRisks.length > 0 && (
            <Badge variant="warning">{unresolvedRisks.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Line Items Tab */}
      <TabsContent value="items" className="space-y-4">
        {loadingOffer ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !offerDraft ? (
          <Card className="flex flex-col items-center justify-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Kein Angebot vorhanden</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Erstellen Sie einen Angebotsentwurf für dieses Projekt
            </p>
            <Button className="mt-4" onClick={createNewOffer} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('newOffer')}
            </Button>
          </Card>
        ) : (
          <>
            {/* Offer Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{offerDraft.title}</CardTitle>
                    <CardDescription>
                      {t('offerNumber')}: {offerDraft.offer_number} | {t('offerDate')}: {offerDraft.offer_date}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={generateFromExtraction}
                      variant="outline"
                      className="gap-2"
                      disabled={saving || (!takeoffResults?.length && !extractedDocuments?.length)}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                      Aus Extraktion
                    </Button>
                    <Button onClick={addLineItem} className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('addItem')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Line Items */}
            <Card>
              <CardContent className="pt-6">
                {lineItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Positionen vorhanden
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                      <div className="col-span-1">Pos.</div>
                      <div className="col-span-4">Beschreibung</div>
                      <div className="col-span-2 text-right">Menge</div>
                      <div className="col-span-1">Einheit</div>
                      <div className="col-span-2 text-right">EP (€)</div>
                      <div className="col-span-1 text-right">GP (€)</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Items */}
                    {lineItems.map((item: OfferLineItem) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1 flex items-center gap-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <span className="text-sm">{item.position_number}</span>
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={item.title}
                            onChange={(e) => updateLineItem(item.id, { title: e.target.value })}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                            className="h-8 text-right"
                          />
                        </div>
                        <div className="col-span-1">
                          <Select
                            value={item.unit}
                            onValueChange={(v) => updateLineItem(item.id, { unit: v })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                  {u.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                            className="h-8 text-right"
                          />
                        </div>
                        <div className="col-span-1 text-right font-medium">
                          {formatNumber(item.quantity * item.unit_price)}
                        </div>
                        <div className="col-span-1 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteLineItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>{t('netTotal')}</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t('vat')} (19%)</span>
                      <span>{formatCurrency(vat)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>{t('grossTotal')}</span>
                      <span>{formatCurrency(gross)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>

      {/* Risk Flags Tab */}
      <TabsContent value="risks" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{tRisk('title')}</CardTitle>
            <CardDescription>
              Erkannte Risiken und potenzielle Nachträge
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRisks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !riskFlags || riskFlags.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="mt-2">{tRisk('noFlags')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {riskFlags.map((flag: RiskFlag) => (
                  <div
                    key={flag.id}
                    className={`rounded-lg border p-4 ${flag.is_resolved ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                          flag.severity === 'critical' ? 'text-red-500' :
                          flag.severity === 'high' ? 'text-orange-500' :
                          flag.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{flag.title}</h4>
                            <Badge className={severityColors[flag.severity]}>
                              {severityLabels[flag.severity]}
                            </Badge>
                            <Badge variant="outline">
                              {categoryLabels[flag.category]}
                            </Badge>
                            {flag.is_resolved && (
                              <Badge variant="success">Erledigt</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {flag.description}
                          </p>
                          {flag.source_reference && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Quelle: {flag.source_reference}
                              {flag.page_reference && ` (${flag.page_reference})`}
                            </p>
                          )}
                          {flag.estimated_impact_min && (
                            <p className="mt-1 text-sm">
                              Geschätzte Auswirkung: {formatCurrency(flag.estimated_impact_min)} - {formatCurrency(flag.estimated_impact_max || 0)}
                            </p>
                          )}
                        </div>
                      </div>
                      {!flag.is_resolved && (
                        <div className="flex gap-2">
                          {!flag.is_acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeRisk(flag.id)}
                            >
                              {tRisk('acknowledge')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveRisk(flag.id)}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {tRisk('resolve')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
