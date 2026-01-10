import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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
  personalizationHook: string;
}

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

const SUBJECT_LINES = [
  'Kurze Frage',
  'Angebote schneller raus',
  'Idee für euch',
  'Tool für Kalkulation',
  'Mengenermittlung',
  'Kalkulation',
  'Individuelles Tool',
];

function hashString(input: string): number {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
}

function detectTrade(lead: RawLead): string {
  const searchFields = [lead.companyName, lead.title, lead.industry, lead.summary, lead.titleDescription].filter(Boolean).join(' ');
  for (const { pattern, trade } of TRADE_PATTERNS) {
    if (pattern.test(searchFields)) return trade;
  }
  return 'Handwerk';
}

function extractCity(location: string | undefined): string {
  if (!location) return '';
  return location.split(',')[0]?.trim() || '';
}

async function fetchWebsiteInfo(domain: string): Promise<string> {
  if (!domain) return '';
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(timeout);
    if (!response.ok) return '';
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const parts: string[] = [];
    if (titleMatch) parts.push(titleMatch[1].trim());
    if (descMatch) parts.push(descMatch[1].trim());
    return parts.join(' | ').substring(0, 300);
  } catch {
    return '';
  }
}

function extractPersonalization(lead: RawLead, websiteInfo: string, trade: string): string {
  const hooks: string[] = [];

  if (lead.summary) {
    const yearsMatch = lead.summary.match(/seit\s+(\d{4})/i);
    if (yearsMatch) {
      const years = new Date().getFullYear() - parseInt(yearsMatch[1]);
      if (years > 10) hooks.push(`über ${years} Jahre Erfahrung`);
    }
    const empMatch = lead.summary.match(/(\d+)\s*(mitarbeiter|fachkräfte)/i);
    if (empMatch) hooks.push(`${empMatch[1]} Mitarbeiter`);
    if (/badsanierung/i.test(lead.summary)) hooks.push('Badsanierungen');
    if (/heizungsmodernisierung/i.test(lead.summary)) hooks.push('Heizungsmodernisierung');
    if (/sanierung/i.test(lead.summary)) hooks.push('Sanierungsprojekte');
    if (/neubau/i.test(lead.summary)) hooks.push('Neubauprojekte');
  }

  if (websiteInfo) {
    if (/meisterbetrieb/i.test(websiteInfo)) hooks.push('Meisterbetrieb');
    if (/familienunternehmen|familienbetrieb/i.test(websiteInfo)) hooks.push('Familienbetrieb');
  }

  if (trade && trade !== 'Handwerk') hooks.push(trade);

  const prioritized = hooks.filter(h => /jahre|mitarbeiter|sanierung|meister|familie/i.test(h));
  if (prioritized.length > 0) return prioritized[hashString(lead.email || '') % prioritized.length];
  if (hooks.length > 0) return hooks[hashString(lead.email || '') % hooks.length];
  return '';
}

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9äöüÄÖÜß\-_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 80);
}

