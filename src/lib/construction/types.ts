/**
 * German Construction Types - Based on Real Offer Analysis
 *
 * These types are derived from actual LV documents, Preisspiegel,
 * and contracts from Trockenbau, Estrich, Abdichtung, and Bodenbelag trades.
 */

// =============================================================================
// ENUMS - German Construction Standards
// =============================================================================

/**
 * Supported trades (Gewerke) for MVP
 * Based on: Real offers from Horn, Mayer, Aslan, FBZ
 */
export type Gewerk =
  | 'trockenbau'      // Drywall - Mayer
  | 'estrich'         // Screed - Aslan
  | 'abdichtung'      // Waterproofing - Horn
  | 'bodenbelag';     // Flooring - FBZ

/**
 * German units from real LV documents
 * Based on: LEIQ_LV.PDF, BTB_LV_TroBau.pdf, LV_Bodenbelagsarbeiten.pdf
 */
export type Einheit =
  | 'm2'              // Square meters (most common)
  | 'm'               // Linear meters
  | 'm3'              // Cubic meters
  | 'Stk'             // Pieces (Stück)
  | 'St'              // Pieces (alternate)
  | 'kg'              // Kilograms
  | 'h'               // Hours
  | 'Std'             // Hours (Stunden)
  | 'lfm'             // Running meters (laufende Meter)
  | 'psch'            // Lump sum (pauschal)
  | 'Tag'             // Days
  | 'Wo'              // Weeks
  | 'Mon';            // Months

/**
 * Contract types from real contracts
 * Based on: HORN_AE_ko.pdf contract award
 */
export type Vertragsart =
  | 'einheitspreisvertrag'  // Unit price contract (most common)
  | 'pauschalvertrag';      // Lump sum contract

/**
 * Document status in tender process
 */
export type DokumentStatus =
  | 'ausschreibung'         // Initial tender
  | 'angebot'               // Offer submitted
  | 'verhandlung'           // In negotiation
  | 'zuschlag'              // Contract awarded
  | 'abgelehnt';            // Rejected

// =============================================================================
// LV POSITION TYPES - From Real Documents
// =============================================================================

/**
 * Hierarchical position number structure
 * Pattern from real LVs: "04.02.03..0010" or "01.01.01.010"
 *
 * Examples found:
 * - Abdichtung: 04.02.03..0010 (with double dot)
 * - Trockenbau: 01.01.01.0010 (4-digit final)
 * - Estrich: 01.01.01.010 (3-digit final)
 * - Bodenbelag: 01.01.01.010 (3-digit final)
 */
export interface PositionNumber {
  /** Full position string, e.g., "04.02.03..0010" */
  full: string;
  /** Hierarchy level 1 (Gewerk/Trade), e.g., "04" */
  level1: string;
  /** Hierarchy level 2 (Teilbereich), e.g., "02" */
  level2: string;
  /** Hierarchy level 3 (Arbeitspaket), e.g., "03" */
  level3: string;
  /** Position number within package, e.g., "0010" */
  position: string;
  /** Hierarchy depth (1-4) */
  depth: number;
}

/**
 * Single LV position from tender document
 * Based on: Real LV structure from all 4 trades
 */
export interface LVPosition {
  /** Ordnungszahl - hierarchical position number */
  oz: string;
  /** Parsed position structure */
  positionNumber: PositionNumber;
  /** Short description (Kurztext) */
  kurztext: string;
  /** Detailed description (Langtext) - may include DIN references, specs */
  langtext?: string;
  /** Quantity from LV */
  menge: number;
  /** Unit of measure */
  einheit: Einheit;
  /** Unit price (Einheitspreis) - filled by bidder */
  einheitspreis?: number;
  /** Total price (Gesamtpreis) - calculated: menge × einheitspreis */
  gesamtpreis?: number;
  /** Page number in source document */
  seite?: number;
  /** Original text excerpt for traceability */
  quellentext?: string;
  /** Special markers */
  marker?: LVMarker;
  /** Alternative materials/prices if specified */
  alternativen?: LVAlternative[];
  /** Reference to detail drawings */
  detailReferenzen?: string[];
}

