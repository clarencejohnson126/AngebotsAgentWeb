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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Plus, Pencil, Trash2, Search, Download } from 'lucide-react'
import type { PriceLibraryItem, UnitType, TradeType } from '@/types/database'

const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'm', label: 'm (Meter)' },
  { value: 'm2', label: 'm² (Quadratmeter)' },
  { value: 'm3', label: 'm³ (Kubikmeter)' },
  { value: 'stk', label: 'Stk (Stück)' },
  { value: 'kg', label: 'kg (Kilogramm)' },
  { value: 'psch', label: 'psch (Pauschal)' },
  { value: 'h', label: 'h (Stunde)' },
]

const TRADE_OPTIONS: { value: TradeType; label: string }[] = [
  { value: 'trockenbau', label: 'Trockenbau' },
  { value: 'estrich', label: 'Estrich' },
  { value: 'abdichtung', label: 'Abdichtung' },
  { value: 'bodenleger', label: 'Bodenleger' },
]

interface PriceFormData {
  item_code: string
  name: string
  description: string
  unit: UnitType
  unit_price: number
  category: string
  trade: TradeType | ''
  notes: string
}

const initialFormData: PriceFormData = {
  item_code: '',
  name: '',
  description: '',
  unit: 'm2',
  unit_price: 0,
  category: '',
  trade: '',
  notes: '',
}

