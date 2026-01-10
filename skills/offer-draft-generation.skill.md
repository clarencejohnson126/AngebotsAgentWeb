# Offer Draft Generation for Subcontractors

## Overview
This skill covers generating professional, contract-winning offers (Angebote) for construction subcontractors to submit to General Contractors (Generalunternehmer). The offer combines extracted quantities, competitive pricing, and strategic presentation to maximize win probability while protecting margins.

## When to Use
- Creating formal offers from extracted/measured quantities
- Generating professional German offer letters (Angebotsschreiben)
- Building line item tables (Leistungsverzeichnis) with pricing
- Producing export-ready offer packages (PDF + Excel)
- Preparing competitive bids for tender submissions

## Strategic Principle: Win the Contract First

```
┌─────────────────────────────────────────────────────────────────┐
│  WHAT GOES IN THE OFFER          WHAT STAYS OUT (FOR NOW)      │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Competitive base prices       ✗ Change order potentials     │
│  ✓ Clear scope definition        ✗ Risk flag details           │
│  ✓ Professional presentation     ✗ Internal cost breakdowns    │
│  ✓ Strategic assumptions         ✗ Margin calculations         │
│  ✓ Favorable terms               ✗ Competitor analysis         │
└─────────────────────────────────────────────────────────────────┘

Change orders (Nachträge) are executed AFTER contract signing when work begins.
The offer focuses on winning the contract at a competitive, sustainable price.
```

## Project Structure

```
├── lib/
│   └── offer-generation/
│       ├── generator.ts              # Main offer generator
│       ├── templates/
│       │   ├── letter-de.ts          # German letter template
│       │   ├── letter-en.ts          # English letter template
│       │   └── terms-de.ts           # Standard German terms
│       ├── formatters/
│       │   ├── line-items.ts         # Position formatting
│       │   ├── currency.ts           # German currency formatting
│       │   └── dates.ts              # German date formatting
│       ├── pdf-generator.ts          # PDF output
│       ├── types.ts                  # Type definitions
│       └── strategies/
│           ├── value-positioning.ts  # Low-price strategy
│           ├── quality-positioning.ts # Premium strategy
│           └── balanced.ts           # Standard approach
├── components/
│   └── offer/
│       ├── OfferPreview.tsx          # Live preview component
│       ├── OfferEditor.tsx           # Edit before export
│       └── OfferExportDialog.tsx     # Export options
```

## Type Definitions (`lib/offer-generation/types.ts`)

```typescript
export type OfferStatus = 'draft' | 'review' | 'final' | 'submitted';
export type OfferStyle = 'short' | 'standard' | 'detailed';
export type Language = 'de' | 'en';

export interface CompanyProfile {
  name: string;
  legalForm?: string;              // GmbH, GmbH & Co. KG, etc.
  address: {
    street: string;
    postalCode: string;
    city: string;
    country?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  taxInfo: {
    vatId?: string;                // USt-IdNr.
    taxNumber?: string;            // Steuernummer
  };
  bankDetails?: {
    bankName: string;
    iban: string;
    bic?: string;
  };
  trade: string;                   // Gewerk
  certifications?: string[];       // ISO, etc.
  insuranceInfo?: string;
}

export interface ProjectInfo {
  id: string;
  title: string;
  client: {
    company: string;
    contactPerson?: string;
    address?: string;
  };
  location?: string;
  reference?: string;              // GU's project number
  tenderDate?: Date;               // Ausschreibungsdatum
  submissionDeadline?: Date;       // Abgabefrist
}

export interface OfferLineItem {
  position: string;                // "01.001" or "1.1"
  description: string;
  longDescription?: string;        // Detailed scope text
  unit: string;                    // m², lfm, Stk., psch.
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sourceReference?: string;        // Where quantity came from
  notes?: string;                  // Visible notes
  internalNotes?: string;          // Not exported
}

export interface OfferSection {
  number: string;                  // "01" or "1"
  title: string;                   // "Metallständerwände"
  items: OfferLineItem[];
  subtotal: number;
}

export interface OfferPricing {
  netTotal: number;                // Nettosumme
  discount?: {
    percent: number;
    amount: number;
    reason?: string;               // "Projektrabatt"
  };
  netAfterDiscount: number;
  vatRate: number;                 // 0.19
  vatAmount: number;
  grossTotal: number;              // Bruttosumme
}

export interface OfferTerms {
  validityDays: number;            // Bindefrist
  paymentTerms: string;            // Zahlungsbedingungen
  executionPeriod?: string;        // Ausführungszeitraum
  warranty?: string;               // Gewährleistung
  priceBase?: string;              // Preisgrundlage
}

export interface OfferAssumption {
  text: string;
  category: 'scope' | 'timeline' | 'access' | 'materials' | 'other';
}

export interface OfferExclusion {
  text: string;
  standard: boolean;               // Part of standard exclusions
}

export interface OfferDraft {
  id: string;
  projectId: string;
  version: number;
  status: OfferStatus;
  language: Language;
  style: OfferStyle;
  
  // Header info
  offerNumber: string;
  offerDate: Date;
  subject: string;                 // Betreff
  
  // Content
  introText?: string;
  sections: OfferSection[];
  pricing: OfferPricing;
  terms: OfferTerms;
  assumptions: OfferAssumption[];
  exclusions: OfferExclusion[];
  closingText?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface OfferGenerationInput {
  project: ProjectInfo;
  company: CompanyProfile;
  quantities: ExtractedQuantity[];
  prices: PricedItem[];
  strategy: PricingStrategy;
  language: Language;
  style: OfferStyle;
  customAssumptions?: string[];
  customExclusions?: string[];
}

export interface ExtractedQuantity {
  label: string;
  value: number;
  unit: string;
  sourceDocument: string;
  sourcePage: number;
  confidence: number;
}

export interface PricedItem {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  priceSource: 'library' | 'calculated' | 'manual';
}
```

