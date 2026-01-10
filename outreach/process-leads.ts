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
}

interface EnrichedLead {
  // Original
  original_fullName: string;
  original_company: string;
  original_email: string;
  original_linkedIn: string;

  // Detected/Enriched
  detected_first_name: string;
  detected_last_name: string;
  detected_company: string;
  detected_trade: string;
  detected_role: string;
  website: string;
  email: string;
  phone: string;
  source_urls: string;
  personalization_hook: string;
  confidence: number;
  status: 'READY' | 'MISSING_EMAIL' | 'LOW_CONFIDENCE';

  // For email generation
  location: string;
  summary: string;
}

interface EmailTemplate {
  id: number;
  usesDu: boolean;
  usesIch: boolean;
  subjectIndex: number;
}

// Trade detection patterns
const TRADE_PATTERNS: { pattern: RegExp; trade: string }[] = [
  { pattern: /elektro/i, trade: 'Elektro' },
  { pattern: /rohr|sanitär|klempner|spengler|heizung|installation/i, trade: 'SHK' },
  { pattern: /trocken\s?bau|gipser|stuckateur|innenausbau/i, trade: 'Trockenbau' },
  { pattern: /dach|dachdecker|abdichtung|flachdach/i, trade: 'Dach/Abdichtung' },
  { pattern: /maler|lackier|anstrich|beschichtung/i, trade: 'Maler' },
  { pattern: /schreiner|tischler|möbel|holz/i, trade: 'Schreinerei/Tischlerei' },
  { pattern: /metall|schloss|stahl|schmied/i, trade: 'Metallbau' },
  { pattern: /boden|estrich|parkett|fliesen/i, trade: 'Bodenbelag/Estrich' },
  { pattern: /fassade|putz|wdvs|dämmung/i, trade: 'Fassade/WDVS' },
  { pattern: /gerüst/i, trade: 'Gerüstbau' },
  { pattern: /kälte|klima|lüftung/i, trade: 'Kälte/Klima' },
  { pattern: /garten|landschaft|gala/i, trade: 'GaLa-Bau' },
  { pattern: /beton|maurer|rohbau|hochbau/i, trade: 'Rohbau/Maurer' },
  { pattern: /sonnen|rollladen|markise/i, trade: 'Sonnenschutz' },
  { pattern: /messe|laden|shop|showroom/i, trade: 'Messebau/Ladenbau' },
  { pattern: /energie|solar|photovoltaik|wärmepumpe/i, trade: 'Energie/Solar' },
  { pattern: /gebäude|objekt|bau|handwerk/i, trade: 'Bau/Handwerk' },
  { pattern: /immobili/i, trade: 'Immobilien' },
];

// Subject lines - rotating
const SUBJECT_LINES = [
  'Angebot schneller fertig - 2 Wochen testen',
  'Mengen + Angebot in einem Schritt',
  'Kurzfrage zu euren Angeboten',
  'Schneller kalkulieren, öfter den Zuschlag',
  'Mengenermittlung aus Plänen - kurze Frage',
  'Angebote schneller raus, mehr Aufträge',
];

// Generate 12 email templates (6 Du, 6 Sie)
function getEmailTemplates(): EmailTemplate[] {
  const templates: EmailTemplate[] = [];
  for (let i = 0; i < 12; i++) {
    templates.push({
      id: i,
      usesDu: i < 6, // First 6 use "Du", rest use "Sie"
      usesIch: i % 2 === 0, // Alternate between "ich" and "wir"
      subjectIndex: i % SUBJECT_LINES.length,
    });
  }
  return templates;
}

// Deterministic hash to select template variant per lead
function hashToTemplateIndex(input: string): number {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return parseInt(hash.substring(0, 8), 16) % 12;
}

// Detect trade from various fields
function detectTrade(lead: RawLead): string {
  const searchFields = [
    lead.companyName,
    lead.title,
    lead.industry,
    lead.summary,
  ].filter(Boolean).join(' ');

  for (const { pattern, trade } of TRADE_PATTERNS) {
    if (pattern.test(searchFields)) {
      return trade;
    }
  }

  return 'Bau/Handwerk';
}

// Extract location city from full location string
function extractCity(location: string | undefined): string {
  if (!location) return '';
  // Format: "City, State, Deutschland" -> extract City
  const parts = location.split(',');
  return parts[0]?.trim() || '';
}

