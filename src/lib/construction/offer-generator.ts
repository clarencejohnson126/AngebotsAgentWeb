/**
 * Offer Document Generator - Based on Real Document Analysis
 *
 * Generates professional German construction offers in the exact format
 * used by subcontractors when bidding on GU projects.
 *
 * Structure from real offers (e.g., HORN_Ü2.pdf):
 * - Company letterhead with full registration details
 * - Project/object reference block
 * - Hierarchical line items with position numbers
 * - Section subtotals with carry-forward (Übertrag)
 * - VAT treatment (typically §13b reverse charge)
 * - Assumptions and conditions (Vorbehalte)
 * - Validity period
 */

import type {
  Angebot,
  AngebotsPosition,
  AngebotsVorbehalte,
  Firmenprofil,
  AngebotsKopf,
  Gewerk,
} from './types';
import { formatGermanNumber, formatGermanCurrency } from './lv-parser';

// =============================================================================
// OFFER DATA BUILDER
// =============================================================================

export interface CreateOfferInput {
  firma: Firmenprofil;
  kopf: Omit<AngebotsKopf, 'gueltigkeitsTage'> & { gueltigkeitsTage?: number };
  positionen: AngebotsPosition[];
  gewerk: Gewerk;
  reverseCharge?: boolean;
  vorbehalte?: Partial<AngebotsVorbehalte>;
}

/**
 * Create a complete offer structure with calculations
 */
export function createOffer(input: CreateOfferInput): Angebot {
  const {
    firma,
    kopf,
    positionen,
    gewerk,
    reverseCharge = true, // Default to §13b for B2B construction
    vorbehalte = {},
  } = input;

  // Calculate section subtotals
  const zwischensummen: Record<string, number> = {};
  let currentSection = '';

  positionen.forEach((pos) => {
    // Extract section from position number (e.g., "04.02" from "04.02.03..0010")
    const parts = pos.oz.split('.');
    const section = parts.slice(0, 2).join('.');

    if (section !== currentSection) {
      currentSection = section;
      if (!zwischensummen[section]) {
        zwischensummen[section] = 0;
      }
    }

    zwischensummen[section] = (zwischensummen[section] || 0) + pos.gesamtpreis;
  });

  // Calculate totals
  const nettoSumme = positionen.reduce((sum, pos) => sum + pos.gesamtpreis, 0);

  // VAT calculation
  const mehrwertsteuer = reverseCharge
    ? { reverseCharge: true as const }
    : {
        reverseCharge: false as const,
        satz: 19,
        betrag: nettoSumme * 0.19,
      };

  const bruttoSumme = reverseCharge
    ? nettoSumme
    : nettoSumme + (mehrwertsteuer.betrag || 0);

  // Build complete offer
  return {
    firma,
    kopf: {
      ...kopf,
      gueltigkeitsTage: kopf.gueltigkeitsTage ?? 14, // Default 2 weeks
    },
    positionen,
    zwischensummen,
    nettoSumme: Math.round(nettoSumme * 100) / 100,
    mehrwertsteuer,
    bruttoSumme: Math.round(bruttoSumme * 100) / 100,
    vorbehalte: buildVorbehalte(gewerk, vorbehalte),
    zahlungsbedingungen: 'Zahlungsziel nach Vereinbarung',
  };
}

// =============================================================================
// STANDARD VORBEHALTE (Assumptions) BY TRADE
// =============================================================================

/**
 * Build standard assumptions based on trade and custom additions
 */
function buildVorbehalte(
  gewerk: Gewerk,
  custom: Partial<AngebotsVorbehalte>
): AngebotsVorbehalte {
  const standardVorbehalte = getStandardVorbehalte(gewerk);

  return {
    preisvorbehalte: [
      ...(standardVorbehalte.preisvorbehalte || []),
      ...(custom.preisvorbehalte || []),
    ],
    baustellenbedingungen: [
      ...(standardVorbehalte.baustellenbedingungen || []),
      ...(custom.baustellenbedingungen || []),
    ],
    ausschluesse: [
      ...(standardVorbehalte.ausschluesse || []),
      ...(custom.ausschluesse || []),
    ],
    beistellungen: [
      ...(standardVorbehalte.beistellungen || []),
      ...(custom.beistellungen || []),
    ],
    zugangsvoraussetzungen: [
      ...(standardVorbehalte.zugangsvoraussetzungen || []),
      ...(custom.zugangsvoraussetzungen || []),
    ],
  };
}