## Offer Generator (`lib/offer-generation/generator.ts`)

```typescript
import { v4 as uuidv4 } from 'uuid';
import {
  OfferDraft,
  OfferGenerationInput,
  OfferSection,
  OfferLineItem,
  OfferPricing,
  OfferTerms,
  OfferAssumption,
  OfferExclusion,
  Language,
  OfferStyle,
} from './types';
import { generateOfferNumber } from './formatters/offer-number';
import { getStandardAssumptions, getStandardExclusions } from './templates/terms-de';
import { generateIntroText, generateClosingText } from './templates/letter-de';

export class OfferGenerator {
  private input: OfferGenerationInput;

  constructor(input: OfferGenerationInput) {
    this.input = input;
  }

  generate(): OfferDraft {
    const sections = this.buildSections();
    const pricing = this.calculatePricing(sections);
    const terms = this.buildTerms();
    const assumptions = this.buildAssumptions();
    const exclusions = this.buildExclusions();

    return {
      id: uuidv4(),
      projectId: this.input.project.id,
      version: 1,
      status: 'draft',
      language: this.input.language,
      style: this.input.style,

      offerNumber: generateOfferNumber(this.input.company, this.input.project),
      offerDate: new Date(),
      subject: this.buildSubject(),

      introText: generateIntroText(this.input, this.input.language),
      sections,
      pricing,
      terms,
      assumptions,
      exclusions,
      closingText: generateClosingText(this.input, this.input.language),

      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private buildSubject(): string {
    const { project, company } = this.input;
    if (this.input.language === 'de') {
      return `Angebot ${company.trade} – ${project.title}`;
    }
    return `Offer ${company.trade} – ${project.title}`;
  }

  private buildSections(): OfferSection[] {
    const { prices, quantities } = this.input;
    const sections: OfferSection[] = [];

    // Group items by category/trade section
    const grouped = this.groupByCategory(prices);

    let sectionNum = 1;
    for (const [category, items] of grouped) {
      const sectionItems: OfferLineItem[] = [];
      let itemNum = 1;

      for (const item of items) {
        const position = `${String(sectionNum).padStart(2, '0')}.${String(itemNum).padStart(3, '0')}`;
        const total = Math.round(item.quantity * item.unitPrice * 100) / 100;

        // Find source reference from quantities
        const sourceQty = quantities.find(q => 
          q.label.toLowerCase().includes(item.description.toLowerCase().split(' ')[0])
        );

        sectionItems.push({
          position,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: total,
          sourceReference: sourceQty 
            ? `${sourceQty.sourceDocument}, S. ${sourceQty.sourcePage}`
            : undefined,
        });
        itemNum++;
      }

      const subtotal = sectionItems.reduce((sum, i) => sum + i.totalPrice, 0);

      sections.push({
        number: String(sectionNum).padStart(2, '0'),
        title: category,
        items: sectionItems,
        subtotal: Math.round(subtotal * 100) / 100,
      });
      sectionNum++;
    }

    return sections;
  }

  private groupByCategory(prices: PricedItem[]): Map<string, PricedItem[]> {
    // Simple grouping by first word or explicit category
    const groups = new Map<string, PricedItem[]>();
    
    // Default categories for construction trades
    const categoryKeywords: Record<string, string[]> = {
      'Wandkonstruktionen': ['wand', 'ständer', 'vorsatz', 'schale'],
      'Deckenkonstruktionen': ['decke', 'abhang', 'unterdecke'],
      'Bodenkonstruktionen': ['boden', 'estrich', 'aufbau'],
      'Bekleidungen': ['bekleidung', 'verkleidung', 'leibung'],
      'Dämmarbeiten': ['dämm', 'isolier', 'mineralwolle'],
      'Abdichtungsarbeiten': ['abdicht', 'dicht', 'folie'],
      'Nebenleistungen': ['stundenlohn', 'zulage', 'transport', 'gerüst'],
    };

    for (const item of prices) {
      let assigned = false;
      const descLower = item.description.toLowerCase();

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => descLower.includes(kw))) {
          const existing = groups.get(category) || [];
          existing.push(item);
          groups.set(category, existing);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        const existing = groups.get('Sonstige Leistungen') || [];
        existing.push(item);
        groups.set('Sonstige Leistungen', existing);
      }
    }

    return groups;
  }

  private calculatePricing(sections: OfferSection[]): OfferPricing {
    const netTotal = sections.reduce((sum, s) => sum + s.subtotal, 0);
    
    // Apply discount based on strategy
    let discount = undefined;
    let netAfterDiscount = netTotal;

    if (this.input.strategy.preferredPosition === 'value' && netTotal > 10000) {
      // Offer 2% project discount for value positioning
      const discountPercent = 0.02;
      const discountAmount = Math.round(netTotal * discountPercent * 100) / 100;
      discount = {
        percent: discountPercent * 100,
        amount: discountAmount,
        reason: this.input.language === 'de' ? 'Projektrabatt' : 'Project discount',
      };
      netAfterDiscount = netTotal - discountAmount;
    }

    const vatRate = 0.19;
    const vatAmount = Math.round(netAfterDiscount * vatRate * 100) / 100;
    const grossTotal = Math.round((netAfterDiscount + vatAmount) * 100) / 100;

    return {
      netTotal: Math.round(netTotal * 100) / 100,
      discount,
      netAfterDiscount: Math.round(netAfterDiscount * 100) / 100,
      vatRate,
      vatAmount,
      grossTotal,
    };
  }

  private buildTerms(): OfferTerms {
    const isDE = this.input.language === 'de';

    return {
      validityDays: 30,
      paymentTerms: isDE
        ? '14 Tage netto nach Rechnungseingang'
        : '14 days net after receipt of invoice',
      executionPeriod: isDE
        ? 'Nach Vereinbarung / gemäß Bauzeitenplan'
        : 'By agreement / according to construction schedule',
      warranty: isDE
        ? '5 Jahre gemäß VOB/B bzw. BGB'
        : '5 years according to VOB/B or BGB',
      priceBase: isDE
        ? 'Festpreise für die Dauer der Bindefrist'
        : 'Fixed prices for the duration of the validity period',
    };
  }

  private buildAssumptions(): OfferAssumption[] {
    const standard = getStandardAssumptions(this.input.language, this.input.company.trade);
    const custom = (this.input.customAssumptions || []).map(text => ({
      text,
      category: 'other' as const,
    }));

    return [...standard, ...custom];
  }

  private buildExclusions(): OfferExclusion[] {
    const standard = getStandardExclusions(this.input.language, this.input.company.trade);
    const custom = (this.input.customExclusions || []).map(text => ({
      text,
      standard: false,
    }));

    return [...standard, ...custom];
  }
}

export function generateOffer(input: OfferGenerationInput): OfferDraft {
  const generator = new OfferGenerator(input);
  return generator.generate();
}
```

