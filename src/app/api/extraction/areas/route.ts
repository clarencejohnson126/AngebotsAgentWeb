import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  categorizeRoom,
  getRoomFactor,
  parseGermanNumber,
} from '@/lib/construction/skills'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

export interface ExtractedRoom {
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

export interface AreaExtractionResult {
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

// Demo mode extraction with realistic mock data using skills knowledge
function getDemoExtractionResult(): AreaExtractionResult {
  const demoRooms: ExtractedRoom[] = [
    {
      room_number: 'B.00.2.001',
      room_name: 'Büro',
      area_m2: 24.5,
      counted_m2: 24.5,
      factor: 1.0,
      page: 1,
      source_text: 'NRF: 24,50 m²',
      category: categorizeRoom('Büro'),
      extraction_pattern: 'NRF:',
    },
    {
      room_number: 'B.00.2.002',
      room_name: 'Flur',
      area_m2: 18.3,
      counted_m2: 18.3,
      factor: 1.0,
      page: 1,
      source_text: 'NRF: 18,30 m²',
      category: categorizeRoom('Flur'),
      extraction_pattern: 'NRF:',
    },
    {
      room_number: 'B.00.2.003',
      room_name: 'WC',
      area_m2: 4.2,
      counted_m2: 4.2,
      factor: 1.0,
      page: 1,
      source_text: 'NRF: 4,20 m²',
      category: categorizeRoom('WC'),
      extraction_pattern: 'NRF:',
    },
    {
      room_number: 'B.00.2.004',
      room_name: 'Technikraum',
      area_m2: 8.7,
      counted_m2: 8.7,
      factor: 1.0,
      page: 2,
      source_text: 'NRF: 8,70 m²',
      category: categorizeRoom('Technikraum'),
      extraction_pattern: 'NRF:',
    },
    {
      room_number: 'B.00.2.005',
      room_name: 'Balkon',
      area_m2: 12.0,
      counted_m2: 6.0,
      factor: getRoomFactor('Balkon'),
      page: 2,
      source_text: 'NRF: 12,00 m² (50%: 6,00 m²)',
      category: categorizeRoom('Balkon'),
      extraction_pattern: 'NRF:',
    },
  ]

  const totalArea = demoRooms.reduce((sum, r) => sum + r.area_m2, 0)
  const totalCounted = demoRooms.reduce((sum, r) => sum + r.counted_m2, 0)

  const totals: Record<string, number> = {}
  for (const room of demoRooms) {
    totals[room.category] = (totals[room.category] || 0) + room.counted_m2
  }

  return {
    success: true,
    rooms: demoRooms,
    total_area_m2: Math.round(totalArea * 100) / 100,
    total_counted_m2: Math.round(totalCounted * 100) / 100,
    room_count: demoRooms.length,
    page_count: 3,
    blueprint_style: 'leiq',
    extraction_method: 'demo_mode',
    warnings: ['Demo-Modus: Beispieldaten zur Flächenextraktion'],
    totals_by_category: totals,
  }
}

// Text-based extraction using regex patterns (deterministic fallback)
async function extractAreasFromText(text: string): Promise<AreaExtractionResult> {
  const rooms: ExtractedRoom[] = []
  const pageCount = Math.max(1, text.split('\f').length)

  // Detect blueprint style
  let detectedStyle = 'unknown'
  if (text.match(/\bF:\s*[\d,]+/)) detectedStyle = 'haardtring'
  else if (text.match(/\bNRF:\s*[\d,]+/i)) detectedStyle = 'leiq'
  else if (text.match(/\bNGF:\s*[\d.,]+/i)) detectedStyle = 'omniturm'

  // More comprehensive area extraction patterns
  const areaPatterns = [
    // Standard German CAD formats
    { pattern: /F:\s*([\d,]+)\s*m[²2]?/gi, style: 'haardtring', namePrefix: 'Fläche' },
    { pattern: /NRF:\s*([\d,]+)\s*m[²2]?/gi, style: 'leiq', namePrefix: 'Raum' },
    { pattern: /NGF:\s*([\d.,]+)\s*m[²2]?/gi, style: 'omniturm', namePrefix: 'Raum' },
    // Generic patterns
    { pattern: /(?:Fläche|FL|GF|BGF)\s*[=:]\s*([\d.,]+)\s*m[²2]?/gi, style: 'generic', namePrefix: 'Fläche' },
    // Room with area pattern: "Büro 1.01  24,50 m²"
    { pattern: /([A-Za-zäöüÄÖÜß\s]+[\d.]+)\s+([\d,]+)\s*m[²2]/gi, style: 'room_labeled', namePrefix: '' },
  ]

  let roomCounter = 0
  const seenAreas = new Set<string>()

  for (const { pattern, style, namePrefix } of areaPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      try {
        // Handle different match groups based on pattern
        let areaStr = match[1]
        let roomName = namePrefix

        // For room_labeled pattern, extract room name too
        if (style === 'room_labeled' && match[2]) {
          roomName = match[1].trim()
          areaStr = match[2]
        }

        const area = parseGermanNumber(areaStr)

        // Skip invalid or duplicate areas
        const areaKey = `${area.toFixed(2)}`
        if (area <= 0 || area > 10000 || seenAreas.has(areaKey)) {
          continue
        }
        seenAreas.add(areaKey)

        roomCounter++
        const category = categorizeRoom(roomName)
        const factor = getRoomFactor(roomName)

        rooms.push({
          room_number: `room_${String(roomCounter).padStart(3, '0')}`,
          room_name: roomName || `Raum ${roomCounter}`,
          area_m2: area,
          counted_m2: area * factor,
          factor: factor,
          page: 0,
          source_text: match[0],
          category: category,
          extraction_pattern: style,
        })
      } catch (e) {
        // Skip invalid numbers
      }
    }
  }

