/**
 * HARDCODED CONSTRUCTION DOMAIN KNOWLEDGE
 *
 * This module contains German construction industry expertise that is
 * always applied during document extraction and offer generation.
 *
 * Based on real offer patterns from:
 * - Estrich (Screed) projects (Haardtring style)
 * - Abdichtung (Waterproofing) projects (LeiQ style)
 * - Bodenleger (Flooring) projects
 * - Trockenbau (Drywall) projects
 */

// =============================================================================
// BLUEPRINT EXTRACTION PATTERNS
// =============================================================================

export const BLUEPRINT_STYLES = {
  HAARDTRING: {
    name: 'Haardtring',
    description: 'Residential projects - F: pattern for areas',
    areaPattern: /^F:\s*([\d,]+)\s*m[²2]?/i,
    roomPatterns: [
      /^(R\d+\.E\d+\.\d+\.\d+)/,  // R2.E5.3.5 format
      /^(R\d+[A-Z])/,              // R1A, R1B format
      /^(E\.[A-Z0-9]+(?:\.\d+)+)/, // E.E0.2.1 apartment format
    ],
    balconyPattern: /^50%:\s*([\d,]+)\s*m[²2]?/i,
    metadataCodes: ['BA:', 'B:', 'W:', 'D:'],
  },
  LEIQ: {
    name: 'LeiQ',
    description: 'Office/Commercial projects - NRF: pattern for areas',
    areaPatterns: [
      /^NRF:\s*([\d,]+)\s*m[²2]?/i,   // Modern: NRF: 3,45 m2
      /^F=\s*([\d.,]+)\s*m[²2]?/i,    // Legacy: F= 50.37 m²
    ],
    roomPattern: /^(B\.\d+\.[0-9A-Z]+\.[A-Z]?\d+(?:-[A-Z])?)/,
    perimeterPattern: /^U[=:]\s*([\d.,]+)\s*m/i,
    heightPattern: /^L(?:R)?H[=:]\s*([\d.,]+)\s*m/i,
  },
  OMNITURM: {
    name: 'Omniturm',
    description: 'Highrise projects - NGF: pattern for areas',
    areaPattern: /^NGF:\s*([\d.,]+)\s*m[²2]?/i,
    roomPatterns: [
      /^(\d{2}_[a-z]\d+\.\d+)/,   // 03_b6.12 format
      /^(BT\d+\.[A-Z]+\.\d+)/,    // BT format
    ],
    shaftPattern: /^(Schacht\s*\d+)/i,
  },
} as const

// =============================================================================
// GERMAN ROOM CATEGORIES (for area classification)
// =============================================================================

export const ROOM_CATEGORIES = {
  office: {
    keywords: ['büro', 'office', 'nutzungseinheit', 'back office'],
    factor: 1.0,
  },
  residential: {
    keywords: ['schlafen', 'wohnen', 'essen', 'kochen', 'zimmer', 'küche'],
    factor: 1.0,
  },
  circulation: {
    keywords: ['flur', 'diele', 'schleuse', 'vorraum', 'eingang', 'lobby'],
    factor: 1.0,
  },
  stairs: {
    keywords: ['treppe', 'treppenhaus', 'trh'],
    factor: 1.0,
  },
  elevators: {
    keywords: ['aufzug', 'lift', 'aufzugsschacht', 'aufzugsvorr'],
    factor: 1.0,
  },
  shafts: {
    keywords: ['schacht', 'lüftung', 'medien', 'druckbelüftung'],
    factor: 1.0,
  },
  technical: {
    keywords: ['elektro', 'technik', 'hwr', 'it verteiler', 'elt', 'glt', 'fiz'],
    factor: 1.0,
  },
  sanitary: {
    keywords: ['wc', 'bad', 'dusche', 'gästebad', 'umkleide', 'sanitär'],
    factor: 1.0,
  },
  storage: {
    keywords: ['lager', 'abstellraum', 'müll', 'fahrrad'],
    factor: 1.0,
  },
  outdoor: {
    keywords: ['balkon', 'terrasse', 'loggia', 'dachterrasse', 'freisitz'],
    factor: 0.5, // Outdoor areas count at 50%
  },
} as const

// =============================================================================
// GERMAN CONSTRUCTION UNITS (Einheiten)
// =============================================================================

export const CONSTRUCTION_UNITS = {
  // Area units
  m2: { name: 'Quadratmeter', aliases: ['m²', 'qm', 'm2'] },
  // Length units
  m: { name: 'Meter', aliases: ['m', 'lfm', 'lfdm'] },
  // Volume units
  m3: { name: 'Kubikmeter', aliases: ['m³', 'cbm', 'm3'] },
  // Count units
  stk: { name: 'Stück', aliases: ['stk', 'st', 'stück'] },
  // Weight units
  kg: { name: 'Kilogramm', aliases: ['kg'] },
  t: { name: 'Tonne', aliases: ['t', 'to'] },
  // Time units
  h: { name: 'Stunde', aliases: ['h', 'std'] },
  // Lump sum
  psch: { name: 'Pauschal', aliases: ['psch', 'pauschal', 'pau'] },
} as const