## German Letter Template (`lib/offer-generation/templates/letter-de.ts`)

```typescript
import { OfferGenerationInput, CompanyProfile, ProjectInfo } from '../types';

export function generateIntroText(input: OfferGenerationInput, lang: 'de' | 'en'): string {
  const { project, company } = input;

  if (lang === 'de') {
    return `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Anfrage vom ${formatDate(project.tenderDate)} bezüglich der ${company.trade}arbeiten für das Bauvorhaben "${project.title}"${project.location ? ` in ${project.location}` : ''}.

Gerne unterbreiten wir Ihnen hiermit unser Angebot für die nachfolgend beschriebenen Leistungen.`;
  }

  return `Dear Sir or Madam,

Thank you for your inquiry dated ${formatDate(project.tenderDate, 'en')} regarding ${company.trade} works for the project "${project.title}"${project.location ? ` in ${project.location}` : ''}.

We are pleased to submit our offer for the services described below.`;
}

export function generateClosingText(input: OfferGenerationInput, lang: 'de' | 'en'): string {
  const { company } = input;

  if (lang === 'de') {
    return `Wir würden uns freuen, dieses Projekt gemeinsam mit Ihnen realisieren zu dürfen.

Für Rückfragen stehen wir Ihnen jederzeit gerne zur Verfügung. Wir freuen uns auf Ihre Rückmeldung.

Mit freundlichen Grüßen

${company.name}`;
  }

  return `We would be pleased to realize this project together with you.

Please do not hesitate to contact us if you have any questions. We look forward to hearing from you.

Best regards

${company.name}`;
}

export function generateOfferHeader(
  company: CompanyProfile,
  project: ProjectInfo,
  offerNumber: string,
  offerDate: Date,
  lang: 'de' | 'en'
): string {
  const labels = lang === 'de' ? {
    offer: 'ANGEBOT',
    offerNo: 'Angebots-Nr.',
    date: 'Datum',
    project: 'Projekt',
    projectRef: 'Ihre Referenz',
    client: 'Auftraggeber',
    validUntil: 'Gültig bis',
  } : {
    offer: 'OFFER',
    offerNo: 'Offer No.',
    date: 'Date',
    project: 'Project',
    projectRef: 'Your Reference',
    client: 'Client',
    validUntil: 'Valid until',
  };

  const validUntil = new Date(offerDate);
  validUntil.setDate(validUntil.getDate() + 30);

  return `
${labels.offer}

${labels.offerNo}: ${offerNumber}
${labels.date}: ${formatDate(offerDate, lang)}
${labels.validUntil}: ${formatDate(validUntil, lang)}

${labels.client}:
${project.client.company}
${project.client.contactPerson ? `z.Hd. ${project.client.contactPerson}` : ''}
${project.client.address || ''}

${labels.project}: ${project.title}
${project.reference ? `${labels.projectRef}: ${project.reference}` : ''}
${project.location ? `Standort: ${project.location}` : ''}
`;
}

function formatDate(date: Date | undefined, lang: 'de' | 'en' = 'de'): string {
  if (!date) return lang === 'de' ? 'auf Anfrage' : 'upon request';
  
  return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
```

## Standard Terms and Conditions (`lib/offer-generation/templates/terms-de.ts`)