/**
 * Special markers found in real LVs
 */
export type LVMarker =
  | 'bedarfsposition'       // "*** Bedarfsposition ohne GB"
  | 'nur_ep'                // "Nur Einh.-Pr." - only unit price
  | 'enthalten'             // "in Pos. XXXX enthalten!"
  | 'nicht_ausgefuehrt'     // "Wird nicht von uns ausgeführt!"
  | 'oder_gleichwertig';    // "oder glw." - allows substitution

/**
 * Alternative pricing for material variations
 * Found in: HORN offer with Soprema vs. ESBIT vs. DuoFlex options
 */
export interface LVAlternative {
  beschreibung: string;
  fabrikat?: string;
  einheitspreis: number;
  differenz?: number;
}

/**
 * Complete LV document structure
 */
export interface Leistungsverzeichnis {
  /** Project identifier */
  projektNummer: string;
  /** Project name */
  projektName: string;
  /** Trade/Gewerk */
  gewerk: Gewerk;
  /** LV identifier */
  lvNummer: string;
  /** All positions */
  positionen: LVPosition[];
  /** Total pages */
  seitenanzahl: number;
  /** Extraction date */
  extrahiertAm: Date;
  /** Source file path */
  quelldatei: string;
}

// =============================================================================
// PREISSPIEGEL TYPES - From Real Excel Files
// =============================================================================

/**
 * Bidder information in Preisspiegel
 * Based on: 2022_6-29_PS_Bodenbelag_ko.xlsx structure
 */
export interface Bieter {
  /** Company name */
  name: string;
  /** Contact phone */
  telefon?: string;
  /** Offer date */
  angebotsDatum?: Date;
  /** Credit rating info */
  kreditInfo?: string;
  /** Price index date */
  indexDatum?: Date;
  /** Price index value */
  indexWert?: number;
  /** Employee count (AK) */
  mitarbeiter?: number;
  /** Annual turnover (Umsatz) */
  umsatz?: number;
}

/**
 * Single row in Preisspiegel comparison
 */
export interface PreisspiegelZeile {
  /** Position number */
  position: string;
  /** Short info/codes (e.g., "Bo,XA") */
  kurzInfo?: string;
  /** Description */
  beschreibung: string;
  /** Quantity */
  menge: number;
  /** Unit */
  einheit: Einheit;
  /** Prices from each bidder: { bieterName: { ep, gp } } */
  preise: Record<string, { ep: number | null; gp: number | null }>;
}

/**
 * Complete Preisspiegel document
 * Standard structure: Fixed columns A-E, then EP/GP pairs per bidder
 */
export interface Preisspiegel {
  /** Project info */
  projektNummer: string;
  projektName: string;
  gewerk: Gewerk;
  /** Date of comparison */
  datum: Date;
  /** Status suffix (ko=final, neg=negotiation, etc.) */
  status: 'ko' | 'neg' | 'az' | 'um' | 'vp';
  /** All bidders */
  bieter: Bieter[];
  /** All comparison rows */
  zeilen: PreisspiegelZeile[];
  /** Summary totals per bidder */
  summen: Record<string, number>;
}

// =============================================================================
// OFFER TYPES - From Real Offer Documents
// =============================================================================

/**
 * Company letterhead information
 * Based on: HORN Abdichtungstechniken GmbH header
 */
export interface Firmenprofil {
  name: string;
  rechtsform: string;           // GmbH, GmbH & Co. KG, etc.
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  fax?: string;
  email: string;
  website?: string;
  ustIdNr: string;              // USt-IdNr.
  steuernummer?: string;
  registergericht: string;      // AG Königstein
  hrbNummer: string;            // HRB 7088
  geschaeftsfuehrer: string[];  // Günter Horn, Ute Horn, Marko Herrmann
  bankverbindung: {
    bank: string;
    iban: string;
    bic: string;
  };
}

/**
 * Offer header information
 * Based on: Real offer structure from HORN_Ü2.pdf
 */