// Generate email with key messages:
// 1. Individuell gebaut
// 2. KEINE Lizenzgebühren
// 3. 30% mention 12+ years Baubranche experience
function generateEmail(lead: EnrichedLead, index: number): { subject: string; body: string } {
  const hash = hashString(lead.email);
  const usesDu = hash % 2 === 0;
  const usesIch = (hash >> 1) % 2 === 0;
  const subject = SUBJECT_LINES[hash % SUBJECT_LINES.length];

  // 30% get the "12 Jahre Baubranche" mention
  const includeBaubrancheExperience = (hash % 10) < 3; // roughly 30%

  const firstName = lead.firstName;
  const lastName = lead.lastName;

  // Greetings
  const greetingsDu = [`Hi ${firstName},`, `Moin ${firstName},`, `Hey ${firstName},`];
  const greetingsSie = [`Hallo Herr ${lastName},`, `Guten Tag Herr ${lastName},`];
  const greeting = usesDu ? greetingsDu[hash % greetingsDu.length] : greetingsSie[hash % greetingsSie.length];

  // Personalization opener
  let opener = '';
  if (lead.personalizationHook && !/^Handwerk$/i.test(lead.personalizationHook)) {
    const openersDu = [
      `Hab gesehen, dass ihr im Bereich ${lead.personalizationHook} unterwegs seid.`,
      `${lead.personalizationHook} - da könnte das hier gut passen.`,
      `Ihr macht ${lead.personalizationHook}, richtig?`,
    ];
    const openersSie = [
      `Ich habe gesehen, dass Sie im Bereich ${lead.personalizationHook} tätig sind.`,
      `${lead.personalizationHook} - da könnte das hier interessant sein.`,
    ];
    opener = usesDu ? openersDu[hash % openersDu.length] : openersSie[hash % openersSie.length];
  } else {
    const genericDu = [
      `Ich schreib dir kurz, weil ich denke das könnte für euch passen.`,
      `Kurze Nachricht, weil ich glaube das ist was für euch.`,
    ];
    const genericSie = [
      `Ich schreibe Ihnen kurz, weil ich denke das könnte interessant sein.`,
      `Kurze Nachricht, weil ich glaube das passt zu Ihnen.`,
    ];
    opener = usesDu ? genericDu[hash % genericDu.length] : genericSie[hash % genericSie.length];
  }

  // Background line (30% include Baubranche experience)
  let backgroundLine = '';
  if (includeBaubrancheExperience) {
    const bgDu = [
      `Kurz zu mir: ich komme selbst aus der Baubranche - über 12 Jahre Erfahrung, davon viel in der Kalkulation und Angebotsphase.`,
      `Ich hab selbst über 12 Jahre in der Baubranche gearbeitet und weiss wie viel Zeit in Angeboten steckt.`,
      `Hintergrund: ich war selbst über 12 Jahre in der Baubranche tätig und kenne die Probleme bei der Angebotserstellung aus erster Hand.`,
    ];
    const bgSie = [
      `Kurz zu mir: ich komme selbst aus der Baubranche - über 12 Jahre Erfahrung, davon viel in der Kalkulation und Angebotsphase.`,
      `Ich habe selbst über 12 Jahre in der Baubranche gearbeitet und weiss wie aufwändig Angebote sein können.`,
      `Hintergrund: ich war selbst über 12 Jahre in der Baubranche tätig und kenne die Herausforderungen bei der Angebotserstellung.`,
    ];
    backgroundLine = usesDu ? bgDu[hash % bgDu.length] : bgSie[hash % bgSie.length];
  }

  // Main pitch - what the tool does
  const pitchDu = [
    `Ich baue gerade ein Tool namens AngebotsAgent. Damit kannst du Mengen direkt aus Plänen und Ausschreibungen ziehen, Nachtragspotenziale früh erkennen und das Angebot am Ende als Excel oder PDF exportieren.`,
    `Wir haben AngebotsAgent gebaut - eine Software, die Mengenermittlung aus Bauplänen macht, bei der Kalkulation hilft und Nachträge früh sichtbar macht. Am Ende kommt ein fertiges Angebot raus.`,
    `Die Idee: ein Tool, mit dem du Mengen aus Plänen ziehst, kalkulierst und direkt ein Angebot erstellst. Nachtragspotenziale siehst du dabei auch gleich - bevor es zu spät ist.`,
  ];

  const pitchSie = [
    `Ich baue gerade ein Tool namens AngebotsAgent. Damit können Sie Mengen direkt aus Plänen und Ausschreibungen ziehen, Nachtragspotenziale früh erkennen und das Angebot als Excel oder PDF exportieren.`,
    `Wir haben AngebotsAgent gebaut - eine Software, die Mengenermittlung aus Bauplänen macht, bei der Kalkulation hilft und Nachträge früh sichtbar macht.`,
    `Die Idee: ein Tool, mit dem Sie Mengen aus Plänen ziehen, kalkulieren und direkt ein Angebot erstellen. Nachtragspotenziale sehen Sie dabei auch gleich.`,
  ];

  const pitch = usesDu ? pitchDu[hash % pitchDu.length] : pitchSie[hash % pitchSie.length];

  // KEY MESSAGE: Individuell gebaut + KEINE Lizenzgebühren
  const customBuildDu = [
    `Das Besondere: wir bauen das individuell für euren Betrieb - genau auf eure Abläufe und Gewerke zugeschnitten. Und es gibt keine Lizenzgebühren oder monatlichen Kosten.`,
    `Wichtig dabei: das ist keine Standard-Software von der Stange. Wir bauen das speziell für euch, angepasst an eure Prozesse. Keine Lizenzgebühren, keine versteckten Kosten.`,
    `Der Unterschied zu anderen Tools: wir entwickeln das individuell für euren Betrieb. Keine Abo-Fallen, keine Lizenzgebühren - ihr zahlt einmal für eure Lösung.`,
  ];

  const customBuildSie = [
    `Das Besondere: wir bauen das individuell für Ihren Betrieb - genau auf Ihre Abläufe und Gewerke zugeschnitten. Und es gibt keine Lizenzgebühren oder monatlichen Kosten.`,
    `Wichtig dabei: das ist keine Standard-Software von der Stange. Wir bauen das speziell für Sie, angepasst an Ihre Prozesse. Keine Lizenzgebühren, keine versteckten Kosten.`,
    `Der Unterschied zu anderen Tools: wir entwickeln das individuell für Ihren Betrieb. Keine Abo-Fallen, keine Lizenzgebühren - Sie zahlen einmal für Ihre Lösung.`,
  ];

  const customBuild = usesDu ? customBuildDu[hash % customBuildDu.length] : customBuildSie[hash % customBuildSie.length];

  // Value prop
  const valueDu = [
    `Ziel ist, dass du schneller Angebote rausschicken kannst und öfter den Zuschlag bekommst.`,
    `Heisst im Klartext: weniger Stress bei der Kalkulation, mehr gewonnene Aufträge.`,
    `Damit sparst du Zeit bei der Angebotserstellung und siehst direkt, wo noch Luft im Preis ist.`,
  ];

  const valueSie = [
    `Ziel ist, dass Sie schneller Angebote rausschicken können und öfter den Zuschlag bekommen.`,
    `Das bedeutet: weniger Aufwand bei der Kalkulation, mehr gewonnene Aufträge.`,
    `Damit sparen Sie Zeit bei der Angebotserstellung und sehen direkt, wo noch Spielraum ist.`,
  ];

  const value = usesDu ? valueDu[hash % valueDu.length] : valueSie[hash % valueSie.length];

  // Demo CTA
  const ctaDu = [
    `Schau dir gern mal die Demo an unter https://angebotsagent.de - wenn das grundsätzlich passt, können wir direkt besprechen was ihr braucht.`,
    `Hier kannst du es mal antesten: https://angebotsagent.de - sag Bescheid wenn Interesse besteht, dann schauen wir was für euch Sinn macht.`,
    `Probier es gern aus: https://angebotsagent.de - bei Interesse melden, dann klären wir wie wir das für euch umsetzen.`,
  ];

  const ctaSie = [
    `Schauen Sie sich gern die Demo an unter https://angebotsagent.de - wenn das grundsätzlich passt, können wir direkt besprechen was Sie brauchen.`,
    `Hier können Sie es antesten: https://angebotsagent.de - melden Sie sich bei Interesse, dann schauen wir was für Sie Sinn macht.`,
    `Testen Sie es gern: https://angebotsagent.de - bei Interesse melden, dann klären wir die individuelle Umsetzung.`,
  ];

  const cta = usesDu ? ctaDu[hash % ctaDu.length] : ctaSie[hash % ctaSie.length];

  // Closing
  const closings = ['Gruss Clarence', 'VG Clarence', 'Beste Grüsse Clarence'];
  const closing = closings[hash % closings.length];

  // Assemble email
  const lines = [greeting, ''];

  lines.push(opener);
  lines.push('');

  if (backgroundLine) {
    lines.push(backgroundLine);
    lines.push('');
  }

  lines.push(pitch);
  lines.push('');
  lines.push(customBuild);
  lines.push('');
  lines.push(value);
  lines.push('');
  lines.push(cta);
  lines.push('');
  lines.push(closing);

  return { subject, body: lines.join('\n') };
}

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
      if (header) lead[header] = String(cell.value || '').trim();
    });

    const email = lead.email || lead.valid_email_only;
    if (!email || !email.includes('@')) return;

    leads.push({
      domain_name: lead.domain_name,
      email,
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
      titleDescription: lead.titleDescription,
    });
  });

  return leads;
}