```typescript
import { OfferAssumption, OfferExclusion, Language } from '../types';

type Trade = 'drywall' | 'screed' | 'waterproofing' | 'flooring' | 'general';

export function getStandardAssumptions(lang: Language, trade: string): OfferAssumption[] {
  const tradeKey = normalizeTradeKey(trade);
  
  const assumptions: Record<Language, Record<Trade, OfferAssumption[]>> = {
    de: {
      drywall: [
        { text: 'Baustelleneinrichtung, Baustrom und Bauwasser werden bauseits gestellt', category: 'access' },
        { text: 'Die Arbeiten erfolgen in beheizten und witterungsgeschützten Räumen', category: 'access' },
        { text: 'Untergründe sind eben, trocken und tragfähig', category: 'materials' },
        { text: 'Ausführung während der normalen Arbeitszeiten (Mo-Fr 7-17 Uhr)', category: 'timeline' },
        { text: 'Durchlaufende Decken- und Wandflächen ohne Unterbrechung', category: 'scope' },
        { text: 'Material-Anlieferung und Lagerung auf Baustellenebene möglich', category: 'access' },
        { text: 'Aufzugnutzung für Materialtransport vorhanden', category: 'access' },
        { text: 'Oberflächenqualität Q2 sofern nicht anders angegeben', category: 'scope' },
      ],
      screed: [
        { text: 'Baustelleneinrichtung, Baustrom und Bauwasser werden bauseits gestellt', category: 'access' },
        { text: 'Untergrund ist eben, tragfähig und frei von Verunreinigungen', category: 'materials' },
        { text: 'Dämmschichten und Folien werden bauseits verlegt', category: 'scope' },
        { text: 'Ausreichende Trocknungszeit (ca. 1 Tag/cm) wird eingeplant', category: 'timeline' },
        { text: 'Raumtemperatur min. +5°C während Einbau und Trocknung', category: 'access' },
        { text: 'Zugänglichkeit für Estrichpumpe/-mischer', category: 'access' },
        { text: 'Heizestrichprotokoll wird vom Auftraggeber beauftragt', category: 'scope' },
      ],
      waterproofing: [
        { text: 'Untergrund ist trocken, tragfähig und grundiert', category: 'materials' },
        { text: 'Hohlkehlen und Anschlüsse werden bauseits vorbereitet', category: 'scope' },
        { text: 'Anschlussdetails gemäß Planung ausführbar', category: 'scope' },
        { text: 'Witterungsschutz während Ausführung gewährleistet', category: 'access' },
        { text: 'Baustelleneinrichtung und Sozialräume werden gestellt', category: 'access' },
        { text: 'Durchdringungen sind bauseits abgedichtet', category: 'scope' },
      ],
      flooring: [
        { text: 'Untergrund/Estrich ist belegreif (Feuchte <2% CM)', category: 'materials' },
        { text: 'Raumklima entspricht Verlegebedingungen (18-25°C, max. 65% rF)', category: 'access' },
        { text: 'Untergrund ist eben nach DIN 18202 Tabelle 3 Zeile 3', category: 'materials' },
        { text: 'Materiallagerung in klimatisierten Räumen möglich', category: 'access' },
        { text: 'Belag wird in einem Arbeitsgang verlegt', category: 'scope' },
        { text: 'Sockelleisten und Abschlussprofile separat', category: 'scope' },
      ],
      general: [
        { text: 'Baustelleneinrichtung wird bauseits gestellt', category: 'access' },
        { text: 'Ausführung während normaler Arbeitszeiten', category: 'timeline' },
        { text: 'Untergründe sind vertragsgerecht vorbereitet', category: 'materials' },
        { text: 'Koordination mit anderen Gewerken durch Auftraggeber', category: 'timeline' },
      ],
    },
    en: {
      drywall: [
        { text: 'Site facilities, construction power and water provided by client', category: 'access' },
        { text: 'Work to be carried out in heated, weather-protected areas', category: 'access' },
        { text: 'Substrates are level, dry and load-bearing', category: 'materials' },
        { text: 'Execution during normal working hours (Mon-Fri 7am-5pm)', category: 'timeline' },
        { text: 'Continuous ceiling and wall surfaces without interruption', category: 'scope' },
        { text: 'Material delivery and storage possible at floor level', category: 'access' },
        { text: 'Elevator available for material transport', category: 'access' },
        { text: 'Surface quality Q2 unless otherwise specified', category: 'scope' },
      ],
      // ... similar for other trades
      general: [
        { text: 'Site facilities provided by client', category: 'access' },
        { text: 'Execution during normal working hours', category: 'timeline' },
        { text: 'Substrates prepared according to contract', category: 'materials' },
        { text: 'Coordination with other trades by client', category: 'timeline' },
      ],
    },
  };

  return assumptions[lang][tradeKey] || assumptions[lang].general;
}

export function getStandardExclusions(lang: Language, trade: string): OfferExclusion[] {
  const tradeKey = normalizeTradeKey(trade);

  const exclusions: Record<Language, Record<Trade, OfferExclusion[]>> = {
    de: {
      drywall: [
        { text: 'Gerüst- und Schutzmaßnahmen über 3,50m Arbeitshöhe', standard: true },
        { text: 'Brandschutzabschottungen von Durchführungen', standard: true },
        { text: 'Malerarbeiten und Tapezierarbeiten', standard: true },
        { text: 'Elektro-, Sanitär- und Heizungsinstallationen', standard: true },
        { text: 'Revisionsklappen und Einbauteile Dritter', standard: true },
        { text: 'Gebogene Konstruktionen und Sonderformen', standard: true },
        { text: 'Demontage- und Entsorgungsarbeiten', standard: true },
        { text: 'Nacht-, Wochenend- und Feiertagsarbeit', standard: true },
        { text: 'Qualitätsstufen über Q2 (Q3, Q4)', standard: true },
      ],
      screed: [
        { text: 'Dämmarbeiten und Folienverlegung', standard: true },
        { text: 'Randstreifen und Bewegungsfugen (Material)', standard: true },
        { text: 'Oberflächenbehandlung und Versiegelung', standard: true },
        { text: 'Heizestrichprotokoll und Funktionsheizen', standard: true },
        { text: 'Schleifen und Spachteln', standard: true },
        { text: 'Gefälleestrich (ohne separate Beauftragung)', standard: true },
        { text: 'Beschleuniger für Schnellestrich', standard: true },
      ],
      waterproofing: [
        { text: 'Untergrundvorbereitung und Grundierung', standard: true },
        { text: 'Schutzlagen und Drainagen', standard: true },
        { text: 'Einbauteile und Durchführungen abdichten', standard: true },
        { text: 'Gerüststellung über 2,00m', standard: true },
        { text: 'Rückbau bestehender Abdichtungen', standard: true },
        { text: 'Gewährleistung bei fehlender Planung', standard: true },
      ],
      flooring: [
        { text: 'Untergrundvorbereitung und Spachtelung', standard: true },
        { text: 'Sockelleisten und Profile', standard: true },
        { text: 'Treppenkanten und Übergangsschienen', standard: true },
        { text: 'Möbelrücken und Räumung', standard: true },
        { text: 'Entsorgung Altbelag', standard: true },
        { text: 'Fußbodenheizung einmessen', standard: true },
      ],
      general: [
        { text: 'Leistungen die nicht explizit genannt sind', standard: true },
        { text: 'Arbeiten außerhalb normaler Arbeitszeiten', standard: true },
        { text: 'Entsorgung und Rückbau', standard: true },
        { text: 'Schutz- und Sicherungsmaßnahmen', standard: true },
      ],
    },
    en: {
      // Similar structure for English
      general: [
        { text: 'Services not explicitly mentioned', standard: true },
        { text: 'Work outside normal working hours', standard: true },
        { text: 'Disposal and demolition', standard: true },
        { text: 'Protection and safety measures', standard: true },
      ],
    },
  };

  return exclusions[lang][tradeKey] || exclusions[lang].general;
}

function normalizeTradeKey(trade: string): Trade {
  const lower = trade.toLowerCase();
  if (lower.includes('trocken') || lower.includes('drywall') || lower.includes('gips')) {
    return 'drywall';
  }
  if (lower.includes('estrich') || lower.includes('screed')) {
    return 'screed';
  }
  if (lower.includes('abdicht') || lower.includes('waterproof')) {
    return 'waterproofing';
  }
  if (lower.includes('boden') || lower.includes('floor') || lower.includes('belag')) {
    return 'flooring';
  }
  return 'general';
}
```