// =============================================================================
// LV POSITION PATTERNS (Leistungsverzeichnis)
// =============================================================================

export const LV_PATTERNS = {
  // Position number formats
  positionFormats: [
    /^(\d{2}\.\d{2}\.\d{4})/,        // 01.02.0010
    /^(\d+\.\d+\.\d+)/,               // 1.2.10
    /^(OZ\s*\d+)/i,                   // OZ 0010
    /^(\d{4,})/,                      // 0010 (just OZ)
  ],
  // Quantity extraction
  quantityPattern: /(\d+[.,]?\d*)\s*(m[²³2]?|stk|kg|t|h|psch|lfm)/i,
  // EP (Einheitspreis) pattern
  epPattern: /EP[:\s]+(\d+[.,]\d{2})/i,
  // GP (Gesamtpreis) pattern
  gpPattern: /GP[:\s]+(\d+[.,]\d{2})/i,
} as const

// =============================================================================
// TRADE-SPECIFIC KNOWLEDGE (Gewerke)
// =============================================================================

export const GEWERKE = {
  estrich: {
    name: 'Estricharbeiten',
    commonPositions: [
      'Zementestrich',
      'Fließestrich',
      'Trockenestrich',
      'Randdämmstreifen',
      'Trittschalldämmung',
      'Wärmedämmung',
      'PE-Folie',
      'Bewegungsfugen',
      'Scheinfugen',
      'Gefälleestrich',
    ],
    riskIndicators: [
      'Estrichdicke nicht angegeben',
      'Festigkeitsklasse fehlt',
      'Aufheizprotokoll erforderlich',
      'Belegreife nicht definiert',
    ],
    defaultSurcharges: {
      gewinn: 12,
      agk: 8,
      wagnis: 3,
    },
  },
  abdichtung: {
    name: 'Abdichtungsarbeiten',
    commonPositions: [
      'Bitumenbahn',
      'KMB (kunststoffmodifizierte Bitumendickbeschichtung)',
      'Flüssigabdichtung',
      'Naßraumabdichtung',
      'Dampfsperre',
      'Hohlkehle',
      'Wandanschluss',
      'Durchdringungen',
      'Kontrollschächte',
    ],
    riskIndicators: [
      'Untergrundvorbereitung unklar',
      'Anschlussdetails fehlen',
      'Wasserdruckstufe nicht definiert',
      'Druckwasserbereich',
    ],
    defaultSurcharges: {
      gewinn: 15,
      agk: 10,
      wagnis: 5,
    },
  },
  bodenleger: {
    name: 'Bodenbelagsarbeiten',
    commonPositions: [
      'Parkett',
      'Laminat',
      'Vinyl/Designbelag',
      'Linoleum',
      'Teppich',
      'Sockelleisten',
      'Unterlagsbahn',
      'Ausgleichsmasse',
      'Übergangsprofil',
      'Abschlussprofil',
    ],
    riskIndicators: [
      'Untergrund nicht geprüft',
      'Restfeuchte nicht angegeben',
      'Verlegeart unklar (schwimmend/verklebt)',
      'Türanschlüsse nicht definiert',
    ],
    defaultSurcharges: {
      gewinn: 10,
      agk: 8,
      wagnis: 2,
    },
  },
  trockenbau: {
    name: 'Trockenbauarbeiten',
    commonPositions: [
      'GK-Wand (W111-W155)',
      'GK-Decke',
      'Vorsatzschale',
      'Brandschutzverkleidung',
      'Schachtverkleidung',
      'Akustikdecke',
      'Dachschrägenverkleidung',
      'Revisionsklappe',
      'Türzarge (Stahlzarge/Holzzarge)',
    ],
    riskIndicators: [
      'Wandtyp nicht spezifiziert',
      'Brandschutzanforderung unklar',
      'Schallschutzklasse fehlt',
      'Installationsführung nicht berücksichtigt',
    ],
    defaultSurcharges: {
      gewinn: 12,
      agk: 9,
      wagnis: 3,
    },
  },
} as const

// =============================================================================
// RISK DETECTION RULES (Nachtragspotenziale)
// =============================================================================

export const RISK_RULES = {
  quantityMismatch: {
    name: 'Mengenabweichung',
    description: 'LV-Menge weicht von Planmessung ab',
    thresholds: {
      low: 5,      // 5% Abweichung
      medium: 10,  // 10% Abweichung
      high: 20,    // 20% Abweichung
    },
    clarificationTemplate: 'Bitte um Bestätigung der {position} Mengen. Unsere Planauswertung ergibt {measured} {unit}, das LV weist {lv_qty} {unit} aus.',
  },
  missingPosition: {
    name: 'Fehlende Position',
    description: 'Übliche Position im LV nicht vorhanden',
    clarificationTemplate: 'Position "{position}" ist im LV nicht enthalten. Bitte um Klärung ob diese Leistung entfallen soll oder nachzutragen ist.',
  },
  unclearScope: {
    name: 'Unklare Abgrenzung',
    description: 'Leistungsumfang nicht eindeutig definiert',
    clarificationTemplate: 'Die Abgrenzung für "{position}" ist nicht eindeutig definiert. Bitte um Klarstellung bezüglich {detail}.',
  },
  missingDetail: {
    name: 'Fehlende Angabe',
    description: 'Wichtige technische Angabe fehlt',
    clarificationTemplate: 'Für Position "{position}" fehlt die Angabe zu {detail}. Bitte um Ergänzung.',
  },
} as const

