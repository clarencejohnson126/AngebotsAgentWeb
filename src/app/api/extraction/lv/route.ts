import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { CLAUDE_EXTRACTION_PROMPTS } from '@/lib/construction/skills'

// Initialize Anthropic client (only if API key exists)
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// Demo extraction result for when API is unavailable
function getDemoLVExtractionResult() {
  return {
    positions: [
      {
        position_number: '01.01.0010',
        oz_number: '0010',
        title: 'Bodenbelag Teppichfliesen',
        description: 'Teppichfliesen 50x50cm, Qualität A, verlegen inkl. Sockelleisten',
        quantity: 450.0,
        unit: 'm2',
        page_number: 1,
        confidence: 0.95
      },
      {
        position_number: '01.01.0020',
        oz_number: '0020',
        title: 'Vinylboden Design',
        description: 'Design-Vinylboden, Holzoptik Eiche, verlegen mit Trittschalldämmung',
        quantity: 280.0,
        unit: 'm2',
        page_number: 2,
        confidence: 0.92
      },
      {
        position_number: '01.01.0030',
        oz_number: '0030',
        title: 'Sockelleisten PVC',
        description: 'PVC-Sockelleisten 60mm, Farbe nach Wahl, montiert',
        quantity: 320.0,
        unit: 'm',
        page_number: 3,
        confidence: 0.90
      },
      {
        position_number: '01.02.0010',
        oz_number: '0010',
        title: 'Untergrund vorbereiten',
        description: 'Untergrund schleifen, grundieren und spachteln für Bodenbelag',
        quantity: 730.0,
        unit: 'm2',
        page_number: 4,
        confidence: 0.88
      },
      {
        position_number: '01.02.0020',
        oz_number: '0020',
        title: 'Randdämmstreifen',
        description: 'Randdämmstreifen PE-Schaum 8mm, umlaufend verlegt',
        quantity: 320.0,
        unit: 'm',
        page_number: 5,
        confidence: 0.91
      }
    ],
    summary: {
      total_positions: 5,
      extraction_quality: 'demo',
      note: 'Demo-Daten - Anthropic API nicht verfügbar oder Guthaben erschöpft'
    },
    page_count: 8
  }
}

// Use Claude to extract LV positions directly from PDF (native PDF support)
async function extractWithClaudePDF(pdfBase64: string): Promise<any> {
  if (!anthropic) {
    throw new Error('API_NOT_CONFIGURED')
  }

  const systemPrompt = `${CLAUDE_EXTRACTION_PROMPTS.lvExtraction}

Antworte NUR mit einem JSON-Objekt im folgenden Format:
{
  "positions": [
    {
      "position_number": "01.01.0010",
      "oz_number": "0010",
      "title": "Kurztext",
      "description": "Langtext Beschreibung",
      "quantity": 100.5,
      "unit": "m2",
      "page_number": 1,
      "confidence": 0.95
    }
  ],
  "summary": {
    "total_positions": 10,
    "extraction_quality": "high"
  }
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            type: 'text',
            text: 'Extrahiere alle Positionen aus diesem Leistungsverzeichnis (LV). Analysiere das gesamte Dokument sorgfältig.',
          },
        ],
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  let jsonText = content.text
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  }

  const jsonStart = jsonText.indexOf('{')
  const jsonEnd = jsonText.lastIndexOf('}')
  if (jsonStart !== -1 && jsonEnd !== -1) {
    jsonText = jsonText.slice(jsonStart, jsonEnd + 1)
  }

  try {
    return JSON.parse(jsonText)
  } catch (e) {
    console.error('Failed to parse Claude response:', content.text)
    return {
      positions: [],
      summary: { total_positions: 0, extraction_quality: 'failed' }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentId = formData.get('documentId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('Demo mode: No API key configured, returning demo data')
      return NextResponse.json(getDemoLVExtractionResult())
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    console.log(`Processing ${file.name} (${file.size} bytes, isPDF: ${isPDF})`)

    try {
      if (isPDF) {
        console.log('Sending PDF directly to Claude for extraction...')
        const result = await extractWithClaudePDF(base64)
        console.log(`Claude extracted ${result.positions?.length || 0} positions`)

        return NextResponse.json({
          ...result,
          page_count: result.positions?.length > 0 ? Math.ceil(result.positions.length / 10) : 1
        })
      } else {
        // For non-PDF files, return demo data
        console.log('Non-PDF file, returning demo data')
        return NextResponse.json(getDemoLVExtractionResult())
      }
    } catch (apiError: any) {
      // Handle API errors (including credit exhaustion)
      console.error('Claude API error:', apiError)

      const errorMessage = apiError?.message || apiError?.error?.message || String(apiError)

      // Check for specific error types
      if (errorMessage.includes('credit balance') ||
          errorMessage.includes('billing') ||
          errorMessage.includes('invalid_request_error') ||
          apiError?.status === 400 ||
          apiError?.status === 402) {
        console.log('API credits exhausted or billing issue, returning demo data')
        const demoResult = getDemoLVExtractionResult()
        demoResult.summary.note = 'Demo-Daten - API-Guthaben erschöpft. Bitte Anthropic-Konto aufladen.'
        return NextResponse.json(demoResult)
      }

      // For other API errors, also fall back to demo
      console.log('API error, falling back to demo data')
      const demoResult = getDemoLVExtractionResult()
      demoResult.summary.note = `Demo-Daten - API-Fehler: ${errorMessage.substring(0, 100)}`
      return NextResponse.json(demoResult)
    }

  } catch (error) {
    console.error('Extraction error:', error)
    // Even on general errors, return demo data instead of failing
    const demoResult = getDemoLVExtractionResult()
    demoResult.summary.note = 'Demo-Daten - Fehler bei der Verarbeitung'
    return NextResponse.json(demoResult)
  }
}
