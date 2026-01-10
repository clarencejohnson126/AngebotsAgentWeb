/**
 * LV Position Parser - Based on Real Document Analysis
 *
 * Parses German Leistungsverzeichnis position numbers and text
 * from various formats found in real tender documents.
 */

import type { PositionNumber, LVPosition, Einheit, LVMarker } from './types';

// =============================================================================
// POSITION NUMBER PATTERNS
// =============================================================================

/**
 * Regular expressions for position number formats found in real LVs
 *
 * Examples from real documents:
 * - Abdichtung: "04.02.03..0010." (double dot before position)
 * - Trockenbau: "01.01.01.0010." (4-digit position)
 * - Estrich: "01.01.01.010" (3-digit position)
 * - Bodenbelag: "01.01.01.010" (3-digit position)
 */
const POSITION_PATTERNS = [
  // Pattern 1: Double dot format (Abdichtung style)
  // "04.02.03..0010." -> level1=04, level2=02, level3=03, position=0010
  /^(\d{2})\.(\d{2})\.(\d{2})\.\.(\d{4})\.?$/,

  // Pattern 2: 4-digit position (Trockenbau style)
  // "01.01.01.0010." -> level1=01, level2=01, level3=01, position=0010
  /^(\d{2})\.(\d{2})\.(\d{2})\.(\d{4})\.?$/,

  // Pattern 3: 3-digit position (Estrich/Bodenbelag style)
  // "01.01.01.010" -> level1=01, level2=01, level3=01, position=010
  /^(\d{2})\.(\d{2})\.(\d{2})\.(\d{3})$/,

  // Pattern 4: Section header (no position number)
  // "0402" or "040203" -> hierarchy only
  /^(\d{2})(\d{2})?(\d{2})?$/,

  // Pattern 5: Alternative with spaces
  // "01.01.01. 0010" -> with space before position
  /^(\d{2})\.(\d{2})\.(\d{2})\.\s*(\d{3,4})\.?$/,
];

/**
 * Parse a position number string into structured components
 */
export function parsePositionNumber(positionStr: string): PositionNumber | null {
  const cleaned = positionStr.trim();

  for (const pattern of POSITION_PATTERNS) {
    const match = cleaned.match(pattern);
    if (match) {
      const [, level1, level2, level3, position] = match;

      return {
        full: cleaned,
        level1: level1 || '',
        level2: level2 || '',
        level3: level3 || '',
        position: position || '',
        depth: [level1, level2, level3, position].filter(Boolean).length,
      };
    }
  }

  // If no pattern matches, try to extract what we can
  const parts = cleaned.replace(/\.\./g, '.').split('.').filter(Boolean);
  if (parts.length > 0) {
    return {
      full: cleaned,
      level1: parts[0] || '',
      level2: parts[1] || '',
      level3: parts[2] || '',
      position: parts[3] || '',
      depth: parts.length,
    };
  }

  return null;
}

/**
 * Check if a string looks like a position number
 */
export function isPositionNumber(text: string): boolean {
  return POSITION_PATTERNS.some(pattern => pattern.test(text.trim()));
}

/**
 * Get hierarchy level from position string
 * Returns 1-4 based on depth
 */
export function getHierarchyLevel(positionStr: string): number {
  const parsed = parsePositionNumber(positionStr);
  return parsed?.depth ?? 0;
}

// =============================================================================
// UNIT PARSING
// =============================================================================

/**
 * Unit patterns found in real LVs
 */
const UNIT_MAPPINGS: Record<string, Einheit> = {
  // Square meters
  'm²': 'm2',
  'm2': 'm2',
  'qm': 'm2',
  'QM': 'm2',

  // Linear meters
  'm': 'm',
  'lfm': 'lfm',
  'Lfm': 'lfm',
  'lfdm': 'lfm',

  // Cubic meters
  'm³': 'm3',
  'm3': 'm3',
  'cbm': 'm3',

  // Pieces
  'Stk': 'Stk',
  'Stk.': 'Stk',
  'Stück': 'Stk',
  'St': 'St',
  'St.': 'St',

  // Weight
  'kg': 'kg',
  'Kg': 'kg',

  // Time
  'h': 'h',
  'Std': 'Std',
  'Std.': 'Std',
  'Tag': 'Tag',
  'Wo': 'Wo',
  'Mon': 'Mon',

  // Lump sum
  'psch': 'psch',
  'psch.': 'psch',
  'pauschal': 'psch',
  'Psch': 'psch',
};

/**
 * Parse unit string to standard format
 */
export function parseEinheit(unitStr: string): Einheit | null {
  const cleaned = unitStr.trim();
  return UNIT_MAPPINGS[cleaned] ?? null;
}

// =============================================================================
// MARKER DETECTION
// =============================================================================

/**
 * Detect special markers in LV text
 */
export function detectLVMarker(text: string): LVMarker | null {
  const lower = text.toLowerCase();

  if (lower.includes('bedarfsposition') || lower.includes('ohne gb')) {
    return 'bedarfsposition';
  }
  if (lower.includes('nur einh.-pr') || lower.includes('nur ep')) {
    return 'nur_ep';
  }
  if (lower.includes('enthalten') && lower.includes('pos.')) {
    return 'enthalten';
  }
  if (lower.includes('nicht von uns') || lower.includes('nicht ausgeführt')) {
    return 'nicht_ausgefuehrt';
  }
  if (lower.includes('oder glw') || lower.includes('gleichwertig')) {
    return 'oder_gleichwertig';
  }

  return null;
}