/**
 * Standard assumptions by trade - from real offer analysis
 */
function getStandardVorbehalte(gewerk: Gewerk): AngebotsVorbehalte {
  switch (gewerk) {
    case 'abdichtung':
      return {
        preisvorbehalte: [
          'Aufgrund der aktuell angespannten Weltmarktlage ist vor Beauftragung eine Preisbestätigung erforderlich.',
          'Gültigkeit Angebot: 2 Wochen nach Ausstellungsdatum.',
        ],
        baustellenbedingungen: [
          'Alle Untergründe sind bauseitig so vorzubereiten, dass eine fachgerechte Abdichtung stattfinden kann.',
          'Die zu bearbeitenden Flächen sind frei zugänglich.',
          'Witterungsbedingte Einschränkungen bleiben vorbehalten.',
        ],
        zugangsvoraussetzungen: [
          'Ein Kran für Auf- und Abbau ist bei jedem Ausführungsabschnitt bauseits zu stellen.',
          'Stromversorgung (400V) und Wasseranschluss bauseits.',
        ],
        ausschluesse: [
          'Keine Solarmodule oder Ständerfüße auf den Dachflächen.',
          'Keine Überbauten oder Einhausungen mit Klimageräten.',
        ],
      };

    case 'trockenbau':
      return {
        preisvorbehalte: [
          'Gültigkeit Angebot: 4 Wochen nach Ausstellungsdatum.',
          'Materialpreise unter Vorbehalt aktueller Hersteller-Preislisten.',
        ],
        baustellenbedingungen: [
          'Rohbau fertiggestellt und besenrein übergeben.',
          'Fenster und Außentüren eingebaut, Gebäude wind- und wasserdicht.',
          'Raumtemperatur mindestens +5°C.',
          'Ausreichende Beleuchtung vorhanden.',
        ],
        beistellungen: [
          'Baustrom (230V/400V) bauseits.',
          'Sanitäre Einrichtungen bauseits.',
          'Aufzugnutzung bauseits.',
        ],
        ausschluesse: [
          'Spachtelarbeiten über Q3 hinaus.',
          'Malerarbeiten nicht enthalten.',
        ],
      };

    case 'estrich':
      return {
        preisvorbehalte: [
          'Gültigkeit Angebot: 4 Wochen nach Ausstellungsdatum.',
        ],
        baustellenbedingungen: [
          'Untergrund eben, sauber und tragfähig.',
          'Randstreifen und Dämmung bauseits verlegt.',
          'Raumtemperatur während und nach Einbau mindestens +5°C.',
          'Durchlaufende Beheizung für Trocknungszeit gewährleistet.',
        ],
        beistellungen: [
          'Wasser- und Stromanschluss auf jeder Etage.',
          'Aufzugnutzung für Materialtransport.',
        ],
        ausschluesse: [
          'Schleifen und Grundieren nicht enthalten.',
          'Heizestrich-Aufheizprotokoll separat.',
        ],
      };

    case 'bodenbelag':
      return {
        preisvorbehalte: [
          'Gültigkeit Angebot: 4 Wochen nach Ausstellungsdatum.',
          'Farbabweichungen produktionsbedingt vorbehalten.',
        ],
        baustellenbedingungen: [
          'Untergrund gespachtelt, geschliffen und saugfähig.',
          'CM-Messung mit Ergebnis ≤ 2,0 % (Zementestrich) bzw. ≤ 0,5 % (Calciumsulfat).',
          'Raumtemperatur mindestens +18°C.',
          'Relative Luftfeuchtigkeit ≤ 65%.',
        ],
        beistellungen: [
          'Untergrundsanierung bei Abweichungen.',
          'Bodenmarkierungen.',
        ],
        ausschluesse: [
          'Möbelrücken nicht enthalten.',
          'Sockelleisten-Lackierung nicht enthalten.',
        ],
      };

    default:
      return {};
  }
}

// =============================================================================
// TEXT GENERATION FOR PDF/DOCX
// =============================================================================

