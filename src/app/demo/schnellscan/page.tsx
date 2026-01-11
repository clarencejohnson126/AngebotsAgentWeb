'use client'

import { useState, useMemo, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CheckCircle,
  Download,
  ChevronRight,
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  Info,
  Table,
  BarChart3,
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
}

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

const CATEGORY_COLORS: Record<string, string> = {
  office: '#3B82F6',
  residential: '#8B5CF6',
  circulation: '#F59E0B',
  stairs: '#A855F7',
  elevators: '#6366F1',
  shafts: '#64748B',
  technical: '#10B981',
  sanitary: '#06B6D4',
  storage: '#78716C',
  outdoor: '#22C55E',
  other: '#94A3B8',
}

function formatGermanNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

type Step = 'upload' | 'processing' | 'results'

export default function DemoSchnellscanPage() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<number>(0)
  const [result, setResult] = useState<AreaExtractionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<ExtractedRoom | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('room_number')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'table' | 'report'>('table')

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
      }

      setResult(extractionResult)
      setStep('results')
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

  const categories = useMemo(() => {
    if (!result) return []
    const cats = new Set(result.rooms.map(r => r.category))
    return Array.from(cats).sort()
  }, [result])

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
    a.download = `flaechen-\${fileName.replace('.pdf', '')}-\${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `\${bytes} B`
    if (bytes < 1024 * 1024) return `\${(bytes / 1024).toFixed(1)} KB`
    return `\${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <a href="http://localhost:5173" className="inline-flex items-center text-slate-400 hover:text-white text-sm mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück zur Startseite
            </a>
            <h1 className="text-2xl font-bold text-white">Aufmaß Schnellscan</h1>
            <p className="text-sm text-slate-400 mt-1">
              Raumflächen aus Grundrissen sofort extrahieren - Kostenlos testen
            </p>
          </div>
          <div className="flex gap-2">
            {step === 'results' && (
              <>
                <Button variant="outline" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800" onClick={handleNewScan}>
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
        <div className="flex items-center gap-4 mt-4">
          <div className={`flex items-center gap-2 \${step === 'upload' ? 'text-emerald-400' : 'text-emerald-400'}`}>
            {step !== 'upload' ? <CheckCircle className="h-5 w-5" /> : <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">1</div>}
            <span className="text-sm font-medium">Hochladen</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-600" />
          <div className={`flex items-center gap-2 \${step === 'processing' ? 'text-emerald-400' : step === 'results' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {step === 'results' ? <CheckCircle className="h-5 w-5" /> : step === 'processing' ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="h-5 w-5 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white font-bold">2</div>}
            <span className="text-sm font-medium">Verarbeitung</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-600" />
          <div className={`flex items-center gap-2 \${step === 'results' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {step === 'results' ? <CheckCircle className="h-5 w-5" /> : <div className="h-5 w-5 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white font-bold">3</div>}
            <span className="text-sm font-medium">Ergebnisse</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {step === 'upload' && (
          <div className="flex gap-6">
            <div className="flex-1">
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[400px] \${isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 hover:border-emerald-500/50 bg-slate-800/50'}`}>
                <input {...getInputProps()} />
                {file ? (
                  <>
                    <FileText className="h-16 w-16 text-emerald-400 mb-4" />
                    <p className="text-lg font-medium text-white text-center">{fileName}</p>
                    <p className="text-sm text-slate-400 mt-1">{formatFileSize(fileSize)}</p>
                    <p className="text-sm text-emerald-400 mt-4">Klicken oder ablegen zum Ersetzen</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-16 w-16 text-slate-500 mb-4" />
                    <p className="text-lg font-medium text-white">PDF hier ablegen oder klicken</p>
                    <p className="text-sm text-slate-400 mt-2">Unterstützt CAD-exportierte Grundrisse</p>
                  </>
                )}
              </div>
              {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}
            </div>
            <div className="w-96">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Extraktionseinstellungen</h3>
                <div className="flex items-start gap-3 mb-6">
                  <Info className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Automatische Erkennung</p>
                    <p className="text-xs text-slate-400 mt-1">Raumflächen werden automatisch anhand von Textmustern erkannt.</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-400 mb-3">Unterstützte Formate</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
                      <span className="text-emerald-400 font-mono font-bold">NGF:</span>
                      <span className="text-slate-400 text-sm">Netto-Grundfläche</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
                      <span className="text-emerald-400 font-mono font-bold">NRF:</span>
                      <span className="text-slate-400 text-sm">Netto-Raumfläche</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
                      <span className="text-emerald-400 font-mono font-bold">F:</span>
                      <span className="text-slate-400 text-sm">Fläche</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 mb-6">
                  <p className="text-sm text-emerald-400"><span className="font-medium">Demo-Modus:</span> Testen Sie den Scanner kostenlos.</p>
                </div>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-lg" onClick={handleStartExtraction} disabled={!file}>
                  Extraktion starten
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-16 w-16 text-emerald-400 animate-spin mb-4" />
            <p className="text-xl font-medium text-white">Raumflächen werden extrahiert...</p>
            <p className="text-sm text-slate-400 mt-2">{fileName}</p>
          </div>
        )}

        {step === 'results' && result && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-xs font-medium text-slate-400 uppercase mb-1">Räume</div>
                <div className="text-3xl font-bold text-white">{result.room_count}</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-xs font-medium text-slate-400 uppercase mb-1">Gesamtfläche</div>
                <div className="text-3xl font-bold text-white">{formatGermanNumber(result.total_area_m2)}<span className="text-lg font-normal text-slate-400 ml-1">m²</span></div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-xs font-medium text-slate-400 uppercase mb-1">Angerechnete Fläche</div>
                <div className="text-3xl font-bold text-emerald-400">{formatGermanNumber(result.total_counted_m2)}<span className="text-lg font-normal text-emerald-500 ml-1">m²</span></div>
              </div>
              <div className="bg-emerald-600 rounded-lg p-4">
                <div className="text-xs font-medium text-emerald-100 uppercase mb-1">Erkannt</div>
                <div className="text-lg font-bold text-white">{result.blueprint_style === 'unknown' ? 'Auto' : result.blueprint_style.toUpperCase()}</div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" className={viewMode === 'table' ? 'bg-slate-800 border-emerald-500 text-emerald-400' : 'bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800'} onClick={() => setViewMode('table')}>
                <Table className="h-4 w-4 mr-2" />Tabelle
              </Button>
              <Button variant="outline" size="sm" className={viewMode === 'report' ? 'bg-slate-800 border-emerald-500 text-emerald-400' : 'bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800'} onClick={() => setViewMode('report')}>
                <BarChart3 className="h-4 w-4 mr-2" />Bericht
              </Button>
            </div>

            {viewMode === 'table' && (
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4 bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-400">Filtern:</span>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Alle Kategorien" /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="all" className="text-white">Alle Kategorien</SelectItem>
                          {categories.map(cat => <SelectItem key={cat} value={cat} className="text-white">{CATEGORY_LABELS[cat] || cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-sm text-slate-400">{filteredRooms.length} Räume</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('room_number')}>RAUM {sortColumn === 'room_number' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('room_name')}>NAME {sortColumn === 'room_name' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('category')}>KATEGORIE {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('area_m2')}>FLÄCHE {sortColumn === 'area_m2' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">FAKTOR</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('counted_m2')}>ANGERECHNET {sortColumn === 'counted_m2' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRooms.map((room, idx) => (
                          <tr key={`\${room.room_number}-\${idx}`} className={`border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 \${selectedRoom?.room_number === room.room_number ? 'bg-slate-700' : ''}`} onClick={() => setSelectedRoom(room)}>
                            <td className="px-4 py-3 font-mono text-emerald-400 font-medium">{room.room_number}</td>
                            <td className="px-4 py-3 text-white">{room.room_name}</td>
                            <td className="px-4 py-3 text-slate-300">{CATEGORY_LABELS[room.category] || room.category}</td>
                            <td className="px-4 py-3 text-right font-mono text-white">{formatGermanNumber(room.area_m2)}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-400">{Math.round(room.factor * 100)}%</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-400 font-medium">{formatGermanNumber(room.counted_m2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="w-80">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">AUDIT TRAIL</h3>
                    {selectedRoom ? (
                      <div className="space-y-4">
                        <div><label className="text-xs text-slate-500 uppercase">Raumnummer</label><p className="font-mono text-lg font-bold text-white">{selectedRoom.room_number}</p></div>
                        <div><label className="text-xs text-slate-500 uppercase">Raumname</label><p className="text-white">{selectedRoom.room_name}</p></div>
                        <div><label className="text-xs text-slate-500 uppercase">Fläche</label><p className="text-2xl font-bold text-white">{formatGermanNumber(selectedRoom.area_m2)}<span className="text-sm font-normal text-slate-400 ml-1">m²</span></p></div>
                        <div><label className="text-xs text-slate-500 uppercase">Quelltext</label><div className="bg-emerald-600 text-white p-2 rounded text-sm font-mono mt-1">{selectedRoom.source_text}</div></div>
                        <div><label className="text-xs text-slate-500 uppercase">Muster</label><p className="text-emerald-400 font-mono">{selectedRoom.extraction_pattern}</p></div>
                      </div>
                    ) : <p className="text-slate-500 text-sm">Klicken Sie auf eine Zeile für Details</p>}
                  </div>
                  <div className="mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Volle Funktionalität</h4>
                    <p className="text-emerald-100 text-sm mb-3">Speichern und in Projekten verwenden.</p>
                    <Link href="/projekte"><Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50">Jetzt registrieren</Button></Link>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'report' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Fläche nach Kategorie</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `\${v} m²`} />
                        <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={12} width={90} />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value) => [`\${formatGermanNumber(value as number)} m²`, 'Fläche']} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>{categoryChartData.map((entry, index) => <Cell key={`cell-\${index}`} fill={entry.fill} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Verteilung</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">{categoryChartData.map((entry, index) => <Cell key={`cell-\${index}`} fill={entry.fill} />)}</Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value) => [`\${formatGermanNumber(value as number)} m²`, 'Fläche']} />
                        <Legend layout="horizontal" verticalAlign="bottom" formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '12px' }}>{value}</span>} />
                      </PieChart>
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
