'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatNumber } from '@/lib/utils'
import { TakeoffSource, UnitType, TakeoffResult } from '@/types/database'
import { Plus, Ruler, FileText, Edit, Trash2, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import useSWR, { mutate } from 'swr'

interface TakeoffTabProps {
  projectId: string
}

const sourceIcons: Record<TakeoffSource, React.ReactNode> = {
  extracted: <FileText className="h-4 w-4 text-blue-500" />,
  measured: <Ruler className="h-4 w-4 text-green-500" />,
  manual: <Edit className="h-4 w-4 text-orange-500" />,
  imported: <FileText className="h-4 w-4 text-purple-500" />,
}

export function TakeoffTab({ projectId }: TakeoffTabProps) {
  const t = useTranslations('takeoff')
  const tUnits = useTranslations('units')
  const common = useTranslations('common')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state for new measurement
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<UnitType>('m2')
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  // Fetch takeoff results
  const { data: takeoffs, isLoading } = useSWR(
    `takeoffs-${projectId}`,
    async () => {
      const { data, error } = await supabase
        .from('takeoff_results')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  )

  const units: { value: UnitType; label: string }[] = [
    { value: 'm', label: tUnits('m') },
    { value: 'm2', label: tUnits('m2') },
    { value: 'm3', label: tUnits('m3') },
    { value: 'stk', label: tUnits('stk') },
    { value: 'kg', label: tUnits('kg') },
    { value: 'psch', label: tUnits('psch') },
    { value: 'h', label: tUnits('h') },
  ]

  const sourceLabels: Record<TakeoffSource, string> = {
    extracted: t('source.extracted'),
    measured: t('source.measured'),
    manual: t('source.manual'),
    imported: t('source.imported'),
  }

  const handleAddManual = async () => {
    if (!description || !quantity) {
      toast.error('Bitte alle Felder ausfüllen')
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Nicht angemeldet')
        return
      }

      const { error } = await supabase
        .from('takeoff_results')
        .insert({
          project_id: projectId,
          description,
          quantity: parseFloat(quantity.replace(',', '.')),
          unit,
          source: 'manual',
          notes: notes || null,
          created_by: user.id,
        })

      if (error) {
        console.error('Error adding takeoff:', error)
        toast.error('Fehler beim Speichern')
        return
      }

      toast.success('Menge hinzugefügt')
      setDialogOpen(false)
      resetForm()
      mutate(`takeoffs-${projectId}`)
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Menge wirklich löschen?')) return

    try {
      await supabase.from('takeoff_results').delete().eq('id', id)
      mutate(`takeoffs-${projectId}`)
      toast.success('Gelöscht')
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  const handleVerify = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase
        .from('takeoff_results')
        .update({
          is_verified: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', id)

      mutate(`takeoffs-${projectId}`)
      toast.success('Verifiziert')
    } catch (error) {
      toast.error('Fehler')
    }
  }

  const resetForm = () => {
    setDescription('')
    setQuantity('')
    setUnit('m2')
    setNotes('')
  }

  // Calculate totals by unit
  const totals = takeoffs?.reduce((acc: Record<string, number>, t: TakeoffResult) => {
    const key = t.unit
    acc[key] = (acc[key] || 0) + t.quantity
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">
            Erfasste Mengen aus Plänen und Leistungsverzeichnissen
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('newMeasurement')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('newMeasurement')}</DialogTitle>
              <DialogDescription>
                Fügen Sie eine manuelle Mengenposition hinzu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">{t('label')}</Label>
                <Input
                  id="description"
                  placeholder="z.B. Trockenbau Wände EG"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{common('quantity')}</Label>
                  <Input
                    id="quantity"
                    type="text"
                    placeholder="0,00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">{common('unit')}</Label>
                  <Select value={unit} onValueChange={(v) => setUnit(v as UnitType)}>
                    <SelectTrigger>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{common('notes')}</Label>
                <Input
                  id="notes"
                  placeholder="Optionale Anmerkungen..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {common('cancel')}
              </Button>
              <Button onClick={handleAddManual} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {common('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {Object.keys(totals).length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(totals).map(([unitKey, total]) => (
            <Card key={unitKey}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatNumber(total as number)} {tUnits(unitKey as any)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('total')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Takeoff List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('measurements')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !takeoffs || takeoffs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Ruler className="h-10 w-10" />
              <p className="mt-2">{t('noMeasurements')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {takeoffs.map((takeoff: TakeoffResult) => (
                <div
                  key={takeoff.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    {sourceIcons[takeoff.source]}
                    <div>
                      <p className="font-medium">{takeoff.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{sourceLabels[takeoff.source]}</span>
                        {takeoff.position_number && (
                          <>
                            <span>•</span>
                            <span>Pos. {takeoff.position_number}</span>
                          </>
                        )}
                        {takeoff.notes && (
                          <>
                            <span>•</span>
                            <span>{takeoff.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatNumber(takeoff.quantity)} {tUnits(takeoff.unit as any)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {takeoff.is_verified ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Geprüft
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(takeoff.id)}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(takeoff.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
