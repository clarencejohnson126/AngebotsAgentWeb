/**
 * Preisspiegel Excel Generator - Based on Real Document Analysis
 *
 * Generates price comparison spreadsheets in the exact format used
 * by German construction companies for comparing subcontractor bids.
 *
 * Structure discovered from real files:
 * - Fixed columns A-E: Pos, Kurz-Info, Beschreibung, Menge, EH
 * - Repeating columns per bidder: EP (unit price), GP (gross price)
 * - Header rows 1-8: Project and bidder info
 * - Row 9: Column headers
 * - Row 10+: Data rows
 */

import ExcelJS from 'exceljs';
import type { Preisspiegel, PreisspiegelZeile, Bieter, Einheit } from './types';
import { formatGermanNumber, formatGermanCurrency } from './lv-parser';

// =============================================================================
// EXCEL STYLES - Based on Real Preisspiegel Files
// =============================================================================

const COLORS = {
  headerBg: 'FF4472C4',      // Blue header
  headerText: 'FFFFFFFF',    // White text
  alternateBg: 'FFF2F2F2',   // Light gray alternating rows
  borderColor: 'FFD9D9D9',   // Light gray borders
  highlightLow: 'FF92D050',  // Green - lowest price
  highlightHigh: 'FFFF6B6B', // Red - highest price
};

const FONTS = {
  header: { name: 'Arial', size: 10, bold: true, color: { argb: COLORS.headerText } },
  subheader: { name: 'Arial', size: 9, bold: true },
  normal: { name: 'Arial', size: 9 },
  small: { name: 'Arial', size: 8, color: { argb: 'FF666666' } },
};

const BORDERS: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLORS.borderColor } },
  left: { style: 'thin', color: { argb: COLORS.borderColor } },
  bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
  right: { style: 'thin', color: { argb: COLORS.borderColor } },
};

// =============================================================================
// COLUMN DEFINITIONS
// =============================================================================

interface ColumnDef {
  header: string;
  key: string;
  width: number;
  style?: Partial<ExcelJS.Style>;
}

/**
 * Fixed columns (A-E) present in all Preisspiegel
 */
const FIXED_COLUMNS: ColumnDef[] = [
  { header: 'Pos.', key: 'position', width: 15 },
  { header: 'Kurz-Info', key: 'kurzInfo', width: 10 },
  { header: 'Beschreibung', key: 'beschreibung', width: 50 },
  { header: 'Menge', key: 'menge', width: 12 },
  { header: 'EH', key: 'einheit', width: 6 },
];

/**
 * Generate columns for a single bidder (EP + GP)
 */
function getBidderColumns(bieterName: string, index: number): ColumnDef[] {
  const baseCol = 6 + (index * 2); // Starting from column F (6)
  return [
    {
      header: 'EP',
      key: `ep_${index}`,
      width: 12,
      style: { numFmt: '#,##0.00 €' },
    },
    {
      header: 'GP',
      key: `gp_${index}`,
      width: 14,
      style: { numFmt: '#,##0.00 €' },
    },
  ];
}

// =============================================================================
// WORKBOOK GENERATOR
// =============================================================================

export interface PreisspiegelOptions {
  /** Highlight lowest price per row */
  highlightLowest?: boolean;
  /** Highlight highest price per row */
  highlightHighest?: boolean;
  /** Include subtotals per section */
  includeSubtotals?: boolean;
  /** Include formulas for GP calculation */
  includeFormulas?: boolean;
}

/**
 * Generate a Preisspiegel Excel workbook
 */
