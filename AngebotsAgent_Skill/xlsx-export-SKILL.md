# Excel (XLSX) Generation and Export

## Overview
This skill covers generating professional Excel spreadsheets for construction offers, including line items, formulas, formatting, and multi-sheet workbooks. Supports both Node.js (ExcelJS) and Python (openpyxl) implementations.

## When to Use
- Generating offer/quote spreadsheets with line items
- Creating formatted price lists with formulas
- Building multi-sheet workbooks (summary + details)
- Exporting data with German number/currency formatting
- Creating professional construction bid documents

## Technology Options

| Library | Language | Strengths | Best For |
|---------|----------|-----------|----------|
| **ExcelJS** | Node.js | Streaming, styles, formulas | Next.js integration |
| **xlsx/SheetJS** | Node.js | Fast, lightweight | Simple exports |
| **openpyxl** | Python | Full Excel features | Complex formatting |
| **xlsxwriter** | Python | Charts, performance | Large datasets |

**Recommendation for AngebotsAgent**: Use **ExcelJS** for direct integration with Next.js API routes.

## Project Structure

```
├── lib/
│   └── excel/
│       ├── workbook-builder.ts    # Main workbook generator
│       ├── styles.ts              # Reusable cell styles
│       ├── templates/
│       │   ├── offer-template.ts  # Offer workbook template
│       │   └── price-list.ts      # Price library template
│       └── utils.ts               # Helper functions
├── app/
│   └── api/
│       └── export/
│           └── xlsx/
│               └── route.ts       # Export API endpoint
```

## Installation

```bash
npm install exceljs
```

## Core Implementation

### 1. Reusable Styles (`lib/excel/styles.ts`)

```typescript
import ExcelJS from 'exceljs';

export const COLORS = {
  primary: 'FF2563EB',      // Blue
  primaryLight: 'FFDBEAFE', // Light blue
  success: 'FF10B981',      // Green
  warning: 'FFF59E0B',      // Yellow
  danger: 'FFEF4444',       // Red
  gray: 'FF6B7280',
  grayLight: 'FFF3F4F6',
  white: 'FFFFFFFF',
  black: 'FF000000',
};

export const FONTS = {
  header: {
    name: 'Arial',
    size: 14,
    bold: true,
    color: { argb: COLORS.primary },
  },
  subheader: {
    name: 'Arial',
    size: 11,
    bold: true,
  },
  normal: {
    name: 'Arial',
    size: 10,
  },
  small: {
    name: 'Arial',
    size: 9,
    color: { argb: COLORS.gray },
  },
};

export const BORDERS: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
};

export const THICK_BORDER_BOTTOM: Partial<ExcelJS.Borders> = {
  ...BORDERS,
  bottom: { style: 'medium', color: { argb: COLORS.primary } },
};

export function applyHeaderStyle(row: ExcelJS.Row): void {
  row.font = FONTS.subheader;
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primaryLight },
  };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
  row.height = 24;
  row.eachCell((cell) => {
    cell.border = THICK_BORDER_BOTTOM;
  });
}

export function applyDataRowStyle(row: ExcelJS.Row, isAlternate: boolean): void {
  row.font = FONTS.normal;
  row.alignment = { vertical: 'middle' };
  if (isAlternate) {
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.grayLight },
    };
  }
  row.eachCell((cell) => {
    cell.border = BORDERS;
  });
}

export function applyTotalRowStyle(row: ExcelJS.Row): void {
  row.font = { ...FONTS.subheader, color: { argb: COLORS.white } };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.primary },
  };
  row.alignment = { vertical: 'middle' };
  row.height = 28;
}

// German number format
export const NUMBER_FORMATS = {
  currency: '#,##0.00 €',
  currencyNegative: '#,##0.00 €;[Red]-#,##0.00 €',
  quantity: '#,##0.000',
  quantityShort: '#,##0.00',
  percent: '0.00%',
  date: 'DD.MM.YYYY',
};
```