// Generate personalization hook from lead data
function generatePersonalizationHook(lead: RawLead, trade: string): string {
  const hooks: string[] = [];

  // Location-based
  const city = extractCity(lead.location || lead.companyLocation);
  if (city) {
    hooks.push(`Betrieb aus ${city}`);
    hooks.push(`im Raum ${city}`);
  }

  // Trade-based
  if (trade && trade !== 'Bau/Handwerk') {
    hooks.push(`im ${trade}`);
    hooks.push(`als ${trade}-Betrieb`);
  }

  // Company name reference
  if (lead.companyName) {
    hooks.push(`bei ${lead.companyName}`);
  }

  // Experience-based (from title duration if available)
  if (lead.summary && lead.summary.length > 50) {
    if (/erfahr|jahr|seit|gründ/i.test(lead.summary)) {
      hooks.push('mit langjähriger Erfahrung');
    }
  }

  // Pick one deterministically
  if (hooks.length === 0) return '';
  const index = hashToTemplateIndex(lead.email || lead.companyName || '') % hooks.length;
  return hooks[index];
}

// Sanitize filename
function sanitizeFilename(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 100);
}

// Generate email body
function generateEmailBody(lead: EnrichedLead, template: EmailTemplate): { subject: string; body: string } {
  const subject = SUBJECT_LINES[template.subjectIndex];

  const firstName = lead.detected_first_name;
  const du = template.usesDu;
  const ich = template.usesIch;

  // Greetings
  const greetings = du
    ? [`Hallo ${firstName},`, `Hi ${firstName},`, `Moin ${firstName},`]
    : [`Guten Tag Herr/Frau ${lead.detected_last_name},`, `Sehr geehrte/r Herr/Frau ${lead.detected_last_name},`];

  const greeting = greetings[hashToTemplateIndex(lead.email + 'greeting') % greetings.length];

  // Personalization line
  const personalization = lead.personalization_hook
    ? (du
        ? `Ich hab gesehen, dass ihr ${lead.personalization_hook} aktiv seid.`
        : `Ich habe gesehen, dass Sie ${lead.personalization_hook} tätig sind.`)
    : '';

  // Main pitch variants
  const pitchVariants = [
    // Variant 1
    {
      intro: ich
        ? `ich arbeite an einer Software für Handwerksbetriebe`
        : `wir sind ein kleines Team und bauen eine Software für Handwerksbetriebe`,
      body: du
        ? `damit kannst du Mengen aus Plänen und Ausschreibungen schneller ziehen, Nachtragspotenziale früh sehen und dein Angebot direkt als Excel oder PDF exportieren.`
        : `damit können Sie Mengen aus Plänen und Ausschreibungen schneller ziehen, Nachtragspotenziale früh erkennen und das Angebot direkt als Excel oder PDF exportieren.`,
      goal: du
        ? `Ziel: schneller anbieten und öfter den Zuschlag vom GU bekommen.`
        : `Ziel: schneller anbieten und häufiger den Zuschlag vom GU bekommen.`,
    },
    // Variant 2
    {
      intro: ich
        ? `ich baue AngebotsAgent`
        : `wir bauen AngebotsAgent`,
      body: du
        ? `eine Software, die dir hilft, Mengen aus Bauplänen zu ziehen, Nachträge früh zu erkennen und Angebote schneller rauszuschicken.`
        : `eine Software, die Ihnen hilft, Mengen aus Bauplänen zu ziehen, Nachträge früh zu erkennen und Angebote schneller fertigzustellen.`,
      goal: du
        ? `Heisst: weniger Zeitdruck, mehr Aufträge.`
        : `Bedeutet: weniger Zeitdruck, mehr Aufträge.`,
    },
    // Variant 3
    {
      intro: ich
        ? `ich hab mir gedacht, das könnte für euch passen`
        : `wir haben ein Tool entwickelt, das für Sie interessant sein könnte`,
      body: du
        ? `AngebotsAgent - zieht Mengen aus Plänen, zeigt Nachtragspotenziale und hilft bei der Kalkulation. Export als Excel/PDF.`
        : `AngebotsAgent - zieht Mengen aus Plänen, zeigt Nachtragspotenziale und unterstützt bei der Kalkulation. Export als Excel/PDF.`,
      goal: du
        ? `Schneller Angebote raus, öfter den Job bekommen.`
        : `Schneller Angebote fertigstellen, öfter den Auftrag sichern.`,
    },
  ];

  const pitchIndex = hashToTemplateIndex(lead.email + 'pitch') % pitchVariants.length;
  const pitch = pitchVariants[pitchIndex];

  // CTA variants
  const ctaVariants = du
    ? [
        `Wäre das grundsätzlich was für euch?`,
        `Soll ich dir kurz zeigen, wie das funktioniert?`,
        `Hast du Lust, das mal 2 Wochen zu testen?`,
        `Passt das bei euch?`,
        `Interesse an 2 Wochen kostenlos testen?`,
      ]
    : [
        `Wäre das grundsätzlich etwas für Sie?`,
        `Soll ich Ihnen kurz zeigen, wie das funktioniert?`,
        `Hätten Sie Interesse, das 2 Wochen zu testen?`,
        `Passt das zu Ihrer Arbeitsweise?`,
        `Interesse an einem 2-wöchigen Test?`,
      ];

  const cta = ctaVariants[hashToTemplateIndex(lead.email + 'cta') % ctaVariants.length];

  // Closing
  const closings = ich
    ? [`Gruss\nClarence`, `VG\nClarence`, `Beste Grüsse\nClarence`]
    : [`Gruss vom Team\nClarence`, `Beste Grüsse\nClarence (AngebotsAgent)`, `VG\nClarence`];

  const closing = closings[hashToTemplateIndex(lead.email + 'closing') % closings.length];

  // Link
  const link = `https://angebotsagent.de`;

  // Assemble email
  const lines = [
    greeting,
    '',
  ];

  if (personalization) {
    lines.push(personalization);
    lines.push('');
  }

  lines.push(`${pitch.intro} - ${pitch.body}`);
  lines.push('');
  lines.push(pitch.goal);
  lines.push('');
  lines.push(`Hier mehr Infos: ${link}`);
  lines.push('');
  lines.push(cta);
  lines.push('');
  lines.push(closing);

  // Email field handling
  const emailLine = lead.email || '{{email_not_found}}';

  return {
    subject,
    body: lines.join('\n'),
  };
}