/**
 * Generate offer letter text in German
 */
export function generateOfferLetterText(offer: Angebot): string {
  const lines: string[] = [];

  // Header
  lines.push(offer.firma.name);
  lines.push(`${offer.firma.strasse}`);
  lines.push(`${offer.firma.plz} ${offer.firma.ort}`);
  lines.push('');
  lines.push(`Tel: ${offer.firma.telefon}`);
  if (offer.firma.fax) lines.push(`Fax: ${offer.firma.fax}`);
  lines.push(`E-Mail: ${offer.firma.email}`);
  lines.push('');

  // Object reference
  lines.push(`Objekt: ${offer.kopf.objekt}`);
  lines.push(`Projekt-Nr.: ${offer.kopf.projektNummer}`);
  lines.push(`Datum: ${offer.kopf.datum.toLocaleDateString('de-DE')}`);
  if (offer.kopf.revision) lines.push(`Revision: ${offer.kopf.revision}`);
  lines.push('');

  // Greeting
  lines.push('Sehr geehrte Damen und Herren,');
  lines.push('');
  lines.push('für die oben genannten Leistungen bieten wir Ihnen folgende Preise an:');
  lines.push('');

  // Line items summary
  lines.push('--- Positionsübersicht ---');
  offer.positionen.forEach((pos) => {
    lines.push(
      `${pos.oz.padEnd(20)} ${pos.beschreibung.substring(0, 40).padEnd(42)} ` +
      `${formatGermanNumber(pos.menge, 3).padStart(10)} ${pos.einheit.padEnd(4)} ` +
      `${formatGermanCurrency(pos.einheitspreis).padStart(12)} ` +
      `${formatGermanCurrency(pos.gesamtpreis).padStart(14)}`
    );
  });
  lines.push('');

  // Totals
  lines.push('--- Zusammenfassung ---');
  lines.push(`Angebotssumme netto: ${formatGermanCurrency(offer.nettoSumme)}`);

  if (offer.mehrwertsteuer.reverseCharge) {
    lines.push('');
    lines.push('Steuerschuldnerschaft des Leistungsempfängers nach § 13b UStG:');
    lines.push('Die Umsatzsteuer für diese umsatzsteuerpflichtige Werkleistung');
    lines.push('schuldet der Auftraggeber.');
  } else {
    lines.push(`zzgl. ${offer.mehrwertsteuer.satz}% MwSt: ${formatGermanCurrency(offer.mehrwertsteuer.betrag || 0)}`);
    lines.push(`Angebotssumme brutto: ${formatGermanCurrency(offer.bruttoSumme)}`);
  }
  lines.push('');

  // Vorbehalte
  if (Object.values(offer.vorbehalte).some(arr => arr && arr.length > 0)) {
    lines.push('--- Vorbehalte und Annahmen ---');

    if (offer.vorbehalte.preisvorbehalte?.length) {
      lines.push('');
      lines.push('Preisvorbehalte:');
      offer.vorbehalte.preisvorbehalte.forEach((v) => lines.push(`• ${v}`));
    }

    if (offer.vorbehalte.baustellenbedingungen?.length) {
      lines.push('');
      lines.push('Baustellenbedingungen:');
      offer.vorbehalte.baustellenbedingungen.forEach((v) => lines.push(`• ${v}`));
    }

    if (offer.vorbehalte.beistellungen?.length) {
      lines.push('');
      lines.push('Bauseits beizustellen:');
      offer.vorbehalte.beistellungen.forEach((v) => lines.push(`• ${v}`));
    }

    if (offer.vorbehalte.ausschluesse?.length) {
      lines.push('');
      lines.push('Nicht im Angebot enthalten:');
      offer.vorbehalte.ausschluesse.forEach((v) => lines.push(`• ${v}`));
    }

    if (offer.vorbehalte.zugangsvoraussetzungen?.length) {
      lines.push('');
      lines.push('Zugangsvoraussetzungen:');
      offer.vorbehalte.zugangsvoraussetzungen.forEach((v) => lines.push(`• ${v}`));
    }
  }
  lines.push('');

  // Closing
  lines.push(`Dieses Angebot ist gültig bis ${addDays(offer.kopf.datum, offer.kopf.gueltigkeitsTage).toLocaleDateString('de-DE')}.`);
  lines.push('');
  lines.push('Wir hoffen auf gute Zusammenarbeit und verbleiben');
  lines.push('');
  lines.push('mit freundlichen Grüßen');
  lines.push('');
  lines.push(offer.firma.name);
  lines.push('');
  lines.push('');
  lines.push('___________________________');
  lines.push('(Ort, Datum, Unterschrift)');

  return lines.join('\n');
}

