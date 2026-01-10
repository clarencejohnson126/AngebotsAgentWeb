'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react'

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
  bbox?: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
  perimeter_m?: number
  height_m?: number
  factor_source?: string
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

interface AreaResultsViewerProps {
  result: AreaExtractionResult
  documentName?: string
  onExport?: (format: 'xlsx' | 'csv' | 'json') => void
}

// Map category to German display name
const CATEGORY_LABELS: Record<string, string> = {
  office: 'Office',
  residential: 'Residential',
  circulation: 'Circulation',
  stairs: 'Stairs',
  elevators: 'Elevators',
  shafts: 'Shafts',
  technical: 'Technical',
  sanitary: 'Sanitary',
  storage: 'Lager',
  outdoor: 'Outdoor',
  other: 'Other',
}

// Map blueprint style to German display name
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

export function AreaResultsViewer({ result, documentName, onExport }: AreaResultsViewerProps) {
  const [selectedRoom, setSelectedRoom] = useState<ExtractedRoom | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('room_number')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(result.rooms.map(r => r.category))
    return Array.from(cats).sort()
  }, [result.rooms])

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    let rooms = [...result.rooms]

    // Apply category filter
    if (categoryFilter !== 'all') {
      rooms = rooms.filter(r => r.category === categoryFilter)
    }

    // Sort
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
  }, [result.rooms, categoryFilter, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleExport = (format: 'xlsx' | 'csv' | 'json') => {
    if (onExport) {
      onExport(format)
    } else {
      // Default JSON export
      const dataStr = JSON.stringify(result, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `extraction-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flächenextraktion</h1>
            <p className="text-sm text-gray-500 mt-1">
              {documentName || 'Extrahierte Flächen aus Grundriss'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Upload</span>
          </div>
          <span className="text-gray-300">›</span>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Processing</span>
          </div>
          <span className="text-gray-300">›</span>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Results</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase">Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{result.room_count}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase">Total Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatGermanNumber(result.total_area_m2)}
                <span className="text-lg font-normal text-gray-500 ml-1">m²</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase">Counted Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {formatGermanNumber(result.total_counted_m2)}
                <span className="text-lg font-normal text-emerald-500 ml-1">m²</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-600 border-emerald-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-emerald-100 uppercase">Blueprint Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">
                {STYLE_LABELS[result.blueprint_style] || result.blueprint_style}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {result.warnings.join(' • ')}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <div className="flex gap-6">
          {/* Table Section */}
          <div className="flex-1">
            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Filter:</span>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] || cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-gray-500">{filteredRooms.length} rooms</span>
            </div>

            {/* Data Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead
                      className="text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('room_number')}
                    >
                      Room {sortColumn === 'room_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead
                      className="text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('room_name')}
                    >
                      Name {sortColumn === 'room_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead
                      className="text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category')}
                    >
                      Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead
                      className="text-xs font-semibold text-gray-600 uppercase text-right cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('area_m2')}
                    >
                      Area {sortColumn === 'area_m2' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase text-right">
                      Factor
                    </TableHead>
                    <TableHead
                      className="text-xs font-semibold text-gray-600 uppercase text-right cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('counted_m2')}
                    >
                      Counted {sortColumn === 'counted_m2' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase text-right">
                      Page
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room, idx) => (
                    <TableRow
                      key={`${room.room_number}-${idx}`}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedRoom?.room_number === room.room_number ? 'bg-emerald-50' : ''}`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <TableCell className="font-mono text-emerald-600 font-medium">
                        {room.room_number}
                      </TableCell>
                      <TableCell className="text-gray-900">{room.room_name}</TableCell>
                      <TableCell className="text-gray-600">
                        {CATEGORY_LABELS[room.category] || room.category}
                      </TableCell>
                      <TableCell className="text-right font-mono text-gray-900">
                        {formatGermanNumber(room.area_m2)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-gray-500">
                        {Math.round(room.factor * 100)}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 font-medium">
                        {formatGermanNumber(room.counted_m2)}
                      </TableCell>
                      <TableCell className="text-right text-gray-500">{room.page}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Category Totals */}
            {Object.keys(result.totals_by_category).length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Totals by Category</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(result.totals_by_category).map(([cat, total]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-gray-600">{CATEGORY_LABELS[cat] || cat}:</span>
                      <span className="font-mono text-gray-900">{formatGermanNumber(total)} m²</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audit Trail Sidebar */}
          <div className="w-80">
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase">
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRoom ? (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Room Number</label>
                      <p className="font-mono text-lg font-bold text-gray-900">{selectedRoom.room_number}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Room Name</label>
                      <p className="text-gray-900">{selectedRoom.room_name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Category</label>
                      <p className="text-gray-900">{CATEGORY_LABELS[selectedRoom.category] || selectedRoom.category}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Area</label>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatGermanNumber(selectedRoom.area_m2)}
                        <span className="text-sm font-normal text-gray-500 ml-1">m²</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Source Text</label>
                      <div className="bg-emerald-600 text-white p-2 rounded text-sm font-mono mt-1">
                        {selectedRoom.source_text}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Extraction Pattern</label>
                      <p className="text-emerald-600 font-mono">{selectedRoom.extraction_pattern}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Page</label>
                      <p className="text-gray-900">{selectedRoom.page}</p>
                    </div>
                    {selectedRoom.perimeter_m && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Perimeter</label>
                        <p className="text-gray-900">{formatGermanNumber(selectedRoom.perimeter_m)} m</p>
                      </div>
                    )}
                    {selectedRoom.height_m && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Height</label>
                        <p className="text-gray-900">{formatGermanNumber(selectedRoom.height_m)} m</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Klicken Sie auf eine Zeile um Details anzuzeigen
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
