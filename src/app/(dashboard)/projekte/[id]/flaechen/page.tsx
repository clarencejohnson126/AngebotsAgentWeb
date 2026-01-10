'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CheckCircle,
  Download,
  ChevronRight,
  ArrowLeft,
  FileSpreadsheet,
  BarChart3,
  Upload,
  FileText,
  Loader2,
  Info,
  Table,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface ExtractedRoom {
  room_number: string
  room_name: string
  area_m2: number
  counted_m2: number
  factor: number
  page: number
  source_text: string
  category: string
  extraction_pattern: string
  perimeter_m?: number
  height_m?: number
}

interface AreaExtractionResult {
  success: boolean
  rooms: ExtractedRoom[]
  total_area_m2: number
  total_counted_m2: number
  room_count: number
  page_count: number
  blueprint_style: string
  extraction_method: string
  warnings: string[]
  totals_by_category: Record<string, number>
}

// Map category to German display name
const CATEGORY_LABELS: Record<string, string> = {
  office: 'Büro',
  residential: 'Wohnen',
  circulation: 'Verkehrsfläche',
  stairs: 'Treppen',
  elevators: 'Aufzüge',
  shafts: 'Schächte',
  technical: 'Technik',
  sanitary: 'Sanitär',
  storage: 'Lager',
  outdoor: 'Außenbereich',
  other: 'Sonstige',
}

// Chart colors for categories
const CATEGORY_COLORS: Record<string, string> = {
  office: '#3B82F6',      // blue
  residential: '#8B5CF6', // purple
  circulation: '#F59E0B', // amber
  stairs: '#A855F7',      // violet
  elevators: '#6366F1',   // indigo
  shafts: '#64748B',      // slate
  technical: '#10B981',   // emerald
  sanitary: '#06B6D4',    // cyan
  storage: '#78716C',     // stone
  outdoor: '#22C55E',     // green
  other: '#94A3B8',       // gray
}

// Map blueprint style to display name
const STYLE_LABELS: Record<string, string> = {
  haardtring: 'Wohngebäude (Haardtring)',
  leiq: 'Bürogebäude (LeiQ)',
  omniturm: 'Hochhaus (Omniturm)',
  unknown: 'Unbekannt',
}

// Format number as German format
function formatGermanNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

type Step = 'upload' | 'processing' | 'results'

