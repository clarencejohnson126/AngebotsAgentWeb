import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Types
interface RawLead {
  domain_name?: string;
  email?: string;
  valid_email_only?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  companyName?: string;
  title?: string;
  industry?: string;
  companyLocation?: string;
  location?: string;
  summary?: string;
  linkedInProfileUrl?: string;
  profileUrl?: string;
  companyUrl?: string;
  regularCompanyUrl?: string;
  titleDescription?: string;
}

interface EnrichedLead {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  trade: string;
  website: string;
  location: string;
  linkedIn: string;
  websiteInfo: string;
  personalizationHook: string;
  confidence: number;
  status: 'READY' | 'MISSING_EMAIL' | 'LOW_CONFIDENCE';
}

// Trade detection patterns
const TRADE_PATTERNS: { pattern: RegExp; trade: string }[] = [
  { pattern: /elektro/i, trade: 'Elektro' },
  { pattern: /sanitär|heizung|shk|installation|haustechnik|wasser/i, trade: 'SHK' },
  { pattern: /trocken\s?bau|gipser|stuckateur|innenausbau/i, trade: 'Trockenbau' },
  { pattern: /dach|dachdecker|abdichtung|flachdach|spengler/i, trade: 'Dach' },
  { pattern: /maler|lackier|anstrich|beschichtung/i, trade: 'Maler' },
  { pattern: /schreiner|tischler|möbel|holz/i, trade: 'Tischlerei' },
  { pattern: /metall|schloss|stahl|schmied/i, trade: 'Metallbau' },
  { pattern: /boden|estrich|parkett|fliesen/i, trade: 'Boden/Fliesen' },
  { pattern: /fassade|putz|wdvs|dämmung/i, trade: 'Fassade' },
  { pattern: /gerüst/i, trade: 'Gerüstbau' },
  { pattern: /kälte|klima|lüftung/i, trade: 'Klima/Kälte' },
  { pattern: /garten|landschaft|gala/i, trade: 'GaLa-Bau' },
  { pattern: /beton|maurer|rohbau|hochbau/i, trade: 'Rohbau' },
  { pattern: /sonnen|rollladen|markise/i, trade: 'Sonnenschutz' },
  { pattern: /fenster|türen|glas/i, trade: 'Fenster/Türen' },
  { pattern: /energie|solar|photovoltaik|wärmepumpe/i, trade: 'Energie' },
  { pattern: /aufzug|lift/i, trade: 'Aufzüge' },
  { pattern: /sicher|alarm|brand/i, trade: 'Sicherheitstechnik' },
];

// Subject lines
const SUBJECT_LINES = [
  'Kurze Frage',
  'Angebote',
  'Idee für euch',
  'Tool für Kalkulation',
  'Schneller kalkulieren',
  'Mengenermittlung',
];

// Deterministic hash
function hashString(input: string): number {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
}

// Detect trade
function detectTrade(lead: RawLead): string {
  const searchFields = [
    lead.companyName,
    lead.title,
    lead.industry,
    lead.summary,
    lead.titleDescription,
  ].filter(Boolean).join(' ');

  for (const { pattern, trade } of TRADE_PATTERNS) {
    if (pattern.test(searchFields)) {
      return trade;
    }
  }
  return 'Handwerk';
}

// Extract city from location
function extractCity(location: string | undefined): string {
  if (!location) return '';
  const parts = location.split(',');
  return parts[0]?.trim() || '';
}