async function main() {
  const inputDir = path.join(__dirname, 'input');
  const emailsDir = path.join(__dirname, 'emails');
  const enrichedDir = path.join(__dirname, 'enriched');
  const logsDir = path.join(__dirname, 'logs');

  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.xlsx'));
  console.log(`Found ${files.length} input files`);

  const allLeads: RawLead[] = [];
  for (const file of files) {
    const leads = await parseXlsx(path.join(inputDir, file));
    console.log(`${file}: ${leads.length} leads`);
    allLeads.push(...leads);
  }

  console.log(`\nTotal: ${allLeads.length} leads with emails`);
  console.log('Processing...\n');

  const enrichedLeads: EnrichedLead[] = [];
  let processed = 0;
  let withBaubranche = 0;

  for (const raw of allLeads) {
    processed++;
    if (processed % 50 === 0) console.log(`Progress: ${processed}/${allLeads.length}`);

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
      personalizationHook,
    };

    enrichedLeads.push(enriched);

    const { subject, body } = generateEmail(enriched, processed);

    // Count baubranche mentions
    if (body.includes('12 Jahre')) withBaubranche++;

    const filename = sanitizeFilename(`${enriched.company}_${enriched.lastName}_${enriched.firstName}`) + '.txt';
    fs.writeFileSync(path.join(emailsDir, filename), `Betreff: ${subject}\n\nAn: ${enriched.email}\n\n---\n\n${body}`, 'utf8');

    await new Promise(r => setTimeout(r, 50));
  }

  // Write CSV
  const csvRows = ['firstName,lastName,company,email,trade,personalizationHook'];
  for (const l of enrichedLeads) {
    csvRows.push(`"${l.firstName}","${l.lastName}","${l.company}","${l.email}","${l.trade}","${l.personalizationHook}"`);
  }
  fs.writeFileSync(path.join(enrichedDir, 'leads_enriched.csv'), csvRows.join('\n'), 'utf8');

  // Log
  const tradeCount = enrichedLeads.reduce((a, l) => { a[l.trade] = (a[l.trade] || 0) + 1; return a; }, {} as Record<string, number>);
  fs.writeFileSync(path.join(logsDir, 'processing.log'), [
    `Completed: ${new Date().toISOString()}`,
    `Total: ${enrichedLeads.length}`,
    `With "12 Jahre Baubranche": ${withBaubranche} (${Math.round(withBaubranche/enrichedLeads.length*100)}%)`,
    '',
    'Trades:',
    ...Object.entries(tradeCount).sort((a, b) => b[1] - a[1]).map(([t, c]) => `  ${t}: ${c}`),
  ].join('\n'), 'utf8');

  console.log(`\nDone! ${enrichedLeads.length} emails generated.`);
  console.log(`With "12 Jahre Baubranche" mention: ${withBaubranche} (${Math.round(withBaubranche/enrichedLeads.length*100)}%)`);
}

main().catch(console.error);