### 2. Offer Workbook Generator (`lib/excel/templates/offer-template.ts`)

```typescript
import ExcelJS from 'exceljs';
import {
  applyHeaderStyle,
  applyDataRowStyle,
  applyTotalRowStyle,
  FONTS,
  COLORS,
  NUMBER_FORMATS,
} from '../styles';

export interface OfferLineItem {
  position: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface OfferData {
  // Company info
  companyName: string;
  companyAddress: string;
  companyVat?: string;
  
  // Project info
  projectName: string;
  clientName: string;
  projectLocation?: string;
  offerDate: Date;
  validUntil: Date;
  offerNumber: string;
  
  // Line items
  lineItems: OfferLineItem[];
  
  // Pricing
  vatRate: number; // e.g., 0.19 for 19%
  
  // Optional sections
  assumptions?: string[];
  exclusions?: string[];
}

export interface RiskFlag {
  type: 'quantity_mismatch' | 'missing_detail' | 'conflicting_docs';
  title: string;
  description: string;
  sourceReference: string;
  recommendedQuestion?: string;
}

export async function generateOfferWorkbook(
  data: OfferData,
  riskFlags?: RiskFlag[],
  language: 'de' | 'en' = 'de'
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = data.companyName;
  workbook.created = new Date();
  
  // Set German locale for number formatting
  workbook.calcProperties.fullCalcOnLoad = true;

  // Create sheets
  const summarySheet = workbook.addWorksheet(
    language === 'de' ? 'Zusammenfassung' : 'Summary'
  );
  const lineItemsSheet = workbook.addWorksheet(
    language === 'de' ? 'Positionen' : 'Line Items'
  );
  
  if (riskFlags && riskFlags.length > 0) {
    const risksSheet = workbook.addWorksheet(
      language === 'de' ? 'Nachtragspotenziale' : 'Risk Flags'
    );
    buildRisksSheet(risksSheet, riskFlags, language);
  }

  // Build sheets
  buildSummarySheet(summarySheet, data, language);
  buildLineItemsSheet(lineItemsSheet, data, language);

  return workbook;
}

function buildSummarySheet(
  sheet: ExcelJS.Worksheet,
  data: OfferData,
  lang: 'de' | 'en'
): void {
  const labels = lang === 'de' ? {
    offer: 'Angebot',
    offerNumber: 'Angebots-Nr.',
    date: 'Datum',
    validUntil: 'Gültig bis',
    client: 'Auftraggeber',
    project: 'Projekt',
    location: 'Standort',
    subtotal: 'Zwischensumme',
    vat: 'MwSt.',
    total: 'Gesamtsumme',
    assumptions: 'Annahmen',
    exclusions: 'Ausschlüsse',
  } : {
    offer: 'Offer',
    offerNumber: 'Offer No.',
    date: 'Date',
    validUntil: 'Valid Until',
    client: 'Client',
    project: 'Project',
    location: 'Location',
    subtotal: 'Subtotal',
    vat: 'VAT',
    total: 'Grand Total',
    assumptions: 'Assumptions',
    exclusions: 'Exclusions',
  };

  // Column widths
  sheet.columns = [
    { width: 20 },
    { width: 40 },
    { width: 15 },
    { width: 15 },
  ];

  let rowNum = 1;

  // Company header
  const titleRow = sheet.getRow(rowNum++);
  titleRow.getCell(1).value = data.companyName;
  titleRow.getCell(1).font = { ...FONTS.header, size: 16 };
  sheet.mergeCells(`A${rowNum - 1}:D${rowNum - 1}`);

  const addressRow = sheet.getRow(rowNum++);
  addressRow.getCell(1).value = data.companyAddress;
  addressRow.getCell(1).font = FONTS.small;
  sheet.mergeCells(`A${rowNum - 1}:D${rowNum - 1}`);

  if (data.companyVat) {
    const vatRow = sheet.getRow(rowNum++);
    vatRow.getCell(1).value = `USt-IdNr.: ${data.companyVat}`;
    vatRow.getCell(1).font = FONTS.small;
  }

  rowNum++; // Empty row

  // Offer title
  const offerTitleRow = sheet.getRow(rowNum++);
  offerTitleRow.getCell(1).value = labels.offer;
  offerTitleRow.getCell(1).font = FONTS.header;

  // Offer details
  const details = [
    [labels.offerNumber, data.offerNumber],
    [labels.date, data.offerDate],
    [labels.validUntil, data.validUntil],
    [labels.client, data.clientName],
    [labels.project, data.projectName],
  ];
  
  if (data.projectLocation) {
    details.push([labels.location, data.projectLocation]);
  }

  for (const [label, value] of details) {
    const row = sheet.getRow(rowNum++);
    row.getCell(1).value = label;
    row.getCell(1).font = FONTS.subheader;
    row.getCell(2).value = value instanceof Date 
      ? value.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB')
      : value;
    row.getCell(2).font = FONTS.normal;
  }

  rowNum++; // Empty row

  // Calculate totals
  const subtotal = data.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const vatAmount = subtotal * data.vatRate;
  const total = subtotal + vatAmount;

  // Totals section
  const totalsData = [
    [labels.subtotal, subtotal],
    [`${labels.vat} (${(data.vatRate * 100).toFixed(0)}%)`, vatAmount],
    [labels.total, total],
  ];

  for (let i = 0; i < totalsData.length; i++) {
    const [label, value] = totalsData[i];
    const row = sheet.getRow(rowNum++);
    row.getCell(1).value = label;
    row.getCell(2).value = value;
    row.getCell(2).numFmt = NUMBER_FORMATS.currency;
    
    if (i === totalsData.length - 1) {
      applyTotalRowStyle(row);
    } else {
      row.font = FONTS.normal;
    }
  }

  rowNum++; // Empty row

  // Assumptions
  if (data.assumptions && data.assumptions.length > 0) {
    const assumptionsHeader = sheet.getRow(rowNum++);
    assumptionsHeader.getCell(1).value = labels.assumptions;
    assumptionsHeader.getCell(1).font = FONTS.subheader;
    
    for (const assumption of data.assumptions) {
      const row = sheet.getRow(rowNum++);
      row.getCell(1).value = `• ${assumption}`;
      row.getCell(1).font = FONTS.normal;
      sheet.mergeCells(`A${rowNum - 1}:D${rowNum - 1}`);
    }
    rowNum++;
  }

  // Exclusions
  if (data.exclusions && data.exclusions.length > 0) {
    const exclusionsHeader = sheet.getRow(rowNum++);
    exclusionsHeader.getCell(1).value = labels.exclusions;
    exclusionsHeader.getCell(1).font = FONTS.subheader;
    
    for (const exclusion of data.exclusions) {
      const row = sheet.getRow(rowNum++);
      row.getCell(1).value = `• ${exclusion}`;
      row.getCell(1).font = FONTS.normal;
      sheet.mergeCells(`A${rowNum - 1}:D${rowNum - 1}`);
    }
  }
}

function buildLineItemsSheet(
  sheet: ExcelJS.Worksheet,
  data: OfferData,
  lang: 'de' | 'en'
): void {
  const headers = lang === 'de'
    ? ['Pos.', 'Beschreibung', 'Einheit', 'Menge', 'EP (€)', 'Gesamt (€)', 'Anmerkungen']
    : ['Pos.', 'Description', 'Unit', 'Quantity', 'Unit Price (€)', 'Total (€)', 'Notes'];

  // Column configuration
  sheet.columns = [
    { key: 'position', width: 8 },
    { key: 'description', width: 45 },
    { key: 'unit', width: 10 },
    { key: 'quantity', width: 12 },
    { key: 'unitPrice', width: 14 },
    { key: 'total', width: 14 },
    { key: 'notes', width: 30 },
  ];

  // Header row
  const headerRow = sheet.getRow(1);
  headers.forEach((header, idx) => {
    headerRow.getCell(idx + 1).value = header;
  });
  applyHeaderStyle(headerRow);

  // Data rows
  let rowNum = 2;
  for (const item of data.lineItems) {
    const row = sheet.getRow(rowNum);
    const total = item.quantity * item.unitPrice;
    
    row.getCell(1).value = item.position;
    row.getCell(1).alignment = { horizontal: 'center' };
    
    row.getCell(2).value = item.description;
    row.getCell(2).alignment = { wrapText: true };
    
    row.getCell(3).value = item.unit;
    row.getCell(3).alignment = { horizontal: 'center' };
    
    row.getCell(4).value = item.quantity;
    row.getCell(4).numFmt = NUMBER_FORMATS.quantityShort;
    row.getCell(4).alignment = { horizontal: 'right' };
    
    row.getCell(5).value = item.unitPrice;
    row.getCell(5).numFmt = NUMBER_FORMATS.currency;
    row.getCell(5).alignment = { horizontal: 'right' };
    
    // Formula for total
    row.getCell(6).value = { formula: `D${rowNum}*E${rowNum}` };
    row.getCell(6).numFmt = NUMBER_FORMATS.currency;
    row.getCell(6).alignment = { horizontal: 'right' };
    
    row.getCell(7).value = item.notes || '';
    row.getCell(7).font = FONTS.small;
    row.getCell(7).alignment = { wrapText: true };

    applyDataRowStyle(row, rowNum % 2 === 0);
    rowNum++;
  }

  // Subtotal row
  const subtotalRow = sheet.getRow(rowNum++);
  subtotalRow.getCell(5).value = lang === 'de' ? 'Zwischensumme:' : 'Subtotal:';
  subtotalRow.getCell(5).font = FONTS.subheader;
  subtotalRow.getCell(5).alignment = { horizontal: 'right' };
  subtotalRow.getCell(6).value = { formula: `SUM(F2:F${rowNum - 2})` };
  subtotalRow.getCell(6).numFmt = NUMBER_FORMATS.currency;
  subtotalRow.getCell(6).font = FONTS.subheader;

  // VAT row
  const vatRow = sheet.getRow(rowNum++);
  vatRow.getCell(5).value = `${lang === 'de' ? 'MwSt.' : 'VAT'} (${(data.vatRate * 100).toFixed(0)}%):`;
  vatRow.getCell(5).font = FONTS.normal;
  vatRow.getCell(5).alignment = { horizontal: 'right' };
  vatRow.getCell(6).value = { formula: `F${rowNum - 2}*${data.vatRate}` };
  vatRow.getCell(6).numFmt = NUMBER_FORMATS.currency;

  // Grand total row
  const totalRow = sheet.getRow(rowNum);
  totalRow.getCell(5).value = lang === 'de' ? 'Gesamtsumme:' : 'Grand Total:';
  totalRow.getCell(6).value = { formula: `F${rowNum - 2}+F${rowNum - 1}` };
  totalRow.getCell(6).numFmt = NUMBER_FORMATS.currency;
  applyTotalRowStyle(totalRow);

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  
  // Auto-filter
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: data.lineItems.length + 1, column: 7 },
  };
}

function buildRisksSheet(
  sheet: ExcelJS.Worksheet,
  flags: RiskFlag[],
  lang: 'de' | 'en'
): void {
  const headers = lang === 'de'
    ? ['Typ', 'Titel', 'Beschreibung', 'Quelle', 'Empfohlene Frage']
    : ['Type', 'Title', 'Description', 'Source', 'Recommended Question'];

  const typeLabels = lang === 'de' ? {
    quantity_mismatch: 'Mengenabweichung',
    missing_detail: 'Fehlende Angabe',
    conflicting_docs: 'Widerspruch',
  } : {
    quantity_mismatch: 'Quantity Mismatch',
    missing_detail: 'Missing Detail',
    conflicting_docs: 'Conflicting Docs',
  };

  sheet.columns = [
    { width: 18 },
    { width: 25 },
    { width: 40 },
    { width: 25 },
    { width: 40 },
  ];

  // Header
  const headerRow = sheet.getRow(1);
  headers.forEach((h, i) => headerRow.getCell(i + 1).value = h);
  applyHeaderStyle(headerRow);

  // Data
  flags.forEach((flag, idx) => {
    const row = sheet.getRow(idx + 2);
    row.getCell(1).value = typeLabels[flag.type];
    row.getCell(2).value = flag.title;
    row.getCell(3).value = flag.description;
    row.getCell(3).alignment = { wrapText: true };
    row.getCell(4).value = flag.sourceReference;
    row.getCell(5).value = flag.recommendedQuestion || '';
    row.getCell(5).alignment = { wrapText: true };
    
    applyDataRowStyle(row, idx % 2 === 1);
    
    // Color code by type
    const typeColors = {
      quantity_mismatch: COLORS.warning,
      missing_detail: COLORS.gray,
      conflicting_docs: COLORS.danger,
    };
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: typeColors[flag.type] },
    };
    row.getCell(1).font = { ...FONTS.normal, color: { argb: COLORS.white } };
  });
}

// Utility to convert workbook to buffer
export async function workbookToBuffer(
  workbook: ExcelJS.Workbook
): Promise<Buffer> {
  return workbook.xlsx.writeBuffer() as Promise<Buffer>;
}
```