export interface AngebotsKopf {
  /** Object/Project description */
  objekt: string;
  /** Internal project number */
  projektNummer: string;
  /** Offer date */
  datum: Date;
  /** Customer number */
  kundenNummer?: string;
  /** Contact person */
  sachbearbeiter: string;
  /** Offer validity period (typically 2-4 weeks) */
  gueltigkeitsTage: number;
  /** Offer revision (Ü1, Ü2, etc.) */
  revision?: string;
}

/**
 * Offer line item
 * Based on: Real offer line items with alternatives
 */
export interface AngebotsPosition {
  /** Position number */
  oz: string;
  /** Description */
  beschreibung: string;
  /** Quantity */
  menge: number;
  /** Unit */
  einheit: Einheit;
  /** Unit price */
  einheitspreis: number;
  /** Total price */
  gesamtpreis: number;
  /** Material/brand specified */
  fabrikat?: string;
  /** Alternative options */
  alternativen?: {
    beschreibung: string;
    einheitspreis: number;
  }[];
  /** Detail drawing references */
  detailNummern?: string[];
  /** Special notes */
  anmerkung?: string;
}

/**
 * Offer assumptions and conditions
 * Based on: Real offer Vorbehalte section
 */
export interface AngebotsVorbehalte {
  /** Price validity conditions */
  preisvorbehalte?: string[];
  /** Site conditions assumed */
  baustellenbedingungen?: string[];
  /** Scope exclusions */
  ausschluesse?: string[];
  /** Materials provided by client */
  beistellungen?: string[];
  /** Access/crane requirements */
  zugangsvoraussetzungen?: string[];
}

/**
 * Complete offer document
 */
export interface Angebot {
  /** Company profile */
  firma: Firmenprofil;
  /** Offer header */
  kopf: AngebotsKopf;
  /** All line items */
  positionen: AngebotsPosition[];
  /** Section subtotals */
  zwischensummen: Record<string, number>;
  /** Net total */
  nettoSumme: number;
  /** VAT treatment */
  mehrwertsteuer: {
    /** §13b reverse charge */
    reverseCharge: boolean;
    satz?: number;
    betrag?: number;
  };
  /** Gross total */
  bruttoSumme: number;
  /** Assumptions and conditions */
  vorbehalte: AngebotsVorbehalte;
  /** Payment terms */
  zahlungsbedingungen?: string;
}

// =============================================================================
// CONTRACT TYPES - From Real Contract Documents
// =============================================================================

/**
 * Contract award (Auftragserteilung)
 * Based on: HORN_AE_ko.pdf
 */
export interface Auftragserteilung {
  /** Auftraggeber (Client/GU) */
  auftraggeber: {
    name: string;
    adresse: string;
    ansprechpartner: string;
    telefon: string;
    email: string;
  };
  /** Auftragnehmer (Contractor/NU) */
  auftragnehmer: {
    name: string;
    adresse: string;
  };
  /** Project details */
  bauvorhaben: string;
  gewerkNummer: string;
  gewerkBezeichnung: string;
  /** Contract value */
  auftragssumme: number;
  /** Contract type */
  vertragsart: Vertragsart;
  /** Reference document */
  verhandlungsprotokoll: {
    datum: Date;
    nummer?: string;
  };
  /** VAT treatment - typically §13b */
  umsatzsteuer: '13b' | 'normal';
  /** Site management contacts */
  bauleitung: {
    oberbauleitung?: { name: string; telefon: string };
    bauleitung?: { name: string; telefon: string };
  };
  /** Required documents deadline */
  unterlagenFrist?: Date;
  /** Required documents list */
  erforderlicheUnterlagen?: string[];
}

/**
 * Bank guarantee (Bürgschaft)
 * Based on: Real Bürgschaft template from contract
 */
export interface Buergschaft {
  /** Guarantor (Bank) */
  buerge?: string;
  /** Contractor (NU) */
  auftragnehmer: {
    name: string;
    adresse: string;
  };
  /** Client (AG) */
  auftraggeber: {
    name: string;
    adresse: string;
  };
  /** Guarantee amount (typically 10% of contract) */
  betrag: number;
  /** Guarantee type */
  zweck: 'vertragserfuellung' | 'gewaehrleistung' | 'vorauszahlung';
  /** Reference project */
  bauvorhaben: string;
  gewerkNummer: string;
  /** Reference contract date */
  auftragsschreibenVom: Date;
}