// =============================================================================
// PRICE PARSING
// =============================================================================

/**
 * Parse German number format to float
 * Handles: "1.234,56" -> 1234.56 and "1234,56" -> 1234.56
 */
export function parseGermanNumber(str: string): number | null {
  if (!str || str.trim() === '') return null;

  let cleaned = str.trim();

  // Remove currency symbols and EUR
  cleaned = cleaned.replace(/[€EUR]/gi, '').trim();

  // Check for dotted placeholder
  if (/^\.+$/.test(cleaned)) return null;

  // German format: 1.234,56 -> 1234.56
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Simple comma decimal: 234,56 -> 234.56
    cleaned = cleaned.replace(',', '.');
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Format number to German display format
 */
export function formatGermanNumber(num: number, decimals = 2): string {
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency in German format
 */
export function formatGermanCurrency(num: number): string {
  return num.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  });
}

// =============================================================================
// TEXT EXTRACTION HELPERS
// =============================================================================

/**
 * Extract detail references from text
 * Pattern: "Detail: Nr. 1006, Nr. 1010" or "Detail Nr. 1006"
 */
export function extractDetailReferences(text: string): string[] {
  const refs: string[] = [];
  const pattern = /(?:Detail[:\s]*)?Nr\.?\s*(\d+)/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    refs.push(match[1]);
  }

  return refs;
}

/**
 * Extract manufacturer/brand from text
 * Pattern: "Fabrikat: Knauf W 112" or "Fabrikat: Interface Touch & Tones"
 */
export function extractFabrikat(text: string): string | null {
  const patterns = [
    /Fabrikat:\s*([^\n]+?)(?:\s+oder\s+|$)/i,
    /Angeb\.\s*Fabrikat:\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract DIN references from text
 * Pattern: "DIN 4103 Teil 1" or "nach DIN 18560"
 */
export function extractDINReferences(text: string): string[] {
  const refs: string[] = [];
  const pattern = /DIN\s*(\d+(?:\s*Teil\s*\d+)?(?:-\d+)?)/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    refs.push(`DIN ${match[1]}`);
  }

  return Array.from(new Set(refs)); // Remove duplicates
}

// =============================================================================
// LV LINE PARSER
// =============================================================================

/**
 * Parse a single LV line into structured position
 * This handles the common format:
 * "04.02.03..0010. Dachfläche abkehren"
 * "1.631,000 m2 | 1,20 EUR | 1.957,20 EUR"
 */
export interface ParsedLVLine {
  position?: PositionNumber;
  kurztext?: string;
  menge?: number;
  einheit?: Einheit;
  einheitspreis?: number;
  gesamtpreis?: number;
  marker?: LVMarker;
}

export function parseLVLine(line: string): ParsedLVLine {
  const result: ParsedLVLine = {};

  // Try to extract position number at start
  const posMatch = line.match(/^([\d.]+)\s+(.+)$/);
  if (posMatch) {
    const posNum = parsePositionNumber(posMatch[1]);
    if (posNum) {
      result.position = posNum;
      result.kurztext = posMatch[2].trim();
    }
  }

  // Try to extract quantity and unit
  const qtyMatch = line.match(/([\d.,]+)\s*(m[²2³3]?|Stk\.?|St\.?|lfm|psch\.?|kg|h|Std\.?)/i);
  if (qtyMatch) {
    result.menge = parseGermanNumber(qtyMatch[1]) ?? undefined;
    result.einheit = parseEinheit(qtyMatch[2]) ?? undefined;
  }

  // Try to extract prices
  const pricePattern = /([\d.,]+)\s*(?:EUR|€)/gi;
  const prices: number[] = [];
  let match;
  while ((match = pricePattern.exec(line)) !== null) {
    const price = parseGermanNumber(match[1]);
    if (price !== null) {
      prices.push(price);
    }
  }

  if (prices.length >= 2) {
    result.einheitspreis = prices[0];
    result.gesamtpreis = prices[1];
  } else if (prices.length === 1) {
    result.einheitspreis = prices[0];
  }

  // Check for markers
  result.marker = detectLVMarker(line) ?? undefined;

  return result;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate an LV position has required fields
 */
export function validateLVPosition(pos: Partial<LVPosition>): string[] {
  const errors: string[] = [];

  if (!pos.oz) {
    errors.push('Position number (OZ) is required');
  }
  if (!pos.kurztext) {
    errors.push('Short description (Kurztext) is required');
  }
  if (pos.menge === undefined || pos.menge === null) {
    errors.push('Quantity (Menge) is required');
  }
  if (!pos.einheit) {
    errors.push('Unit (Einheit) is required');
  }

  return errors;
}

/**
 * Calculate Gesamtpreis from Menge and Einheitspreis
 */
export function calculateGesamtpreis(menge: number, einheitspreis: number): number {
  return Math.round(menge * einheitspreis * 100) / 100;
}