// =============================================================================
// OFFER GENERATION TEMPLATES
// =============================================================================

export const OFFER_TEMPLATES = {
  short: {
    name: 'Kurzangebot',
    sections: ['header', 'positions', 'summary'],
  },
  standard: {
    name: 'Standardangebot',
    sections: ['header', 'positions', 'assumptions', 'exclusions', 'summary', 'terms'],
  },
  detailed: {
    name: 'Ausführliches Angebot',
    sections: ['header', 'positions', 'clarifications', 'assumptions', 'exclusions', 'risks', 'summary', 'terms', 'appendix'],
  },
} as const

export const STANDARD_EXCLUSIONS = [
  'Baustrom und Bauwasser werden bauseits gestellt',
  'Gerüste werden bauseits gestellt',
  'Materiallagerung und Sozialräume werden bauseits gestellt',
  'Entsorgung von nicht selbst eingebrachtem Material',
  'Leistungen außerhalb der regulären Arbeitszeiten',
  'Zusatzleistungen aufgrund von Planungsänderungen',
  'Schutzmaßnahmen für bereits fertiggestellte Gewerke',
] as const

export const STANDARD_ASSUMPTIONS = [
  'Untergrund ist vertragsgemäß vorbereitet und abnahmereif',
  'Zugang zur Baustelle ist während der Arbeitszeiten gewährleistet',
  'Koordination mit anderen Gewerken erfolgt durch den AG/GU',
  'Aufmaß erfolgt nach VOB/C und Auftragserteilung',
  'Preise basieren auf aktuellen Materialpreisen',
] as const

// =============================================================================
// GERMAN NUMBER PARSING
// =============================================================================

export function parseGermanNumber(str: string): number {
  const s = str.trim()
  if (s.includes('.') && s.includes(',')) {
    // German thousands: 1.070,55 -> 1070.55
    return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  }
  // Simple comma decimal: 22,79 -> 22.79
  return parseFloat(s.replace(',', '.'))
}

export function formatGermanNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatGermanCurrency(num: number): string {
  return num.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })
}

// =============================================================================
// ROOM CATEGORIZATION
// =============================================================================

export function categorizeRoom(roomName: string): keyof typeof ROOM_CATEGORIES {
  const nameLower = roomName.toLowerCase()
  for (const [category, config] of Object.entries(ROOM_CATEGORIES)) {
    for (const keyword of config.keywords) {
      if (nameLower.includes(keyword)) {
        return category as keyof typeof ROOM_CATEGORIES
      }
    }
  }
  return 'office' // Default category
}

export function getRoomFactor(roomName: string): number {
  const category = categorizeRoom(roomName)
  return ROOM_CATEGORIES[category].factor
}

export function isOutdoorRoom(roomName: string): boolean {
  return categorizeRoom(roomName) === 'outdoor'
}

// =============================================================================
// EXTRACTION PROMPTS FOR CLAUDE API
// =============================================================================

export const CLAUDE_EXTRACTION_PROMPTS = {
  lvExtraction: `Du bist ein Experte für deutsche Bauleistungsverzeichnisse (LV). Deine Aufgabe ist es, Positionen aus einem LV zu extrahieren.

Extrahiere alle Positionen mit folgenden Informationen:
- position_number: Die Positionsnummer (z.B. "01.01.0010", "1.1.10")
- oz_number: Die Ordnungszahl/OZ (z.B. "0010", "10")
- title: Der Kurztext/Titel der Position
- description: Die Beschreibung/Langtext
- quantity: Die Menge als Zahl (ohne Einheit)
- unit: Die Einheit (z.B. "m2", "m", "Stk", "psch", "kg")
- page_number: Die Seitenzahl falls erkennbar

Wichtige Regeln:
1. Zahlen im deutschen Format (1.234,56) korrekt parsen
2. Alle Positionen erfassen, auch Eventualpositions
3. Bei unklaren Mengen "0" angeben und Confidence senken
4. Einheiten standardisieren (qm -> m2, lfm -> m)

Antworte NUR mit einem JSON-Objekt.`,

  riskAnalysis: `Du bist ein erfahrener deutscher Baukalkulator. Analysiere die extrahierten Positionen auf Nachtragspotenziale.

Prüfe auf:
1. Mengenabweichungen zwischen LV und Planmessung (>10%)
2. Fehlende Standardpositionen für das Gewerk
3. Unklare Abgrenzungen und Schnittstellen
4. Fehlende technische Angaben (Dicken, Festigkeiten, etc.)
5. Risikoreiche Formulierungen ("nach Aufmaß", "nach Bedarf")

Für jedes Risiko erstelle eine konkrete Klärungsfrage für den Auftraggeber.`,
} as const