### 3. API Export Route (`app/api/export/xlsx/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  generateOfferWorkbook, 
  workbookToBuffer,
  type OfferData,
  type RiskFlag 
} from '@/lib/excel/templates/offer-template';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { offerId, language = 'de' } = body;

    if (!offerId) {
      return NextResponse.json(
        { error: 'Offer ID required' },
        { status: 400 }
      );
    }

    // Fetch offer data with relations
    const { data: offer, error: offerError } = await supabase
      .from('offer_drafts')
      .select(`
        *,
        project:projects(*),
        line_items:offer_line_items(*)
      `)
      .eq('id', offerId)
      .single();

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Fetch company data
    const { data: userData } = await supabase
      .from('users')
      .select('company:companies(*)')
      .eq('id', user.id)
      .single();

    // Fetch risk flags
    const { data: riskFlags } = await supabase
      .from('risk_flags')
      .select('*')
      .eq('offer_draft_id', offerId);

    // Build offer data structure
    const offerData: OfferData = {
      companyName: userData?.company?.name || 'Company',
      companyAddress: userData?.company?.address || '',
      companyVat: userData?.company?.vat_number,
      projectName: offer.project.title,
      clientName: offer.project.client_name || '',
      projectLocation: offer.project.location,
      offerDate: new Date(),
      validUntil: new Date(Date.now() + (offer.validity_days || 30) * 24 * 60 * 60 * 1000),
      offerNumber: `ANG-${offer.project.id.slice(0, 8).toUpperCase()}-${offer.version}`,
      lineItems: offer.line_items.map((item: any) => ({
        position: item.position_number,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        notes: item.notes,
      })),
      vatRate: (offer.vat_rate || 19) / 100,
      assumptions: offer.assumptions || [],
      exclusions: offer.exclusions || [],
    };

    // Transform risk flags
    const flags: RiskFlag[] = (riskFlags || []).map((f: any) => ({
      type: f.flag_type,
      title: f.title,
      description: f.description,
      sourceReference: f.source_references?.[0]?.excerpt || '',
      recommendedQuestion: f.recommended_question,
    }));

    // Generate workbook
    const workbook = await generateOfferWorkbook(offerData, flags, language);
    const buffer = await workbookToBuffer(workbook);

    // Return file
    const filename = `Angebot_${offer.project.title.replace(/[^a-zA-Z0-9]/g, '_')}_${
      new Date().toISOString().split('T')[0]
    }.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}
```

