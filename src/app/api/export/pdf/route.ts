import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUser, getUserCompany } from '@/lib/supabase/server'

// For MVP, we return a simple HTML that can be printed to PDF
// In production, use @react-pdf/renderer or puppeteer for proper PDF generation

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

    // Fetch data
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

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount)
    }

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('de-DE')
    }

    // Generate HTML document
    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Angebot - ${project.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      padding: 2cm;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3cm;
    }
    .company-info {
      text-align: left;
    }
    .company-name {
      font-size: 14pt;
      font-weight: bold;
      color: #1a56db;
    }
    .company-details {
      font-size: 9pt;
      color: #666;
      margin-top: 0.5cm;
    }
    .document-info {
      text-align: right;
    }
    .document-title {
      font-size: 24pt;
      font-weight: bold;
      color: #1a56db;
      margin-bottom: 0.5cm;
    }
    .document-number {
      font-size: 10pt;
      color: #666;
    }
    .recipient {
      margin-bottom: 2cm;
    }
    .recipient-label {
      font-size: 8pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .recipient-name {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 0.3cm;
    }
    .project-info {
      background: #f8fafc;
      padding: 1cm;
      border-radius: 4px;
      margin-bottom: 1.5cm;
    }
    .project-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 0.5cm;
    }
    .project-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5cm;
      font-size: 10pt;
    }
    .intro-text {
      margin-bottom: 1.5cm;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5cm;
    }
    th {
      background: #1a56db;
      color: white;
      padding: 0.4cm;
      text-align: left;
      font-weight: 600;
    }
    th:nth-child(3), th:nth-child(5), th:nth-child(6) {
      text-align: right;
    }
    td {
      padding: 0.3cm 0.4cm;
      border-bottom: 1px solid #e5e7eb;
    }
    td:nth-child(3), td:nth-child(5), td:nth-child(6) {
      text-align: right;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .totals {
      margin-left: auto;
      width: 50%;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.3cm 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .total-row.final {
      font-weight: bold;
      font-size: 14pt;
      border-bottom: 2px solid #1a56db;
      border-top: 2px solid #1a56db;
      background: #f0f7ff;
      padding: 0.5cm;
      margin-top: 0.5cm;
    }
    .terms {
      margin-top: 2cm;
      font-size: 9pt;
      color: #666;
    }
    .terms h3 {
      font-size: 10pt;
      color: #333;
      margin-bottom: 0.5cm;
    }
    .signature {
      margin-top: 3cm;
      display: flex;
      justify-content: space-between;
    }
    .signature-line {
      width: 40%;
      border-top: 1px solid #333;
      padding-top: 0.3cm;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
    .footer {
      position: fixed;
      bottom: 1cm;
      left: 2cm;
      right: 2cm;
      font-size: 8pt;
      color: #999;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      padding-top: 0.5cm;
    }
    @media print {
      body {
        padding: 0;
      }
      .footer {
        position: fixed;
        bottom: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">${company?.name || 'Firma'}</div>
      <div class="company-details">
        ${company?.street || ''}<br>
        ${company?.zip_code || ''} ${company?.city || ''}<br>
        ${company?.phone ? `Tel: ${company.phone}<br>` : ''}
        ${company?.email || ''}
      </div>
    </div>
    <div class="document-info">
      <div class="document-title">ANGEBOT</div>
      <div class="document-number">
        Nr.: ${offerDraft?.offer_number || '-'}<br>
        Datum: ${formatDate(new Date().toISOString())}
      </div>
    </div>
  </div>

  <div class="recipient">
    <div class="recipient-label">Auftraggeber</div>
    <div class="recipient-name">${project.client_name}</div>
    ${project.client_contact ? `<div>z.Hd. ${project.client_contact}</div>` : ''}
  </div>

  <div class="project-info">
    <div class="project-title">Projekt: ${project.title}</div>
    <div class="project-details">
      <div><strong>Bauvorhaben:</strong> ${project.site_street || ''}, ${project.site_zip_code || ''} ${project.site_city || ''}</div>
      ${project.submission_deadline ? `<div><strong>Abgabefrist:</strong> ${formatDate(project.submission_deadline)}</div>` : ''}
    </div>
  </div>

  <div class="intro-text">
    <p>Sehr geehrte Damen und Herren,</p>
    <p style="margin-top: 0.5cm;">
      vielen Dank für Ihre Anfrage. Für die oben genannten Leistungen unterbreiten wir Ihnen folgendes Angebot:
    </p>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 8%">Pos.</th>
        <th style="width: 40%">Beschreibung</th>
        <th style="width: 12%">Menge</th>
        <th style="width: 10%">Einheit</th>
        <th style="width: 15%">EP</th>
        <th style="width: 15%">GP</th>
      </tr>
    </thead>
    <tbody>
      ${(offerDraft?.offer_line_items || []).map((item: any) => `
        <tr>
          <td>${item.position_number}</td>
          <td>${item.title}</td>
          <td>${item.quantity.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
          <td>${item.unit}</td>
          <td>${formatCurrency(item.unit_price)}</td>
          <td>${formatCurrency(item.quantity * item.unit_price)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Zwischensumme netto:</span>
      <span>${formatCurrency(offerDraft?.subtotal_net || 0)}</span>
    </div>
    ${offerDraft?.markup_percent > 0 ? `
    <div class="total-row">
      <span>Zuschlag (${offerDraft.markup_percent}%):</span>
      <span>${formatCurrency(offerDraft.markup_amount || 0)}</span>
    </div>
    ` : ''}
    <div class="total-row">
      <span>Nettosumme:</span>
      <span>${formatCurrency(offerDraft?.total_net || 0)}</span>
    </div>
    <div class="total-row">
      <span>MwSt. (${offerDraft?.vat_percent || 19}%):</span>
      <span>${formatCurrency(offerDraft?.vat_amount || 0)}</span>
    </div>
    <div class="total-row final">
      <span>Gesamtbetrag brutto:</span>
      <span>${formatCurrency(offerDraft?.total_gross || 0)}</span>
    </div>
  </div>

  <div class="terms">
    <h3>Zahlungsbedingungen & Hinweise</h3>
    <ul style="margin-left: 1cm; margin-top: 0.3cm;">
      <li>Zahlbar innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug</li>
      <li>Dieses Angebot ist ${offerDraft?.validity_days || 30} Tage gültig</li>
      <li>Es gelten unsere allgemeinen Geschäftsbedingungen</li>
      <li>Preise verstehen sich ab Baustelle</li>
    </ul>
  </div>

  <div class="signature">
    <div class="signature-line">Ort, Datum</div>
    <div class="signature-line">Unterschrift</div>
  </div>

  <div class="footer">
    ${company?.name || ''} | ${company?.street || ''}, ${company?.zip_code || ''} ${company?.city || ''} | ${company?.email || ''}
    ${company?.vat_id ? `| USt-IdNr.: ${company.vat_id}` : ''}
  </div>
</body>
</html>
    `

    // Return HTML with print-to-PDF instruction
    // For production, use puppeteer or similar to generate actual PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // 'Content-Type': 'application/pdf',
        // 'Content-Disposition': `attachment; filename="Angebot_${project.title.replace(/\s+/g, '_')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