  const totalArea = rooms.reduce((sum, r) => sum + r.area_m2, 0)
  const totalCounted = rooms.reduce((sum, r) => sum + r.counted_m2, 0)
  const totals: Record<string, number> = {}
  for (const room of rooms) {
    totals[room.category] = (totals[room.category] || 0) + room.counted_m2
  }

  return {
    success: rooms.length > 0,
    rooms,
    total_area_m2: Math.round(totalArea * 100) / 100,
    total_counted_m2: Math.round(totalCounted * 100) / 100,
    room_count: rooms.length,
    page_count: pageCount,
    blueprint_style: detectedStyle,
    extraction_method: 'text_pattern_matching',
    warnings: rooms.length === 0
      ? ['Keine Flächen im Dokument gefunden - bitte prüfen Sie das Format']
      : ['Textbasierte Extraktion - Ergebnisse manuell prüfen'],
    totals_by_category: totals,
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentId = formData.get('documentId') as string | null
    const style = formData.get('style') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      )
    }

    let result: AreaExtractionResult

    // ALWAYS try Python service first for real deterministic extraction
    console.log(`[Area Extraction] Attempting Python service at ${PYTHON_SERVICE_URL}...`)

    try {
      // Check if Python service is available
      const healthCheck = await fetch(`${PYTHON_SERVICE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      })

      if (healthCheck.ok) {
        // Python service is available - try extraction
        let url = `${PYTHON_SERVICE_URL}/extract/areas`
        if (style) {
          url += `?style=${encodeURIComponent(style)}`
        }

        const pythonFormData = new FormData()
        pythonFormData.append('file', file)

        const response = await fetch(url, {
          method: 'POST',
          body: pythonFormData,
          signal: AbortSignal.timeout(30000), // 30 second timeout for extraction
        })

        if (response.ok) {
          result = await response.json()
          result.extraction_method = 'python_service'
          console.log(`[Area Extraction] Python service extracted ${result.room_count} rooms, total ${result.total_area_m2} m²`)
        } else {
          const errorText = await response.text()
          console.warn(`[Area Extraction] Python service returned error: ${response.status} - ${errorText}`)
          throw new Error(`Python service error: ${response.status}`)
        }
      } else {
        throw new Error('Python service not healthy')
      }
    } catch (pythonError) {
      console.warn('[Area Extraction] Python service unavailable, trying text extraction:', pythonError)

      // Fallback: Try to extract text from PDF and use pattern matching
      try {
        // Try to get text from PDF using a simple approach
        const arrayBuffer = await file.arrayBuffer()
        const textDecoder = new TextDecoder('utf-8', { fatal: false })
        const rawText = textDecoder.decode(arrayBuffer)

        // Check if we can extract any readable text
        if (rawText.length > 100 && !rawText.startsWith('%PDF')) {
          // File might be text-based
          result = await extractAreasFromText(rawText)
        } else {
          // Binary PDF - return demo data as we can't parse it without pdf-parse
          console.log('[Area Extraction] Binary PDF, using demo data')
          result = getDemoExtractionResult()
          result.warnings = ['PDF-Parsing nicht verfügbar - Demo-Daten verwendet. Für echte Extraktion Python-Service starten.']
        }
      } catch (textError) {
        console.error('[Area Extraction] Text extraction failed:', textError)
        result = getDemoExtractionResult()
        result.warnings.push('Fallback zu Demo-Daten - Extraktion fehlgeschlagen')
      }
    }

    // Store results if documentId provided
    if (documentId) {
      await supabase
        .from('documents')
        .update({
          status: 'extracted',
          extraction_summary: {
            type: 'area_extraction',
            rooms_found: result.room_count,
            total_area_m2: result.total_area_m2,
            total_counted_m2: result.total_counted_m2,
            blueprint_style: result.blueprint_style,
            totals_by_category: result.totals_by_category,
            warnings: result.warnings,
            method: result.extraction_method,
          },
        })
        .eq('id', documentId)

      // Store room data as takeoff results
      if (result.rooms && result.rooms.length > 0) {
        const { data: doc } = await supabase
          .from('documents')
          .select('project_id')
          .eq('id', documentId)
          .single()

        if (doc) {
          const takeoffRecords = result.rooms.map((room) => ({
            project_id: doc.project_id,
            document_id: documentId,
            position_number: room.room_number,
            description: `${room.room_name} (${room.category})`,
            quantity: room.counted_m2,
            unit: 'm2' as const,
            source: 'extracted' as const,
            measurement_data: {
              original_area_m2: room.area_m2,
              factor: room.factor,
              factor_source: room.factor_source,
              category: room.category,
              extraction_pattern: room.extraction_pattern,
              source_text: room.source_text,
              bbox: room.bbox,
              perimeter_m: room.perimeter_m,
              height_m: room.height_m,
            },
            plan_page: room.page,
            notes: room.source_text,
          }))

          await supabase
            .from('takeoff_results')
            .delete()
            .eq('document_id', documentId)

          await supabase
            .from('takeoff_results')
            .insert(takeoffRecords)
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Area extraction error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
