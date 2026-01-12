import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUser, getUserCompany } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companyData = await getUserCompany()
    if (!companyData) {
      return NextResponse.json({ error: 'No company found' }, { status: 403 })
    }

    const supabase = await createServerSupabaseClient()

    // Fetch project and company
    const [
      { data: project },
      { data: company },
      { data: offerDraft },
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).eq('company_id', companyData.companyId).single(),
      supabase.from('companies').select('*').eq('id', companyData.companyId).single(),
      supabase.from('offer_drafts').select('*, offer_line_items(*)').eq('project_id', projectId).eq('is_current', true).single(),
    ])

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'AngebotsAgent'
    workbook.created = new Date()

    // ============ COVER SHEET ============
    const coverSheet = workbook.addWorksheet('Deckblatt')

    // Company header
    coverSheet.getCell('A1').value = company?.name || 'Firma'
    coverSheet.getCell('A1').font = { bold: true, size: 16 }
    coverSheet.getCell('A2').value = company?.street || ''
    coverSheet.getCell('A3').value = `${company?.zip_code || ''} ${company?.city || ''}`
    coverSheet.getCell('A4').value = company?.phone || ''
    coverSheet.getCell('A5').value = company?.email || ''

    // Project info
    coverSheet.getCell('A8').value = 'ANGEBOT'
    coverSheet.getCell('A8').font = { bold: true, size: 20 }

    coverSheet.getCell('A10').value = 'Projekt:'
    coverSheet.getCell('B10').value = project.title
    coverSheet.getCell('B10').font = { bold: true }

    coverSheet.getCell('A11').value = 'Auftraggeber:'
    coverSheet.getCell('B11').value = project.client_name

    coverSheet.getCell('A12').value = 'Bauvorhaben:'
    coverSheet.getCell('B12').value = `${project.site_street || ''}, ${project.site_zip_code || ''} ${project.site_city || ''}`

    coverSheet.getCell('A13').value = 'Angebotsnummer:'
    coverSheet.getCell('B13').value = offerDraft?.offer_number || '-'

    coverSheet.getCell('A14').value = 'Datum:'
    coverSheet.getCell('B14').value = new Date().toLocaleDateString('de-DE')

    // Totals
    if (offerDraft) {
      coverSheet.getCell('A17').value = 'Angebotssumme'
      coverSheet.getCell('A17').font = { bold: true, size: 14 }

      coverSheet.getCell('A19').value = 'Netto:'
      coverSheet.getCell('B19').value = offerDraft.total_net || 0
      coverSheet.getCell('B19').numFmt = '#,##0.00 "€"'

      coverSheet.getCell('A20').value = `MwSt. (${offerDraft.vat_percent}%):`
      coverSheet.getCell('B20').value = offerDraft.vat_amount || 0
      coverSheet.getCell('B20').numFmt = '#,##0.00 "€"'

      coverSheet.getCell('A21').value = 'Brutto:'
      coverSheet.getCell('B21').value = offerDraft.total_gross || 0
      coverSheet.getCell('B21').numFmt = '#,##0.00 "€"'
      coverSheet.getCell('B21').font = { bold: true }
    }

    // Column widths
    coverSheet.getColumn('A').width = 20
    coverSheet.getColumn('B').width = 40

    // ============ LINE ITEMS SHEET ============
    const itemsSheet = workbook.addWorksheet('Positionen')

    // Header row
    const headerRow = itemsSheet.addRow([
      'Pos.',
      'Beschreibung',
      'Menge',
      'Einheit',
      'EP (€)',
      'GP (€)',
    ])
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    // Add line items
    const lineItems = offerDraft?.offer_line_items || []
    let rowIndex = 2

    lineItems.forEach((item: any) => {
      const row = itemsSheet.addRow([
        item.position_number,
        item.title,
        item.quantity,
        item.unit,
        item.unit_price,
        { formula: `C${rowIndex}*E${rowIndex}` }, // GP formula
      ])

      row.getCell(3).numFmt = '#,##0.00'
      row.getCell(5).numFmt = '#,##0.00'
      row.getCell(6).numFmt = '#,##0.00'

      rowIndex++
    })

    // Subtotal row
    itemsSheet.addRow([])
    const subtotalRow = itemsSheet.addRow([
      '',
      'Zwischensumme:',
      '',
      '',
      '',
      { formula: `SUM(F2:F${rowIndex - 1})` },
    ])
    subtotalRow.font = { bold: true }
    subtotalRow.getCell(6).numFmt = '#,##0.00 "€"'

    // Column widths
    itemsSheet.getColumn('A').width = 10
    itemsSheet.getColumn('B').width = 50
    itemsSheet.getColumn('C').width = 12
    itemsSheet.getColumn('D').width = 10
    itemsSheet.getColumn('E').width = 12
    itemsSheet.getColumn('F').width = 15

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Angebot_${project.title.replace(/\s+/g, '_')}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Excel export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