export default function PriceLibraryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [prices, setPrices] = useState<PriceLibraryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTrade, setFilterTrade] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PriceFormData>(initialFormData)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get user's company
      const { data: membership } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        toast.error('Bitte erstellen Sie zuerst ein Firmenprofil')
        router.push('/einstellungen/firma')
        return
      }

      setCompanyId(membership.company_id)

      // Load prices
      const { data: priceData, error } = await supabase
        .from('price_library')
        .select('*')
        .eq('company_id', membership.company_id)
        .order('category', { ascending: true })
        .order('item_code', { ascending: true })

      if (error) throw error
      setPrices(priceData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Fehler beim Laden der Preise')
    } finally {
      setLoading(false)
    }
  }

  const filteredPrices = prices.filter((price) => {
    const matchesSearch =
      searchQuery === '' ||
      price.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.item_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.category?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTrade =
      filterTrade === 'all' || price.trade === filterTrade

    return matchesSearch && matchesTrade
  })

  const handleOpenDialog = (price?: PriceLibraryItem) => {
    if (price) {
      setEditingId(price.id)
      setFormData({
        item_code: price.item_code || '',
        name: price.name,
        description: price.description || '',
        unit: price.unit,
        unit_price: price.unit_price,
        category: price.category || '',
        trade: price.trade || '',
        notes: price.notes || '',
      })
    } else {
      setEditingId(null)
      setFormData(initialFormData)
    }
    setDialogOpen(true)
  }

  const handleChange = (field: keyof PriceFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return

    setSaving(true)

    try {
      const payload = {
        company_id: companyId,
        item_code: formData.item_code || null,
        name: formData.name,
        description: formData.description || null,
        unit: formData.unit,
        unit_price: Number(formData.unit_price),
        category: formData.category || null,
        trade: formData.trade || null,
        notes: formData.notes || null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('price_library')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        toast.success('Preis aktualisiert')
      } else {
        const { error } = await supabase
          .from('price_library')
          .insert(payload)

        if (error) throw error
        toast.success('Preis hinzugefügt')
      }

      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving price:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Diesen Preis wirklich löschen?')) return

    try {
      const { error } = await supabase
        .from('price_library')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Preis gelöscht')
      loadData()
    } catch (error) {
      console.error('Error deleting price:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleImportDemo = async () => {
    if (!companyId) return

    const demoPrices = getDemoPrices()

    try {
      const { error } = await supabase
        .from('price_library')
        .insert(demoPrices.map(p => ({ ...p, company_id: companyId })))

      if (error) throw error
      toast.success(`${demoPrices.length} Demo-Preise importiert`)
      loadData()
    } catch (error) {
      console.error('Error importing demo prices:', error)
      toast.error('Fehler beim Import')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Preisbibliothek</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Einheitspreise für Angebote.
          </p>
        </div>
        <div className="flex gap-2">
          {prices.length === 0 && (
            <Button variant="outline" onClick={handleImportDemo}>
              <Download className="mr-2 h-4 w-4" />
              Demo-Preise laden
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Neuer Preis
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? 'Preis bearbeiten' : 'Neuen Preis anlegen'}
                  </DialogTitle>
                  <DialogDescription>
                    Einheitspreis für Ihre Preisbibliothek.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="item_code">Artikelnummer</Label>
                      <Input
                        id="item_code"
                        value={formData.item_code}
                        onChange={(e) => handleChange('item_code', e.target.value)}
                        placeholder="z.B. TB-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategorie</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        placeholder="z.B. Wandbekleidung"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Bezeichnung *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="z.B. GK-Ständerwand W111"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Detaillierte Leistungsbeschreibung (optional)"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="unit">Einheit *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => handleChange('unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit_price">EP (netto) *</Label>
                      <Input
                        id="unit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) =>
                          handleChange('unit_price', parseFloat(e.target.value) || 0)
                        }
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
                          <SelectValue placeholder="Optional" />
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
                    <Label htmlFor="notes">Notizen</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Interne Notizen"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? 'Speichern' : 'Anlegen'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Beschreibung, Nummer oder Kategorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterTrade}
              onValueChange={setFilterTrade}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Gewerk filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Gewerke</SelectItem>
                {TRADE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Price Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPrices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                {prices.length === 0
                  ? 'Keine Preise vorhanden. Erstellen Sie Ihren ersten Preis oder laden Sie Demo-Daten.'
                  : 'Keine Preise gefunden für Ihre Suche.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Nr.</TableHead>
                  <TableHead>Bezeichnung</TableHead>
                  <TableHead className="w-[100px]">Kategorie</TableHead>
                  <TableHead className="w-[80px]">Einheit</TableHead>
                  <TableHead className="w-[100px] text-right">EP (netto)</TableHead>
                  <TableHead className="w-[100px]">Gewerk</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="font-mono text-sm">
                      {price.item_code || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">
                        {price.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {price.category && (
                        <Badge variant="outline">{price.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{price.unit}</TableCell>
                    <TableCell className="text-right font-mono">
                      {price.unit_price.toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      {price.trade && (
                        <Badge variant="secondary">
                          {TRADE_OPTIONS.find(t => t.value === price.trade)?.label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(price)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(price.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {filteredPrices.length} von {prices.length} Preisen
      </p>
    </div>
  )
}

// Demo prices for all 4 trades
function getDemoPrices() {
  return [
    // Trockenbau
    { item_code: 'TB-001', name: 'GK-Ständerwand W111, einfach beplankt, 75mm', unit: 'm2' as UnitType, unit_price: 42.50, category: 'Wände', trade: 'trockenbau' as TradeType },
    { item_code: 'TB-002', name: 'GK-Ständerwand W112, doppelt beplankt, 100mm', unit: 'm2' as UnitType, unit_price: 58.00, category: 'Wände', trade: 'trockenbau' as TradeType },
    { item_code: 'TB-003', name: 'GK-Ständerwand W115, Brand-/Schallschutz F90', unit: 'm2' as UnitType, unit_price: 85.00, category: 'Wände', trade: 'trockenbau' as TradeType },
    { item_code: 'TB-004', name: 'Abhangdecke D112, einlagig beplankt', unit: 'm2' as UnitType, unit_price: 48.00, category: 'Decken', trade: 'trockenbau' as TradeType },
    { item_code: 'TB-005', name: 'Vorsatzschale W625, freistehend', unit: 'm2' as UnitType, unit_price: 38.00, category: 'Vorsatzschalen', trade: 'trockenbau' as TradeType },
    { item_code: 'TB-006', name: 'Revisionsöffnung 300x300mm', unit: 'stk' as UnitType, unit_price: 45.00, category: 'Zubehör', trade: 'trockenbau' as TradeType },

    // Estrich
    { item_code: 'ES-001', name: 'Zementestrich CT-C25-F4, 50mm', unit: 'm2' as UnitType, unit_price: 18.50, category: 'Zementestrich', trade: 'estrich' as TradeType },
    { item_code: 'ES-002', name: 'Zementestrich CT-C25-F4, 65mm', unit: 'm2' as UnitType, unit_price: 22.00, category: 'Zementestrich', trade: 'estrich' as TradeType },
    { item_code: 'ES-003', name: 'Calciumsulfat-Fließestrich CAF-C30-F5, 45mm', unit: 'm2' as UnitType, unit_price: 24.00, category: 'Fließestrich', trade: 'estrich' as TradeType },
    { item_code: 'ES-004', name: 'Trockenestrich-Element 2x12,5mm', unit: 'm2' as UnitType, unit_price: 32.00, category: 'Trockenestrich', trade: 'estrich' as TradeType },
    { item_code: 'ES-005', name: 'Randdämmstreifen PE, h=100mm', unit: 'm' as UnitType, unit_price: 2.80, category: 'Zubehör', trade: 'estrich' as TradeType },
    { item_code: 'ES-006', name: 'Trittschalldämmung EPS-T, 30mm', unit: 'm2' as UnitType, unit_price: 8.50, category: 'Dämmung', trade: 'estrich' as TradeType },

    // Abdichtung
    { item_code: 'AB-001', name: 'KMB-Abdichtung 2-lagig, erdberührte Bauteile', unit: 'm2' as UnitType, unit_price: 28.00, category: 'Kellerabdichtung', trade: 'abdichtung' as TradeType },
    { item_code: 'AB-002', name: 'Bitumenbahn V60S4, schweißbar', unit: 'm2' as UnitType, unit_price: 18.00, category: 'Bitumenbahnen', trade: 'abdichtung' as TradeType },
    { item_code: 'AB-003', name: 'Flüssigkunststoff 2-lagig, Balkone', unit: 'm2' as UnitType, unit_price: 45.00, category: 'Flüssigabdichtung', trade: 'abdichtung' as TradeType },
    { item_code: 'AB-004', name: 'Verbundabdichtung AIV, Nassräume', unit: 'm2' as UnitType, unit_price: 22.00, category: 'Nassraumabdichtung', trade: 'abdichtung' as TradeType },
    { item_code: 'AB-005', name: 'Dichtmanschette DN50', unit: 'stk' as UnitType, unit_price: 12.00, category: 'Zubehör', trade: 'abdichtung' as TradeType },
    { item_code: 'AB-006', name: 'Dichtband innen, selbstklebend', unit: 'm' as UnitType, unit_price: 4.50, category: 'Zubehör', trade: 'abdichtung' as TradeType },

    // Bodenleger
    { item_code: 'BO-001', name: 'Fertigparkett Eiche natur, 15mm', unit: 'm2' as UnitType, unit_price: 65.00, category: 'Parkett', trade: 'bodenleger' as TradeType },
    { item_code: 'BO-002', name: 'Laminat AC5, 8mm, inkl. Unterlage', unit: 'm2' as UnitType, unit_price: 28.00, category: 'Laminat', trade: 'bodenleger' as TradeType },
    { item_code: 'BO-003', name: 'Vinyl-Designbelag zum Klicken, 5mm', unit: 'm2' as UnitType, unit_price: 42.00, category: 'Vinyl', trade: 'bodenleger' as TradeType },
    { item_code: 'BO-004', name: 'Vinyl-Designbelag zum Kleben, 2,5mm', unit: 'm2' as UnitType, unit_price: 38.00, category: 'Vinyl', trade: 'bodenleger' as TradeType },
    { item_code: 'BO-005', name: 'Sockelleiste MDF 60mm, weiß lackiert', unit: 'm' as UnitType, unit_price: 8.50, category: 'Sockelleisten', trade: 'bodenleger' as TradeType },
    { item_code: 'BO-006', name: 'Trittschalldämmung 2mm PE-Schaum', unit: 'm2' as UnitType, unit_price: 3.00, category: 'Unterlagen', trade: 'bodenleger' as TradeType },
  ]
}