// =============================================================================
// BANK GUARANTEE (BÜRGSCHAFT) GENERATOR
// =============================================================================

/**
 * Calculate standard guarantee amount (10% of contract value)
 */
export function calculateBuergschaftsbetrag(
  auftragssumme: number,
  prozent = 10
): number {
  return Math.round(auftragssumme * (prozent / 100) * 100) / 100;
}

/**
 * Generate Bürgschaft text
 */
export function generateBuergschaftText(
  auftragnehmerName: string,
  auftragnehmerAdresse: string,
  auftraggeberName: string,
  auftraggeberAdresse: string,
  betrag: number,
  bauvorhaben: string,
  gewerkNummer: string,
  auftragsschreibenDatum: Date
): string {
  const lines: string[] = [];

  lines.push('BÜRGSCHAFT');
  lines.push('[Bürgschaft zur Vertragserfüllung]');
  lines.push('');
  lines.push('Bürge: _______________________________________________');
  lines.push('');
  lines.push(`Auftragnehmer (NU): ${auftragnehmerName}`);
  lines.push(`                    ${auftragnehmerAdresse}`);
  lines.push('');
  lines.push(`Auftraggeber (AG):  ${auftraggeberName}`);
  lines.push(`                    ${auftraggeberAdresse}`);
  lines.push('');
  lines.push(`Bürgschaftsbetrag:  € ${formatGermanNumber(betrag)}`);
  lines.push(`i.W.: Euro ${numberToGermanWords(betrag)}`);
  lines.push('');
  lines.push(`zum Bauvorhaben / Gewerk: ${bauvorhaben}`);
  lines.push(`                          ${gewerkNummer}`);
  lines.push('');
  lines.push(`zum Auftragsschreiben vom: ${auftragsschreibenDatum.toLocaleDateString('de-DE')}`);
  lines.push('');
  lines.push('Die Bürgschaft sichert die Ansprüche des AG auf vertragsgerechte');
  lines.push('Erfüllung sämtlicher, nach vorstehend bezeichnetem Vertrag');
  lines.push('übernommener Verpflichtungen des NU [Sicherungszweck].');
  lines.push('');
  lines.push('Der Anspruch aus dieser Bürgschaft verjährt frühestens nach');
  lines.push('Ablauf von fünf Jahren, beginnend mit dem Ende des Jahres,');
  lines.push('in dem der Anspruch fällig wird, § 202 Abs. 2 BGB bleibt unberührt.');

  return lines.join('\n');
}

// =============================================================================
// HELPERS
// =============================================================================

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Convert number to German words (simplified)
 */
function numberToGermanWords(num: number): string {
  // This is a simplified version - a full implementation would handle
  // all numbers properly
  const rounded = Math.round(num * 100) / 100;
  const euros = Math.floor(rounded);
  const cents = Math.round((rounded - euros) * 100);

  // Basic word conversion (simplified)
  const euroWords = euros.toLocaleString('de-DE');
  return `${euroWords} ${cents}/100`;
}

// =============================================================================
// EXPORT HELPERS
// =============================================================================

/**
 * Generate filename for offer document
 * Pattern: YYYY-MM-DD_[Firma]_[Projekt]_[Revision].pdf
 */
export function generateOfferFilename(offer: Angebot, extension = 'pdf'): string {
  const dateStr = offer.kopf.datum.toISOString().split('T')[0];
  const firmaShort = offer.firma.name.split(' ')[0].toUpperCase();
  const projektShort = offer.kopf.projektNummer.replace(/[^a-zA-Z0-9]/g, '');
  const revision = offer.kopf.revision ? `_${offer.kopf.revision}` : '';

  return `${dateStr}_${firmaShort}_${projektShort}${revision}.${extension}`;
}