// Fetch website content
async function fetchWebsiteInfo(domain: string): Promise<string> {
  if (!domain) return '';

  const url = domain.startsWith('http') ? domain : `https://${domain}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; outreach-bot/1.0)',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return '';

    const html = await response.text();

    // Extract useful text (title, meta description, h1s)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);

    const parts: string[] = [];
    if (titleMatch) parts.push(titleMatch[1].trim());
    if (descMatch) parts.push(descMatch[1].trim());
    if (h1Match) {
      h1Match.slice(0, 2).forEach(h => {
        const text = h.replace(/<[^>]+>/g, '').trim();
        if (text.length > 3 && text.length < 100) parts.push(text);
      });
    }

    return parts.join(' | ').substring(0, 300);
  } catch {
    return '';
  }
}

// Extract personalization from available data
function extractPersonalization(lead: RawLead, websiteInfo: string, trade: string): string {
  const hooks: string[] = [];

  // From LinkedIn summary - extract specific services or history
  if (lead.summary) {
    // Years in business
    const yearsMatch = lead.summary.match(/seit\s+(\d{4})|(\d+)\s+jahre/i);
    if (yearsMatch) {
      const year = yearsMatch[1] || yearsMatch[2];
      if (yearsMatch[1]) {
        const years = new Date().getFullYear() - parseInt(year);
        if (years > 10) hooks.push(`über ${years} Jahre am Markt`);
      }
    }

    // Employee count
    const empMatch = lead.summary.match(/(\d+)\s*(mitarbeiter|fachkräfte|angestellte)/i);
    if (empMatch) {
      hooks.push(`${empMatch[1]} Mitarbeiter`);
    }

    // Specific services mentioned
    if (/badsanierung/i.test(lead.summary)) hooks.push('Badsanierungen');
    if (/heizungsmodernisierung/i.test(lead.summary)) hooks.push('Heizungsmodernisierung');
    if (/sanierung/i.test(lead.summary)) hooks.push('Sanierungen');
    if (/neubau/i.test(lead.summary)) hooks.push('Neubau');
    if (/gewerbe/i.test(lead.summary)) hooks.push('Gewerbeprojekte');
    if (/privat/i.test(lead.summary)) hooks.push('Privatprojekte');
  }

  // From titleDescription
  if (lead.titleDescription) {
    if (/seit\s+\d{4}/i.test(lead.titleDescription)) {
      const match = lead.titleDescription.match(/seit\s+(\d{4})/i);
      if (match) {
        hooks.push(`Tradition seit ${match[1]}`);
      }
    }
  }

  // From website info
  if (websiteInfo) {
    if (/meisterbetrieb/i.test(websiteInfo)) hooks.push('Meisterbetrieb');
    if (/familienunternehmen|familienbetrieb/i.test(websiteInfo)) hooks.push('Familienbetrieb');
    if (/regional/i.test(websiteInfo)) hooks.push('regional verwurzelt');
  }

  // Trade-specific hooks
  if (trade && trade !== 'Handwerk') {
    hooks.push(trade);
  }

  // Pick best hook (prefer specific over generic)
  if (hooks.length === 0) return '';

  // Prioritize years/employees/specific services over generic trade
  const prioritized = hooks.filter(h =>
    /jahre|mitarbeiter|sanierung|meister|familie|tradition/i.test(h)
  );

  if (prioritized.length > 0) {
    return prioritized[hashString(lead.email || lead.companyName || '') % prioritized.length];
  }

  return hooks[hashString(lead.email || lead.companyName || '') % hooks.length];
}

// Sanitize filename
function sanitizeFilename(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 80);
}

// Generate short iPhone-style email
function generateEmail(lead: EnrichedLead): { subject: string; body: string } {
  const hash = hashString(lead.email);
  const usesDu = hash % 2 === 0;
  const usesIch = (hash >> 1) % 2 === 0;
  const subjectIndex = hash % SUBJECT_LINES.length;

  const subject = SUBJECT_LINES[subjectIndex];
  const firstName = lead.firstName;

  // Greetings (short, casual)
  const greetingsDu = [`Hi ${firstName},`, `Moin ${firstName},`, `Hey ${firstName},`];
  const greetingsSie = [`Hallo Herr ${lead.lastName},`, `Guten Tag Herr ${lead.lastName},`];

  const greeting = usesDu
    ? greetingsDu[hash % greetingsDu.length]
    : greetingsSie[hash % greetingsSie.length];

  // Personalization line (only if we have something good, not location-based)
  let personalizationLine = '';
  if (lead.personalizationHook && !/^(Handwerk|Bau)$/i.test(lead.personalizationHook)) {
    const persTemplates = usesDu ? [
      `${lead.personalizationHook} - da passt das vielleicht.`,
      `Hab gesehen: ${lead.personalizationHook}. Könnte passen.`,
      `${lead.personalizationHook} - genau dafür haben wir was gebaut.`,
    ] : [
      `${lead.personalizationHook} - da könnte das passen.`,
      `Bei ${lead.personalizationHook} ist das oft ein Thema.`,
    ];
    personalizationLine = persTemplates[hash % persTemplates.length];
  }

  // Main pitch (very short)
  const pitchesDu = [
    `${usesIch ? 'Ich baue' : 'Wir bauen'} gerade ein Tool, mit dem du Mengen aus Plänen ziehen und Angebote schneller kalkulieren kannst.`,
    `${usesIch ? 'Ich arbeite' : 'Wir arbeiten'} an einer Software für Angebotskalkulation - Mengen aus Plänen, Nachträge erkennen, Export als Excel.`,
    `Kurz: ${usesIch ? 'ich habe' : 'wir haben'} ein Tool gebaut, das Mengenermittlung und Kalkulation deutlich schneller macht.`,
  ];

  const pitchesSie = [
    `${usesIch ? 'Ich baue' : 'Wir bauen'} gerade ein Tool, mit dem Sie Mengen aus Plänen ziehen und Angebote schneller kalkulieren können.`,
    `${usesIch ? 'Ich arbeite' : 'Wir arbeiten'} an einer Software für Angebotskalkulation - Mengen aus Plänen, Nachträge erkennen, Export als Excel.`,
    `Kurz: ${usesIch ? 'ich habe' : 'wir haben'} ein Tool gebaut, das Mengenermittlung und Kalkulation deutlich schneller macht.`,
  ];

  const pitch = usesDu
    ? pitchesDu[hash % pitchesDu.length]
    : pitchesSie[hash % pitchesSie.length];

  // Demo CTA
  const demoCtasDu = [
    `Schau dir gern mal die Demo an: https://angebotsagent.de - wenn das grundsätzlich passt, können wir das auf eure Abläufe anpassen.`,
    `Hier kannst du es mal antesten: https://angebotsagent.de - sag Bescheid, wenn du Fragen hast oder wir das für euch anpassen sollen.`,
    `Probier es gern mal aus: https://angebotsagent.de - wir können das auch speziell für euren Bedarf bauen.`,
  ];

  const demoCtasSie = [
    `Schauen Sie sich gern mal die Demo an: https://angebotsagent.de - wenn das grundsätzlich passt, können wir das auf Ihre Abläufe anpassen.`,
    `Hier können Sie es antesten: https://angebotsagent.de - melden Sie sich gern, wenn wir das für Sie anpassen sollen.`,
    `Testen Sie es gern: https://angebotsagent.de - wir können das auch speziell für Ihren Bedarf bauen.`,
  ];

  const demoCta = usesDu
    ? demoCtasDu[hash % demoCtasDu.length]
    : demoCtasSie[hash % demoCtasSie.length];

  // Closing (very short, iPhone style)
  const closings = ['Gruss, Clarence', 'VG Clarence', 'Beste Grüsse, Clarence'];
  const closing = closings[hash % closings.length];

  // Assemble email (4-5 sentences)
  const lines = [greeting, ''];

  if (personalizationLine) {
    lines.push(personalizationLine);
    lines.push('');
  }

  lines.push(pitch);
  lines.push('');
  lines.push(demoCta);
  lines.push('');
  lines.push(closing);

  return { subject, body: lines.join('\n') };
}