export default function FlaechenPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const documentId = searchParams.get('documentId')
  const documentName = searchParams.get('name') || ''
  const storagePath = searchParams.get('storagePath') || ''

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>(documentName)
  const [fileSize, setFileSize] = useState<number>(0)
  const [result, setResult] = useState<AreaExtractionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<ExtractedRoom | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('room_number')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'table' | 'report'>('table')

  // Set filename from URL params - user will drop the file
  useEffect(() => {
    if (documentName) {
      setFileName(decodeURIComponent(documentName))
    }
  }, [documentName])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0]
      setFile(f)
      setFileName(f.name)
      setFileSize(f.size)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const handleStartExtraction = async () => {
    if (!file) {
      setError('Bitte laden Sie eine PDF-Datei hoch')
      return
    }

    setStep('processing')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Call Python service directly - use SnapGrid extraction endpoint
      const PYTHON_SERVICE_URL = 'http://localhost:8000'
      const response = await fetch(`${PYTHON_SERVICE_URL}/api/v1/extraction/rooms`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Extraktion fehlgeschlagen: ${errorText}`)
      }

      const rawResult = await response.json()

      // Transform SnapGrid response to expected format
      const extractionResult: AreaExtractionResult = {
        success: true,
        rooms: rawResult.rooms || [],
        total_area_m2: rawResult.summary?.total_area_m2 || 0,
        total_counted_m2: rawResult.summary?.total_counted_m2 || 0,
        room_count: rawResult.summary?.total_rooms || rawResult.rooms?.length || 0,
        page_count: rawResult.summary?.page_count || 0,
        blueprint_style: rawResult.summary?.blueprint_style || 'unknown',
        extraction_method: 'deterministic_python',
        warnings: rawResult.warnings || [],
        totals_by_category: (rawResult.summary?.by_category || []).reduce(
          (acc: Record<string, number>, cat: { category: string; counted_m2: number }) => {
            acc[cat.category] = cat.counted_m2
            return acc
          },
          {}
        ),
      }

      setResult(extractionResult)
      setStep('results')

      // Store result for later viewing
      if (documentId) {
        sessionStorage.setItem(`extraction-result-${documentId}`, JSON.stringify(extractionResult))
      }
    } catch (err) {
      console.error('Extraction error:', err)
      setError(err instanceof Error ? err.message : 'Extraktion fehlgeschlagen')
      setStep('upload')
    }
  }

  const handleNewScan = () => {
    setStep('upload')
    setFile(null)
    setFileName('')
    setFileSize(0)
    setResult(null)
    setError(null)
    setSelectedRoom(null)
  }

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (!result) return []
    const cats = new Set(result.rooms.map(r => r.category))
    return Array.from(cats).sort()
  }, [result])

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    if (!result) return []
    let rooms = [...result.rooms]

    if (categoryFilter !== 'all') {
      rooms = rooms.filter(r => r.category === categoryFilter)
    }

    rooms.sort((a, b) => {
      let aVal: string | number = a[sortColumn as keyof ExtractedRoom] as string | number
      let bVal: string | number = b[sortColumn as keyof ExtractedRoom] as string | number

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })

    return rooms
  }, [result, categoryFilter, sortColumn, sortDirection])

  // Chart data: Area by category (horizontal bar chart)
  const categoryChartData = useMemo(() => {
    if (!result) return []
    const categoryTotals: Record<string, number> = {}
    for (const room of result.rooms) {
      categoryTotals[room.category] = (categoryTotals[room.category] || 0) + room.counted_m2
    }
    return Object.entries(categoryTotals)
      .map(([category, value]) => ({
        category,
        name: CATEGORY_LABELS[category] || category,
        value: Math.round(value * 100) / 100,
        fill: CATEGORY_COLORS[category] || '#94A3B8',
      }))
      .sort((a, b) => b.value - a.value)
  }, [result])

  // Chart data: Area by page (vertical bar chart)
  const pageChartData = useMemo(() => {
    if (!result) return []
    const pageTotals: Record<number, number> = {}
    for (const room of result.rooms) {
      const page = room.page || 1
      pageTotals[page] = (pageTotals[page] || 0) + room.counted_m2
    }
    return Object.entries(pageTotals)
      .map(([page, value]) => ({
        page: `Seite ${page}`,
        value: Math.round(value * 100) / 100,
      }))
      .sort((a, b) => parseInt(a.page.replace('Seite ', '')) - parseInt(b.page.replace('Seite ', '')))
  }, [result])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleExport = () => {
    if (!result) return
    const dataStr = JSON.stringify(result, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flaechen-${fileName.replace('.pdf', '')}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/projekte/${projectId}`} className="inline-flex items-center text-slate-400 hover:text-white text-sm mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück zum Projekt
            </Link>
            <h1 className="text-2xl font-bold text-white">Schnellscan</h1>
            <p className="text-sm text-slate-400 mt-1">
              Raumflächen aus Grundrissen sofort extrahieren
            </p>
          </div>
          <div className="flex gap-2">
            {step === 'results' && (
              <>
                <Button
                  variant="outline"
                  className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={handleNewScan}
                >
                  Neuer Scan
                </Button>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportieren
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mt-4">
          <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-emerald-400' : 'text-emerald-400'}`}>
            {step !== 'upload' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">1</div>
            )}
            <span className="text-sm font-medium">Hochladen</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-600" />
          <div className={`flex items-center gap-2 ${step === 'processing' ? 'text-emerald-400' : step === 'results' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {step === 'results' ? (
              <CheckCircle className="h-5 w-5" />
            ) : step === 'processing' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white font-bold">2</div>
            )}
            <span className="text-sm font-medium">Verarbeitung</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-600" />
          <div className={`flex items-center gap-2 ${step === 'results' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {step === 'results' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white font-bold">3</div>
            )}
            <span className="text-sm font-medium">Ergebnisse</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="flex gap-6">
            {/* Upload Zone */}
            <div className="flex-1">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer
                  flex flex-col items-center justify-center min-h-[400px]
                  ${isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 hover:border-emerald-500/50 bg-slate-800/50'}
                `}
              >
                <input {...getInputProps()} />
                {file ? (
                  <>
                    <FileText className="h-16 w-16 text-emerald-400 mb-4" />
                    <p className="text-lg font-medium text-white text-center">{fileName}</p>
                    <p className="text-sm text-slate-400 mt-1">{formatFileSize(fileSize)}</p>
                    <p className="text-sm text-emerald-400 mt-4 cursor-pointer hover:underline">
                      Klicken oder ablegen zum Ersetzen
                    </p>
                  </>
                ) : fileName ? (
                  <>
                    <Upload className="h-16 w-16 text-amber-500 mb-4" />
                    <p className="text-lg font-medium text-white text-center">
                      {fileName}
                    </p>
                    <p className="text-sm text-amber-400 mt-2">
                      PDF-Datei hier ablegen um fortzufahren
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-16 w-16 text-slate-500 mb-4" />
                    <p className="text-lg font-medium text-white">
                      PDF hier ablegen oder klicken zum Durchsuchen
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      Unterstützt CAD-exportierte Grundrisse
                    </p>
                  </>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Extraction Settings */}
            <div className="w-96">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Extraktionseinstellungen</h3>

                <div className="flex items-start gap-3 mb-6">
                  <Info className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Automatische Erkennung</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Planstil (Haardtring, LeiQ, Omniturm) wird automatisch anhand von Textmustern erkannt.
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-400 mb-3">Unterstützte Muster</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
                      <span className="text-emerald-400 font-mono font-bold">NRF:</span>
                      <span className="text-slate-400 text-sm">Netto-Raumfläche (Büro)</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
                      <span className="text-emerald-400 font-mono font-bold">F:</span>
                      <span className="text-slate-400 text-sm">Fläche (Wohnbau)</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
                      <span className="text-emerald-400 font-mono font-bold">NGF:</span>
                      <span className="text-slate-400 text-sm">Netto-Grundfläche (Hochhaus)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded p-3 mb-6">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">Balkonfaktor:</span> Außenbereiche (Balkon, Terrasse, Loggia) werden automatisch erkannt und mit 50% angerechnet.
                  </p>
                </div>

                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-lg"
                  onClick={handleStartExtraction}
                  disabled={!file}
                >
                  Extraktion starten
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-16 w-16 text-emerald-400 animate-spin mb-4" />
            <p className="text-xl font-medium text-white">Raumflächen werden extrahiert...</p>
            <p className="text-sm text-slate-400 mt-2">{fileName}</p>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && result && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-xs font-medium text-slate-400 uppercase mb-1">Räume</div>
                <div className="text-3xl font-bold text-white">{result.room_count}</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-xs font-medium text-slate-400 uppercase mb-1">Gesamtfläche</div>
                <div className="text-3xl font-bold text-white">
                  {formatGermanNumber(result.total_area_m2)}
                  <span className="text-lg font-normal text-slate-400 ml-1">m²</span>
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-xs font-medium text-slate-400 uppercase mb-1">Angerechnete Fläche</div>
                <div className="text-3xl font-bold text-emerald-400">
                  {formatGermanNumber(result.total_counted_m2)}
                  <span className="text-lg font-normal text-emerald-500 ml-1">m²</span>
                </div>
              </div>
              <div className="bg-emerald-600 rounded-lg p-4">
                <div className="text-xs font-medium text-emerald-100 uppercase mb-1">Planstil</div>
                <div className="text-lg font-bold text-white">
                  {STYLE_LABELS[result.blueprint_style] || result.blueprint_style}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                className={viewMode === 'table'
                  ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                  : 'bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800'
                }
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4 mr-2" />
                Tabelle
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={viewMode === 'report'
                  ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                  : 'bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800'
                }
                onClick={() => setViewMode('report')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Bericht
              </Button>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="flex gap-6">
                {/* Table Section */}
                <div className="flex-1">
                  {/* Filter Bar */}
                  <div className="flex items-center justify-between mb-4 bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-400">Filtern:</span>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Alle Kategorien" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="all" className="text-white">Alle Kategorien</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat} className="text-white">
                              {CATEGORY_LABELS[cat] || cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-sm text-slate-400">{filteredRooms.length} Räume</span>
                  </div>

                  {/* Data Table */}
                  <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('room_number')}>
                            RAUM {sortColumn === 'room_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('room_name')}>
                            NAME {sortColumn === 'room_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                            KATEGORIE {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('area_m2')}>
                            FLÄCHE {sortColumn === 'area_m2' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">FAKTOR</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('counted_m2')}>
                            ANGERECHNET {sortColumn === 'counted_m2' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">SEITE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRooms.map((room, idx) => (
                          <tr
                            key={`${room.room_number}-${idx}`}
                            className={`border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 ${selectedRoom?.room_number === room.room_number ? 'bg-slate-700' : ''}`}
                            onClick={() => setSelectedRoom(room)}
                          >
                            <td className="px-4 py-3 font-mono text-emerald-400 font-medium">{room.room_number}</td>
                            <td className="px-4 py-3 text-white">{room.room_name}</td>
                            <td className="px-4 py-3 text-slate-300">{CATEGORY_LABELS[room.category] || room.category}</td>
                            <td className="px-4 py-3 text-right font-mono text-white">{formatGermanNumber(room.area_m2)}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-400">{Math.round(room.factor * 100)}%</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-400 font-medium">{formatGermanNumber(room.counted_m2)}</td>
                            <td className="px-4 py-3 text-right text-slate-400">{room.page}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit Trail Sidebar */}
                <div className="w-80">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">AUDIT TRAIL</h3>
                    {selectedRoom ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-500 uppercase">Raumnummer</label>
                          <p className="font-mono text-lg font-bold text-white">{selectedRoom.room_number}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 uppercase">Raumname</label>
                          <p className="text-white">{selectedRoom.room_name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 uppercase">Kategorie</label>
                          <p className="text-white">{CATEGORY_LABELS[selectedRoom.category] || selectedRoom.category}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 uppercase">Fläche</label>
                          <p className="text-2xl font-bold text-white">
                            {formatGermanNumber(selectedRoom.area_m2)}
                            <span className="text-sm font-normal text-slate-400 ml-1">m²</span>
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 uppercase">Quelltext</label>
                          <div className="bg-emerald-600 text-white p-2 rounded text-sm font-mono mt-1">
                            {selectedRoom.source_text}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 uppercase">Extraktionsmuster</label>
                          <p className="text-emerald-400 font-mono">{selectedRoom.extraction_pattern}</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 uppercase">Seite</label>
                          <p className="text-white">{selectedRoom.page}</p>
                        </div>
                        {selectedRoom.perimeter_m && (
                          <div>
                            <label className="text-xs text-slate-500 uppercase">Umfang</label>
                            <p className="text-white">{formatGermanNumber(selectedRoom.perimeter_m)} m</p>
                          </div>
                        )}
                        {selectedRoom.height_m && (
                          <div>
                            <label className="text-xs text-slate-500 uppercase">Höhe</label>
                            <p className="text-white">{formatGermanNumber(selectedRoom.height_m)} m</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Klicken Sie auf eine Zeile für Details</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Report View */}
            {viewMode === 'report' && (
              <div className="space-y-6">
                {/* Top Row: Category Bar Chart + Donut Chart */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Horizontal Bar Chart - Area by Category */}
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Fläche nach Kategorie</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryChartData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={true} />
                          <XAxis
                            type="number"
                            stroke="#94A3B8"
                            fontSize={12}
                            tickFormatter={(value) => `${value} m²`}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            stroke="#94A3B8"
                            fontSize={12}
                            width={90}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#F8FAFC' }}
                            formatter={(value) => [`${formatGermanNumber(value as number)} m²`, 'Fläche']}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Donut Chart - Distribution */}
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Verteilung</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#F8FAFC' }}
                            formatter={(value) => [`${formatGermanNumber(value as number)} m²`, 'Fläche']}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '12px' }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Area by Page */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Fläche nach Seite</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pageChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="page"
                          stroke="#94A3B8"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={12}
                          tickFormatter={(value) => `${value} m²`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#F8FAFC' }}
                          formatter={(value) => [`${formatGermanNumber(value as number)} m²`, 'Fläche']}
                        />
                        <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