// Main processing function
async function processLeads() {
  const inputDir = path.join(__dirname, 'input');
  const enrichedDir = path.join(__dirname, 'enriched');
  const emailsDir = path.join(__dirname, 'emails');
  const logsDir = path.join(__dirname, 'logs');

  // Find input file
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.csv'));
  if (files.length === 0) {
    console.error('No XLSX or CSV file found in input/');
    process.exit(1);
  }

  const inputFile = path.join(inputDir, files[0]);
  console.log(`Processing: ${inputFile}`);

  // Parse XLSX
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputFile);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    console.error('No worksheet found');
    process.exit(1);
  }

  // Get headers from first row
  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value || '').trim();
  });

  console.log(`Found ${headers.length} columns`);

  // Parse rows
  const rawLeads: RawLead[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const lead: Record<string, string> = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        lead[header] = String(cell.value || '').trim();
      }
    });

    rawLeads.push({
      domain_name: lead.domain_name,
      email: lead.email || lead.valid_email_only,
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
    });
  });

  console.log(`Parsed ${rawLeads.length} leads`);

  // Enrich leads
  const templates = getEmailTemplates();
  const enrichedLeads: EnrichedLead[] = [];
  const logEntries: string[] = [];

  for (const raw of rawLeads) {
    const trade = detectTrade(raw);
    const hook = generatePersonalizationHook(raw, trade);
    const website = raw.domain_name ? `https://${raw.domain_name}` : '';

    // Determine status
    let status: EnrichedLead['status'] = 'READY';
    let confidence = 0.8;

    if (!raw.email && !raw.valid_email_only) {
      status = 'MISSING_EMAIL';
      confidence = 0.5;
    } else if (!raw.firstName || !raw.companyName) {
      status = 'LOW_CONFIDENCE';
      confidence = 0.6;
    }

    const enriched: EnrichedLead = {
      original_fullName: raw.fullName || '',
      original_company: raw.companyName || '',
      original_email: raw.email || raw.valid_email_only || '',
      original_linkedIn: raw.linkedInProfileUrl || raw.profileUrl || '',

      detected_first_name: raw.firstName || raw.fullName?.split(' ')[0] || '',
      detected_last_name: raw.lastName || raw.fullName?.split(' ').slice(1).join(' ') || '',
      detected_company: raw.companyName || '',
      detected_trade: trade,
      detected_role: raw.title || 'Geschäftsführer',
      website,
      email: raw.email || raw.valid_email_only || '',
      phone: '', // Would need web scraping to find
      source_urls: [raw.linkedInProfileUrl, website].filter(Boolean).join(';'),
      personalization_hook: hook,
      confidence,
      status,

      location: extractCity(raw.location || raw.companyLocation),
      summary: raw.summary || '',
    };

    enrichedLeads.push(enriched);

    // Log entry
    logEntries.push(`[${status}] ${enriched.detected_company} - ${enriched.detected_first_name} ${enriched.detected_last_name} - ${enriched.email || 'NO EMAIL'} - Trade: ${trade}`);
  }

  // Write enriched CSV
  const csvHeaders = [
    'original_fullName',
    'original_company',
    'original_email',
    'original_linkedIn',
    'detected_first_name',
    'detected_last_name',
    'detected_company',
    'detected_trade',
    'detected_role',
    'website',
    'email',
    'phone',
    'source_urls',
    'personalization_hook',
    'confidence',
    'status',
  ];

  const csvRows = [csvHeaders.join(',')];
  for (const lead of enrichedLeads) {
    const row = csvHeaders.map(h => {
      const val = lead[h as keyof EnrichedLead];
      // Escape quotes and wrap in quotes if contains comma
      const strVal = String(val || '');
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    });
    csvRows.push(row.join(','));
  }

  fs.writeFileSync(path.join(enrichedDir, 'leads_enriched.csv'), csvRows.join('\n'), 'utf8');
  console.log(`Wrote enriched CSV: ${enrichedLeads.length} leads`);

  // Write individual JSON files and emails
  let emailCount = 0;
  for (const lead of enrichedLeads) {
    // Skip leads without names
    if (!lead.detected_first_name && !lead.detected_last_name && !lead.detected_company) {
      continue;
    }

    // Write JSON
    const jsonFilename = sanitizeFilename(`${lead.detected_company}_${lead.detected_last_name}_${lead.detected_first_name}`) + '.json';
    fs.writeFileSync(
      path.join(enrichedDir, jsonFilename),
      JSON.stringify(lead, null, 2),
      'utf8'
    );

    // Select template
    const templateIndex = hashToTemplateIndex(lead.email || lead.detected_company);
    const template = templates[templateIndex];

    // Generate email
    const { subject, body } = generateEmailBody(lead, template);

    // Write email file
    const emailFilename = sanitizeFilename(`${lead.detected_company}_${lead.detected_last_name}_${lead.detected_first_name}`) + '.txt';
    const emailContent = `Betreff: ${subject}\n\nAn: ${lead.email || '{{email_not_found}}'}\n\n---\n\n${body}`;

    fs.writeFileSync(
      path.join(emailsDir, emailFilename),
      emailContent,
      'utf8'
    );

    emailCount++;
  }

  console.log(`Generated ${emailCount} email drafts`);

  // Write logs
  const logContent = [
    `Processing completed: ${new Date().toISOString()}`,
    `Input file: ${inputFile}`,
    `Total leads: ${rawLeads.length}`,
    `Emails generated: ${emailCount}`,
    '',
    'Lead Status:',
    `- READY: ${enrichedLeads.filter(l => l.status === 'READY').length}`,
    `- MISSING_EMAIL: ${enrichedLeads.filter(l => l.status === 'MISSING_EMAIL').length}`,
    `- LOW_CONFIDENCE: ${enrichedLeads.filter(l => l.status === 'LOW_CONFIDENCE').length}`,
    '',
    'Detailed log:',
    ...logEntries,
  ].join('\n');

  fs.writeFileSync(path.join(logsDir, 'processing.log'), logContent, 'utf8');

  // Summary stats
  const tradeStats: Record<string, number> = {};
  for (const lead of enrichedLeads) {
    tradeStats[lead.detected_trade] = (tradeStats[lead.detected_trade] || 0) + 1;
  }

  console.log('\nTrade distribution:');
  Object.entries(tradeStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([trade, count]) => {
      console.log(`  ${trade}: ${count}`);
    });

  console.log('\nDone!');
}

// Run
processLeads().catch(console.error);