// Parse single XLSX file
async function parseXlsx(filePath: string): Promise<RawLead[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value || '').trim();
  });

  const leads: RawLead[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const lead: Record<string, string> = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        lead[header] = String(cell.value || '').trim();
      }
    });

    // Only include leads with email
    const email = lead.email || lead.valid_email_only;
    if (!email || !email.includes('@')) return;

    leads.push({
      domain_name: lead.domain_name,
      email: email,
      valid_email_only: lead.valid_email_only,
      firstName: lead.firstName,
      lastName: lead.lastName,
      fullName: lead.fullName,
      companyName: lead.companyName,
      title: lead.title,
      industry: lead.industry,
      companyLocation: lead.companyLocation,
      location: lead.location,
      summary: lead.summary,
      linkedInProfileUrl: lead.linkedInProfileUrl,
      profileUrl: lead.profileUrl,
      companyUrl: lead.companyUrl,
      regularCompanyUrl: lead.regularCompanyUrl,
      titleDescription: lead.titleDescription,
    });
  });

  return leads;
}

// Main
async function main() {
  const inputDir = path.join(__dirname, 'input');
  const emailsDir = path.join(__dirname, 'emails');
  const enrichedDir = path.join(__dirname, 'enriched');
  const logsDir = path.join(__dirname, 'logs');

  // Find all input files
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.csv'));
  console.log(`Found ${files.length} input files`);

  const allLeads: RawLead[] = [];

  for (const file of files) {
    const filePath = path.join(inputDir, file);
    console.log(`Parsing: ${file}`);
    const leads = await parseXlsx(filePath);
    console.log(`  -> ${leads.length} leads with emails`);
    allLeads.push(...leads);
  }

  console.log(`\nTotal leads with emails: ${allLeads.length}`);
  console.log('Fetching website info and generating emails...\n');

  const enrichedLeads: EnrichedLead[] = [];
  const logLines: string[] = [];
  let processed = 0;

  for (const raw of allLeads) {
    processed++;
    if (processed % 20 === 0) {
      console.log(`Progress: ${processed}/${allLeads.length}`);
    }

    // Fetch website info (with rate limiting)
    const websiteInfo = await fetchWebsiteInfo(raw.domain_name || '');

    const trade = detectTrade(raw);
    const personalizationHook = extractPersonalization(raw, websiteInfo, trade);

    const enriched: EnrichedLead = {
      firstName: raw.firstName || raw.fullName?.split(' ')[0] || '',
      lastName: raw.lastName || raw.fullName?.split(' ').slice(1).join(' ') || '',
      company: raw.companyName || '',
      email: raw.email || '',
      trade,
      website: raw.domain_name ? `https://${raw.domain_name}` : '',
      location: extractCity(raw.location || raw.companyLocation),
      linkedIn: raw.linkedInProfileUrl || raw.profileUrl || '',
      websiteInfo,
      personalizationHook,
      confidence: 0.9,
      status: 'READY',
    };

    enrichedLeads.push(enriched);

    // Generate email
    const { subject, body } = generateEmail(enriched);

    // Write email file
    const filename = sanitizeFilename(`${enriched.company}_${enriched.lastName}_${enriched.firstName}`) + '.txt';
    const emailContent = `Betreff: ${subject}\n\nAn: ${enriched.email}\n\n---\n\n${body}`;

    fs.writeFileSync(path.join(emailsDir, filename), emailContent, 'utf8');

    logLines.push(`[OK] ${enriched.company} - ${enriched.firstName} ${enriched.lastName} - ${enriched.email} - ${trade} - Hook: ${personalizationHook || 'none'}`);

    // Small delay to not hammer websites
    await new Promise(r => setTimeout(r, 100));
  }

  // Write enriched CSV
  const csvHeaders = ['firstName', 'lastName', 'company', 'email', 'trade', 'website', 'location', 'personalizationHook', 'status'];
  const csvRows = [csvHeaders.join(',')];
  for (const lead of enrichedLeads) {
    const row = csvHeaders.map(h => {
      const val = String(lead[h as keyof EnrichedLead] || '');
      if (val.includes(',') || val.includes('"')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvRows.push(row.join(','));
  }
  fs.writeFileSync(path.join(enrichedDir, 'leads_enriched.csv'), csvRows.join('\n'), 'utf8');

  // Write log
  const logContent = [
    `Processing completed: ${new Date().toISOString()}`,
    `Total emails generated: ${enrichedLeads.length}`,
    '',
    'Trade distribution:',
    ...Object.entries(
      enrichedLeads.reduce((acc, l) => {
        acc[l.trade] = (acc[l.trade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).map(([t, c]) => `  ${t}: ${c}`),
    '',
    'Details:',
    ...logLines,
  ].join('\n');

  fs.writeFileSync(path.join(logsDir, 'processing.log'), logContent, 'utf8');

  console.log(`\nDone! Generated ${enrichedLeads.length} emails.`);
  console.log(`Output: ${emailsDir}`);
}

main().catch(console.error);