## PDF Generator (`lib/offer-generation/pdf-generator.ts`)

```typescript
import { OfferDraft, CompanyProfile } from './types';

// Using a library like @react-pdf/renderer or puppeteer for PDF generation

export interface PDFGeneratorOptions {
  includeTermsPage: boolean;
  includeCompanyLogo: boolean;
  paperSize: 'A4' | 'Letter';
  headerStyle: 'minimal' | 'full';
}

export async function generateOfferPDF(
  offer: OfferDraft,
  company: CompanyProfile,
  options: PDFGeneratorOptions = {
    includeTermsPage: true,
    includeCompanyLogo: true,
    paperSize: 'A4',
    headerStyle: 'full',
  }
): Promise<Buffer> {
  // This would use a PDF library - example with HTML template approach
  const html = renderOfferToHTML(offer, company, options);
  
  // Using puppeteer or similar for HTML-to-PDF
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setContent(html);
  // const pdf = await page.pdf({ format: 'A4' });
  // await browser.close();
  // return pdf;
  
  throw new Error('PDF generation requires puppeteer or @react-pdf/renderer');
}

function renderOfferToHTML(
  offer: OfferDraft,
  company: CompanyProfile,
  options: PDFGeneratorOptions
): string {
  const isDE = offer.language === 'de';
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isDE ? 'de-DE' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat(isDE ? 'de-DE' : 'en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return `
<!DOCTYPE html>
<html lang="${offer.language}">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm 15mm 25mm 20mm; }
    body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #333; }
    .header { margin-bottom: 30px; }
    .company-name { font-size: 18pt; font-weight: bold; color: #1e40af; }
    .company-info { font-size: 8pt; color: #666; margin-top: 5px; }
    .offer-title { font-size: 14pt; font-weight: bold; margin: 20px 0; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
    .meta-table { width: 100%; margin-bottom: 20px; }
    .meta-table td { padding: 3px 10px 3px 0; vertical-align: top; }
    .meta-label { font-weight: bold; width: 120px; }
    .intro { margin: 20px 0; }
    .section-title { font-size: 11pt; font-weight: bold; background: #f3f4f6; padding: 8px; margin: 15px 0 10px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .items-table th { background: #1e40af; color: white; padding: 8px; text-align: left; font-size: 9pt; }
    .items-table td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 9pt; }
    .items-table .num { text-align: right; }
    .items-table .pos { width: 50px; }
    .items-table .desc { width: 40%; }
    .items-table .unit { width: 50px; text-align: center; }
    .subtotal-row { background: #f9fafb; font-weight: bold; }
    .totals { margin-top: 20px; width: 300px; margin-left: auto; }
    .totals td { padding: 5px 10px; }
    .totals .label { text-align: right; }
    .totals .amount { text-align: right; font-weight: bold; }
    .grand-total { background: #1e40af; color: white; font-size: 12pt; }
    .terms-section { margin-top: 30px; page-break-inside: avoid; }
    .terms-title { font-size: 11pt; font-weight: bold; margin: 15px 0 10px; }
    .terms-list { margin: 0; padding-left: 20px; }
    .terms-list li { margin-bottom: 5px; }
    .closing { margin-top: 40px; }
    .signature { margin-top: 60px; }
    .footer { position: fixed; bottom: 10mm; left: 20mm; right: 15mm; font-size: 7pt; color: #999; border-top: 1px solid #ddd; padding-top: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${company.name}</div>
    <div class="company-info">
      ${company.address.street} | ${company.address.postalCode} ${company.address.city}
      ${company.contact.phone ? ` | Tel: ${company.contact.phone}` : ''}
      ${company.contact.email ? ` | ${company.contact.email}` : ''}
    </div>
  </div>

  <div class="offer-title">${offer.subject}</div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">${isDE ? 'Angebots-Nr.:' : 'Offer No.:'}</td>
      <td>${offer.offerNumber}</td>
      <td class="meta-label">${isDE ? 'Datum:' : 'Date:'}</td>
      <td>${formatDate(offer.offerDate, offer.language)}</td>
    </tr>
    <tr>
      <td class="meta-label">${isDE ? 'Gültig bis:' : 'Valid until:'}</td>
      <td>${formatDate(addDays(offer.offerDate, offer.terms.validityDays), offer.language)}</td>
      <td></td>
      <td></td>
    </tr>
  </table>

  <div class="intro">${offer.introText?.replace(/\n/g, '<br>')}</div>

  ${offer.sections.map(section => `
    <div class="section-title">${section.number} ${section.title}</div>
    <table class="items-table">
      <thead>
        <tr>
          <th class="pos">${isDE ? 'Pos.' : 'Pos.'}</th>
          <th class="desc">${isDE ? 'Beschreibung' : 'Description'}</th>
          <th class="unit">${isDE ? 'Einheit' : 'Unit'}</th>
          <th class="num">${isDE ? 'Menge' : 'Qty'}</th>
          <th class="num">${isDE ? 'EP (€)' : 'UP (€)'}</th>
          <th class="num">${isDE ? 'GP (€)' : 'Total (€)'}</th>
        </tr>
      </thead>
      <tbody>
        ${section.items.map(item => `
          <tr>
            <td class="pos">${item.position}</td>
            <td class="desc">${item.description}</td>
            <td class="unit">${item.unit}</td>
            <td class="num">${formatNumber(item.quantity, 2)}</td>
            <td class="num">${formatNumber(item.unitPrice, 2)}</td>
            <td class="num">${formatNumber(item.totalPrice, 2)}</td>
          </tr>
        `).join('')}
        <tr class="subtotal-row">
          <td colspan="5" style="text-align: right;">${isDE ? 'Zwischensumme' : 'Subtotal'} ${section.title}:</td>
          <td class="num">${formatNumber(section.subtotal, 2)}</td>
        </tr>
      </tbody>
    </table>
  `).join('')}

  <table class="totals">
    <tr>
      <td class="label">${isDE ? 'Nettosumme:' : 'Net total:'}</td>
      <td class="amount">${formatCurrency(offer.pricing.netTotal)}</td>
    </tr>
    ${offer.pricing.discount ? `
    <tr>
      <td class="label">${offer.pricing.discount.reason} (${offer.pricing.discount.percent}%):</td>
      <td class="amount">- ${formatCurrency(offer.pricing.discount.amount)}</td>
    </tr>
    <tr>
      <td class="label">${isDE ? 'Netto nach Rabatt:' : 'Net after discount:'}</td>
      <td class="amount">${formatCurrency(offer.pricing.netAfterDiscount)}</td>
    </tr>
    ` : ''}
    <tr>
      <td class="label">${isDE ? 'MwSt.' : 'VAT'} (${offer.pricing.vatRate * 100}%):</td>
      <td class="amount">${formatCurrency(offer.pricing.vatAmount)}</td>
    </tr>
    <tr class="grand-total">
      <td class="label">${isDE ? 'Gesamtsumme:' : 'Grand total:'}</td>
      <td class="amount">${formatCurrency(offer.pricing.grossTotal)}</td>
    </tr>
  </table>

  <div class="terms-section">
    <div class="terms-title">${isDE ? 'Leistungsannahmen' : 'Assumptions'}</div>
    <ul class="terms-list">
      ${offer.assumptions.map(a => `<li>${a.text}</li>`).join('')}
    </ul>
  </div>

  <div class="terms-section">
    <div class="terms-title">${isDE ? 'Nicht im Angebot enthalten' : 'Exclusions'}</div>
    <ul class="terms-list">
      ${offer.exclusions.map(e => `<li>${e.text}</li>`).join('')}
    </ul>
  </div>

  <div class="terms-section">
    <div class="terms-title">${isDE ? 'Konditionen' : 'Terms'}</div>
    <ul class="terms-list">
      <li><strong>${isDE ? 'Bindefrist:' : 'Validity:'}</strong> ${offer.terms.validityDays} ${isDE ? 'Tage' : 'days'}</li>
      <li><strong>${isDE ? 'Zahlung:' : 'Payment:'}</strong> ${offer.terms.paymentTerms}</li>
      <li><strong>${isDE ? 'Ausführung:' : 'Execution:'}</strong> ${offer.terms.executionPeriod}</li>
      <li><strong>${isDE ? 'Gewährleistung:' : 'Warranty:'}</strong> ${offer.terms.warranty}</li>
    </ul>
  </div>

  <div class="closing">${offer.closingText?.replace(/\n/g, '<br>')}</div>

  <div class="footer">
    ${company.name} | ${company.address.street}, ${company.address.postalCode} ${company.address.city}
    ${company.taxInfo.vatId ? ` | USt-IdNr.: ${company.taxInfo.vatId}` : ''}
    ${company.bankDetails ? ` | IBAN: ${company.bankDetails.iban}` : ''}
  </div>
</body>
</html>
`;
}

function formatDate(date: Date, lang: 'de' | 'en'): string {
  return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

## React Preview Component (`components/offer/OfferPreview.tsx`)

```typescript
'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { OfferDraft, CompanyProfile } from '@/lib/offer-generation/types';

interface Props {
  offer: OfferDraft;
  company: CompanyProfile;
  onEdit?: () => void;
}

export function OfferPreview({ offer, company, onEdit }: Props) {
  const t = useTranslations('offer');
  const format = useFormatter();
  const isDE = offer.language === 'de';

  const formatCurrency = (amount: number) => 
    format.number(amount, { style: 'currency', currency: 'EUR' });

  const formatQty = (qty: number) =>
    format.number(qty, { minimumFractionDigits: 2, maximumFractionDigits: 3 });

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-blue-200 text-sm mt-1">
              {company.address.street}, {company.address.postalCode} {company.address.city}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">{t('offerNumber')}</div>
            <div className="text-xl font-mono">{offer.offerNumber}</div>
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border-b">
        <div>
          <div className="text-xs text-gray-500">{t('date')}</div>
          <div className="font-medium">{format.dateTime(offer.offerDate)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('validUntil')}</div>
          <div className="font-medium">
            {format.dateTime(new Date(offer.offerDate.getTime() + offer.terms.validityDays * 86400000))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('status')}</div>
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {t(`status.${offer.status}`)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('version')}</div>
          <div className="font-medium">v{offer.version}</div>
        </div>
      </div>

      {/* Subject */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">{offer.subject}</h2>
      </div>

      {/* Intro */}
      {offer.introText && (
        <div className="p-6 border-b prose prose-sm max-w-none">
          {offer.introText.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {/* Line Items */}
      <div className="p-6">
        {offer.sections.map((section) => (
          <div key={section.number} className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded">
              {section.number} {section.title}
            </h3>
            
            <table className="w-full mt-2">
              <thead>
                <tr className="text-xs text-gray-500 border-b">
                  <th className="py-2 text-left w-16">{t('position')}</th>
                  <th className="py-2 text-left">{t('description')}</th>
                  <th className="py-2 text-center w-16">{t('unit')}</th>
                  <th className="py-2 text-right w-20">{t('quantity')}</th>
                  <th className="py-2 text-right w-24">{t('unitPrice')}</th>
                  <th className="py-2 text-right w-28">{t('total')}</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item) => (
                  <tr key={item.position} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-500">{item.position}</td>
                    <td className="py-3">
                      <div className="font-medium text-gray-900">{item.description}</div>
                      {item.notes && (
                        <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                      )}
                    </td>
                    <td className="py-3 text-center text-sm">{item.unit}</td>
                    <td className="py-3 text-right text-sm">{formatQty(item.quantity)}</td>
                    <td className="py-3 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={5} className="py-3 text-right pr-4">
                    {t('subtotal')} {section.title}:
                  </td>
                  <td className="py-3 text-right">{formatCurrency(section.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

        {/* Totals */}
        <div className="mt-8 flex justify-end">
          <div className="w-80 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between py-2 border-b">
              <span>{t('netTotal')}:</span>
              <span className="font-medium">{formatCurrency(offer.pricing.netTotal)}</span>
            </div>
            
            {offer.pricing.discount && (
              <>
                <div className="flex justify-between py-2 text-green-600">
                  <span>{offer.pricing.discount.reason} ({offer.pricing.discount.percent}%):</span>
                  <span>- {formatCurrency(offer.pricing.discount.amount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>{t('netAfterDiscount')}:</span>
                  <span className="font-medium">{formatCurrency(offer.pricing.netAfterDiscount)}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between py-2 border-b">
              <span>{t('vat')} ({offer.pricing.vatRate * 100}%):</span>
              <span>{formatCurrency(offer.pricing.vatAmount)}</span>
            </div>
            
            <div className="flex justify-between py-3 text-lg font-bold bg-blue-700 text-white -mx-4 px-4 -mb-4 rounded-b-lg">
              <span>{t('grandTotal')}:</span>
              <span>{formatCurrency(offer.pricing.grossTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="p-6 border-t bg-gray-50">
        <h3 className="font-bold text-gray-800 mb-3">{t('assumptions')}</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          {offer.assumptions.map((a, i) => (
            <li key={i} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              {a.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Exclusions */}
      <div className="p-6 border-t">
        <h3 className="font-bold text-gray-800 mb-3">{t('exclusions')}</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          {offer.exclusions.map((e, i) => (
            <li key={i} className="flex items-start">
              <span className="text-red-400 mr-2">✗</span>
              {e.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Terms */}
      <div className="p-6 border-t bg-gray-50">
        <h3 className="font-bold text-gray-800 mb-3">{t('terms')}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t('validity')}:</span>
            <span className="ml-2 font-medium">{offer.terms.validityDays} {t('days')}</span>
          </div>
          <div>
            <span className="text-gray-500">{t('payment')}:</span>
            <span className="ml-2 font-medium">{offer.terms.paymentTerms}</span>
          </div>
          <div>
            <span className="text-gray-500">{t('execution')}:</span>
            <span className="ml-2 font-medium">{offer.terms.executionPeriod}</span>
          </div>
          <div>
            <span className="text-gray-500">{t('warranty')}:</span>
            <span className="ml-2 font-medium">{offer.terms.warranty}</span>
          </div>
        </div>
      </div>

      {/* Closing */}
      {offer.closingText && (
        <div className="p-6 border-t prose prose-sm max-w-none">
          {offer.closingText.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {/* Actions */}
      {onEdit && (
        <div className="p-4 border-t bg-gray-100 flex justify-end gap-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-gray-700 bg-white border rounded hover:bg-gray-50"
          >
            {t('edit')}
          </button>
        </div>
      )}
    </div>
  );
}
```

## API Route (`app/api/offers/generate/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOffer } from '@/lib/offer-generation/generator';
import { OfferGenerationInput } from '@/lib/offer-generation/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: OfferGenerationInput = await request.json();

    // Generate offer
    const offer = generateOffer(body);

    // Save to database
    const { data, error } = await supabase
      .from('offer_drafts')
      .insert({
        project_id: offer.projectId,
        version: offer.version,
        status: offer.status,
        offer_number: offer.offerNumber,
        language: offer.language,
        letter_content_de: offer.language === 'de' ? offer.introText : null,
        letter_content_en: offer.language === 'en' ? offer.introText : null,
        assumptions: offer.assumptions.map(a => a.text),
        exclusions: offer.exclusions.map(e => e.text),
        payment_terms: offer.terms.paymentTerms,
        validity_days: offer.terms.validityDays,
        subtotal: offer.pricing.netTotal,
        vat_rate: offer.pricing.vatRate * 100,
        vat_amount: offer.pricing.vatAmount,
        total: offer.pricing.grossTotal,
      })
      .select()
      .single();

    if (error) throw error;

    // Save line items
    const lineItems = offer.sections.flatMap(section =>
      section.items.map((item, idx) => ({
        offer_draft_id: data.id,
        position_number: parseInt(item.position.replace('.', '')),
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.totalPrice,
        notes: item.notes,
        sort_order: idx,
      }))
    );

    await supabase.from('offer_line_items').insert(lineItems);

    return NextResponse.json({
      offer: { ...offer, id: data.id },
      message: 'Offer generated successfully',
    });

  } catch (error) {
    console.error('Offer generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate offer' },
      { status: 500 }
    );
  }
}
```

## Best Practices for Winning Offers

### 1. Strategic Pricing Display
```typescript
// Show competitive positioning without revealing strategy
const pricingDisplay = {
  // DO: Show clean, professional totals
  netTotal: formatCurrency(offer.pricing.netTotal),
  
  // DO: Offer volume discount for larger projects
  discount: offer.pricing.netTotal > 50000 ? '3% Projektrabatt' : null,
  
  // DON'T: Show internal cost breakdowns
  // DON'T: Reveal margin calculations
  // DON'T: Include risk buffer as line item
};
```

### 2. Assumption Strategy
```typescript
// Assumptions protect you while appearing fair
const strategicAssumptions = [
  // Access assumptions - create change order basis
  'Aufzugnutzung für Materialtransport',
  'Baustelleneinrichtung wird gestellt',
  
  // Scope assumptions - define boundaries
  'Oberflächenqualität Q2',
  'Standardausführung gemäß DIN 18181',
  
  // Timeline assumptions - protect schedule
  'Ausführung Mo-Fr 7-17 Uhr',
  'Zusammenhängende Flächen',
];
```

### 3. Professional Exclusions
```typescript
// Clear exclusions prevent disputes
const professionalExclusions = [
  // Always exclude
  'Nacht- und Wochenendarbeit',
  'Entsorgung und Rückbau',
  
  // Trade-specific (create Nachtrag opportunities)
  'Qualitätsstufen über Q2',
  'Sonderkonstruktionen',
  'Brandschutzabschottungen',
];
```

## Integration Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Area Extraction │ ──▶ │ Competitive      │ ──▶ │ Offer Generator │
│ (Quantities)    │     │ Pricing          │     │ (This Skill)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                        ┌──────────────────────────────────────────┐
                        │              OFFER DRAFT                  │
                        ├──────────────────────────────────────────┤
                        │  • Professional letter (DE/EN)           │
                        │  • Line items with competitive prices    │
                        │  • Strategic assumptions                 │
                        │  • Clear exclusions                      │
                        │  • Favorable terms                       │
                        └──────────────────────────────────────────┘
                                                          │
                        ┌─────────────────┬───────────────┴───────────────┐
                        ▼                 ▼                               ▼
                   ┌─────────┐      ┌─────────┐                    ┌─────────┐
                   │  PDF    │      │  Excel  │                    │  JSON   │
                   │ Export  │      │ Export  │                    │ Archive │
                   └─────────┘      └─────────┘                    └─────────┘
```

## Checklist

- [ ] Implement offer generator with all sections
- [ ] Create German letter templates
- [ ] Add standard assumptions by trade
- [ ] Add standard exclusions by trade
- [ ] Build PDF export with professional styling
- [ ] Create preview component
- [ ] Integrate with area extraction results
- [ ] Integrate with competitive pricing
- [ ] Add offer versioning
- [ ] Support German and English output
- [ ] Test with real project data
- [ ] Verify German number/currency formatting