export async function generatePreisspiegel(
  data: Preisspiegel,
  options: PreisspiegelOptions = {}
): Promise<ExcelJS.Workbook> {
  const {
    highlightLowest = true,
    highlightHighest = false,
    includeSubtotals = true,
    includeFormulas = true,
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AngebotsAgent';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Preisspiegel', {
    views: [{ state: 'frozen', xSplit: 5, ySplit: 9 }], // Freeze first 5 cols and 9 rows
  });

  // Build column definitions
  const allColumns: ColumnDef[] = [
    ...FIXED_COLUMNS,
    ...data.bieter.flatMap((b, i) => getBidderColumns(b.name, i)),
  ];

  // Set column properties
  sheet.columns = allColumns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
    style: col.style,
  }));

  // ==========================================================================
  // HEADER SECTION (Rows 1-8)
  // ==========================================================================

  // Row 1: Project name
  sheet.getCell('A1').value = `Preisspiegel: ${data.projektName}`;
  sheet.getCell('A1').font = { ...FONTS.header, size: 12 };
  sheet.mergeCells('A1:E1');

  // Row 2: Project number and date
  sheet.getCell('A2').value = `Projekt-Nr.: ${data.projektNummer}`;
  sheet.getCell('C2').value = `Stand: ${data.datum.toLocaleDateString('de-DE')}`;

  // Row 3: Trade
  sheet.getCell('A3').value = `Gewerk: ${data.gewerk}`;

  // Rows 4-8: Bidder info headers
  const bieterStartCol = 6; // Column F
  data.bieter.forEach((bieter, index) => {
    const col = bieterStartCol + (index * 2);
    const colLetter = getColumnLetter(col);

    // Bidder name (merged across EP/GP columns)
    sheet.mergeCells(`${colLetter}4:${getColumnLetter(col + 1)}4`);
    sheet.getCell(`${colLetter}4`).value = bieter.name;
    sheet.getCell(`${colLetter}4`).font = FONTS.subheader;
    sheet.getCell(`${colLetter}4`).alignment = { horizontal: 'center' };

    // Offer date
    sheet.getCell(`${colLetter}5`).value = bieter.angebotsDatum
      ? `Angebot: ${bieter.angebotsDatum.toLocaleDateString('de-DE')}`
      : '';
    sheet.mergeCells(`${colLetter}5:${getColumnLetter(col + 1)}5`);

    // Phone
    if (bieter.telefon) {
      sheet.getCell(`${colLetter}6`).value = `Tel: ${bieter.telefon}`;
      sheet.mergeCells(`${colLetter}6:${getColumnLetter(col + 1)}6`);
    }

    // Credit info
    if (bieter.kreditInfo) {
      sheet.getCell(`${colLetter}7`).value = bieter.kreditInfo;
      sheet.mergeCells(`${colLetter}7:${getColumnLetter(col + 1)}7`);
    }

    // Index info
    if (bieter.indexWert) {
      sheet.getCell(`${colLetter}8`).value = `Index: ${bieter.indexWert}`;
      sheet.mergeCells(`${colLetter}8:${getColumnLetter(col + 1)}8`);
    }
  });

  // ==========================================================================
  // COLUMN HEADERS (Row 9)
  // ==========================================================================

  const headerRow = sheet.getRow(9);

  // Fixed column headers
  FIXED_COLUMNS.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = FONTS.header;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDERS;
  });

  // Bidder column headers (EP/GP for each)
  data.bieter.forEach((bieter, bieterIndex) => {
    const epCol = bieterStartCol + (bieterIndex * 2);
    const gpCol = epCol + 1;

    // EP header
    const epCell = headerRow.getCell(epCol);
    epCell.value = 'EP';
    epCell.font = FONTS.header;
    epCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    epCell.alignment = { horizontal: 'center', vertical: 'middle' };
    epCell.border = BORDERS;

    // GP header
    const gpCell = headerRow.getCell(gpCol);
    gpCell.value = 'GP';
    gpCell.font = FONTS.header;
    gpCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    gpCell.alignment = { horizontal: 'center', vertical: 'middle' };
    gpCell.border = BORDERS;
  });

  headerRow.height = 20;

  // ==========================================================================
  // DATA ROWS (Starting Row 10)
  // ==========================================================================

  let currentRow = 10;
  let currentSection = '';

  data.zeilen.forEach((zeile, index) => {
    const row = sheet.getRow(currentRow);

    // Check for section break (based on position number prefix)
    const sectionPrefix = zeile.position.split('.').slice(0, 2).join('.');
    if (sectionPrefix !== currentSection && includeSubtotals && currentSection !== '') {
      // Add subtotal row for previous section
      // (Implementation would go here)
    }
    currentSection = sectionPrefix;

    // Fixed columns
    row.getCell(1).value = zeile.position;
    row.getCell(2).value = zeile.kurzInfo || '';
    row.getCell(3).value = zeile.beschreibung;
    row.getCell(4).value = zeile.menge;
    row.getCell(4).numFmt = '#,##0.000';
    row.getCell(5).value = zeile.einheit;

    // Bidder prices
    let lowestGP = Infinity;
    let highestGP = 0;
    const gpValues: { col: number; value: number }[] = [];

    data.bieter.forEach((bieter, bieterIndex) => {
      const epCol = bieterStartCol + (bieterIndex * 2);
      const gpCol = epCol + 1;

      const preise = zeile.preise[bieter.name];
      const ep = preise?.ep;
      const gp = preise?.gp;

      // EP cell
      const epCell = row.getCell(epCol);
      if (ep !== null && ep !== undefined) {
        epCell.value = ep;
        epCell.numFmt = '#,##0.00 €';
      } else {
        epCell.value = '';
      }
      epCell.border = BORDERS;

      // GP cell with formula or value
      const gpCell = row.getCell(gpCol);
      if (includeFormulas && ep !== null && ep !== undefined) {
        // Formula: =Menge * EP
        gpCell.value = {
          formula: `$D${currentRow}*${getColumnLetter(epCol)}${currentRow}`,
        };
      } else if (gp !== null && gp !== undefined) {
        gpCell.value = gp;
      } else {
        gpCell.value = '';
      }
      gpCell.numFmt = '#,##0.00 €';
      gpCell.border = BORDERS;

      // Track for highlighting
      if (gp !== null && gp !== undefined && gp > 0) {
        if (gp < lowestGP) lowestGP = gp;
        if (gp > highestGP) highestGP = gp;
        gpValues.push({ col: gpCol, value: gp });
      }
    });

    // Apply highlighting
    if (highlightLowest && gpValues.length > 1) {
      gpValues.forEach(({ col, value }) => {
        if (value === lowestGP) {
          row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.highlightLow },
          };
        }
      });
    }

    if (highlightHighest && gpValues.length > 1) {
      gpValues.forEach(({ col, value }) => {
        if (value === highestGP) {
          row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.highlightHigh },
          };
        }
      });
    }

    // Apply alternating row background
    if (index % 2 === 1) {
      for (let c = 1; c <= 5; c++) {
        const cell = row.getCell(c);
        if (!cell.fill || (cell.fill as ExcelJS.FillPattern).pattern !== 'solid') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.alternateBg },
          };
        }
      }
    }

    // Apply borders to fixed columns
    for (let c = 1; c <= 5; c++) {
      row.getCell(c).border = BORDERS;
    }

    row.font = FONTS.normal;
    currentRow++;
  });

  // ==========================================================================
  // TOTALS ROW
  // ==========================================================================

  currentRow++; // Empty row before totals
  const totalsRow = sheet.getRow(currentRow);

  totalsRow.getCell(3).value = 'SUMME';
  totalsRow.getCell(3).font = { ...FONTS.subheader, bold: true };

  data.bieter.forEach((bieter, bieterIndex) => {
    const gpCol = bieterStartCol + (bieterIndex * 2) + 1;
    const sumCell = totalsRow.getCell(gpCol);

    if (includeFormulas) {
      // SUM formula for GP column
      sumCell.value = {
        formula: `SUM(${getColumnLetter(gpCol)}10:${getColumnLetter(gpCol)}${currentRow - 2})`,
      };
    } else {
      sumCell.value = data.summen[bieter.name] ?? 0;
    }

    sumCell.numFmt = '#,##0.00 €';
    sumCell.font = { ...FONTS.subheader, bold: true };
    sumCell.border = {
      ...BORDERS,
      top: { style: 'double', color: { argb: COLORS.headerBg } },
    };
  });

  return workbook;
}

/**
 * Generate Preisspiegel and return as Buffer
 */
export async function generatePreisspiegelBuffer(
  data: Preisspiegel,
  options?: PreisspiegelOptions
): Promise<Buffer> {
  const workbook = await generatePreisspiegel(data, options);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get Excel column letter from 1-based index
 */
function getColumnLetter(col: number): string {
  let letter = '';
  while (col > 0) {
    const mod = (col - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    col = Math.floor((col - mod) / 26);
  }
  return letter;
}

/**
 * Generate filename for Preisspiegel
 * Pattern: YYYY-MM-DD_PS_[Gewerk]_[status].xlsx
 */
export function generatePreisspiegelFilename(data: Preisspiegel): string {
  const dateStr = data.datum.toISOString().split('T')[0];
  const gewerk = data.gewerk.charAt(0).toUpperCase() + data.gewerk.slice(1);
  return `${dateStr}_PS_${gewerk}_${data.status}.xlsx`;
}