// =============================================================================
// PRICE LIBRARY TYPES
// =============================================================================

/**
 * Price library entry with trade-specific defaults
 * Based on: Preisspiegel price ranges
 */
export interface PreisbibliothekEintrag {
  id: string;
  /** Trade */
  gewerk: Gewerk;
  /** Item category */
  kategorie: string;
  /** Standard description */
  beschreibung: string;
  /** Unit */
  einheit: Einheit;
  /** Price range from market analysis */
  preisbereich: {
    min: number;
    mittel: number;
    max: number;
  };
  /** Your company's default price */
  eigenpreis?: number;
  /** Last updated */
  aktualisiertAm: Date;
  /** Source/notes */
  quelle?: string;
}

/**
 * Trade-specific price ranges from Preisspiegel analysis
 */
export const PREISBEREICH_REFERENZ: Record<Gewerk, { min: number; median: number; max: number; avg: number }> = {
  bodenbelag: { min: 1.25, median: 7.10, max: 53.00, avg: 14.69 },
  trockenbau: { min: 1.96, median: 25.00, max: 502.00, avg: 51.18 },
  abdichtung: { min: 1.20, median: 99.00, max: 7540.00, avg: 1184.12 },
  estrich: { min: 2.00, median: 15.00, max: 50.00, avg: 18.00 }, // Estimated
};

// =============================================================================
// GERMAN CONSTRUCTION CONSTANTS
// =============================================================================

/**
 * Standard German abbreviations found in LV documents
 */
export const ABKUERZUNGEN = {
  // Units
  m2: 'm²',
  m3: 'm³',
  Stk: 'Stück',
  lfm: 'laufende Meter',
  psch: 'pauschal',

  // Materials (Trockenbau)
  GKB: 'Gipskartonplatte',
  GKF: 'Gipskarton Feuerschutz',
  GK: 'Gipskarton',
  WLG: 'Wärmeleitgruppe',
  OKRF: 'Oberkante Rohfußboden',

  // Materials (Estrich)
  CT: 'Zementestrich',
  CA: 'Calciumsulfatestrich',
  EPS: 'Expandiertes Polystyrol',
  TSD: 'Trittschalldämmung',
  WD: 'Wärmedämmung',

  // Materials (Abdichtung)
  KMB: 'Kunststoffmodifizierte Bitumendickbeschichtung',
  PIB: 'Polyisobutylen',
  PYE: 'Polyester-Bitumenbahn',
  XPS: 'Extrudiertes Polystyrol',

  // Quality/Standards
  DIN: 'Deutsche Industrie Norm',
  VOB: 'Vergabe- und Vertragsordnung für Bauleistungen',
  Q3: 'Qualitätsstufe 3 (Oberflächengüte)',
  Q4: 'Qualitätsstufe 4 (Oberflächengüte)',
  F0: 'Feuerwiderstandsklasse 0',
  F30: 'Feuerwiderstandsklasse 30 Minuten',
  F90: 'Feuerwiderstandsklasse 90 Minuten',

  // Contract
  AG: 'Auftraggeber',
  AN: 'Auftragnehmer',
  NU: 'Nachunternehmer',
  GU: 'Generalunternehmer',
  EP: 'Einheitspreis',
  GP: 'Gesamtpreis',
  AGB: 'Allgemeine Geschäftsbedingungen',
} as const;

/**
 * Knauf drywall system designations
 * From: Real LV Trockenbau positions
 */
export const KNAUF_SYSTEME = {
  W111: 'Einfachständerwerk, einfach beplankt',
  W112: 'Einfachständerwerk, doppelt beplankt',
  W115: 'Doppelständerwerk',
  W116: 'Schachtwand',
  W131: 'Vorsatzschale frei stehend',
  W623: 'Unterdecke, abgehängt',
  W625: 'Unterdecke, abgehängt mit Dämmung',
} as const;