### 4. Client-Side Download Hook

```typescript
// hooks/useExcelExport.ts
'use client';

import { useState } from 'react';

export function useExcelExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportOffer = async (offerId: string, language: 'de' | 'en' = 'de') => {
    setExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/export/xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      // Get filename from header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || 'offer.xlsx';

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return { exportOffer, exporting, error };
}
```

### 5. Export Button Component

```typescript
'use client';

import { useExcelExport } from '@/hooks/useExcelExport';
import { useTranslations, useLocale } from 'next-intl';

export function ExportButton({ offerId }: { offerId: string }) {
  const { exportOffer, exporting, error } = useExcelExport();
  const t = useTranslations('export');
  const locale = useLocale() as 'de' | 'en';

  return (
    <div>
      <button
        onClick={() => exportOffer(offerId, locale)}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {exporting ? (
          <>
            <span className="animate-spin">⏳</span>
            {t('generating')}
          </>
        ) : (
          <>
            📊 {t('downloadExcel')}
          </>
        )}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
```

## Python Alternative (openpyxl)

For complex Excel features or integration with Python PDF service:

```python
from openpyxl import Workbook
from openpyxl.styles import Font, Fill, Border, Alignment, PatternFill
from openpyxl.utils import get_column_letter
from io import BytesIO

def generate_offer_xlsx(data: dict, language: str = 'de') -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Positionen" if language == 'de' else "Line Items"
    
    # Headers
    headers = ['Pos.', 'Beschreibung', 'Einheit', 'Menge', 'EP (€)', 'Gesamt (€)']
    header_font = Font(bold=True, color='FFFFFF')
    header_fill = PatternFill(start_color='2563EB', end_color='2563EB', fill_type='solid')
    
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center')
    
    # Data rows
    for row_idx, item in enumerate(data['line_items'], 2):
        ws.cell(row=row_idx, column=1, value=item['position'])
        ws.cell(row=row_idx, column=2, value=item['description'])
        ws.cell(row=row_idx, column=3, value=item['unit'])
        ws.cell(row=row_idx, column=4, value=item['quantity'])
        ws.cell(row=row_idx, column=5, value=item['unit_price'])
        ws.cell(row=row_idx, column=6, value=f'=D{row_idx}*E{row_idx}')
    
    # Column widths
    ws.column_dimensions['B'].width = 40
    
    # Save to bytes
    output = BytesIO()
    wb.save(output)
    return output.getvalue()
```

## Best Practices

1. **Use formulas**: Let Excel calculate totals, not pre-computed values
2. **German formatting**: Use `,` as decimal separator, `.` as thousands
3. **Freeze header rows**: Improves usability for large sheets
4. **Add auto-filters**: Makes data exploration easier
5. **Include metadata**: Creator, creation date, version
6. **Consistent styling**: Use a style system for maintainability
7. **Error handling**: Validate data before generation

## Common Issues

| Issue | Solution |
|-------|----------|
| Numbers as text | Set `numFmt` explicitly |
| Broken formulas | Use proper cell references |
| Wrong encoding | Use UTF-8 throughout |
| Large files slow | Stream writes, minimize styles |
| Dates wrong | Convert to Excel date format |

## Checklist

- [ ] Install ExcelJS
- [ ] Create reusable styles module
- [ ] Implement offer template generator
- [ ] Create API export endpoint
- [ ] Add client download hook
- [ ] Test German number formatting
- [ ] Verify formulas calculate correctly
- [ ] Test with real offer data
- [ ] Add risk flags sheet
- [ ] Support both DE and EN exports
