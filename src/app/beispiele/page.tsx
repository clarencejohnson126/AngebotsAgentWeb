'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/landing/language-switcher'

type Language = 'de' | 'en'

interface ExampleCase {
  id: string
  trade: string
  company: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  bgClass: string
  description: string
  specificFeatures: string[]
  wording: {
    hero: string
    takeoff: string
    risk: string
    pricing: string
  }
}

const EXAMPLES: ExampleCase[] = [
  {
    id: 'drywall',
    trade: 'Trockenbau',
    company: 'WandWerk GmbH',
    primaryColor: '#2563eb',
    secondaryColor: '#f1f5f9',
    accentColor: '#1e40af',
    textColor: '#0f172a',
    bgClass: 'bg-white',
    description: 'Fokus auf Brandschutz-Logik und Wandhöhen-Extraktion.',
    specificFeatures: [
      'Brandschutz-Zulassungs-Check',
      'Wandhöhen-Scanner',
      'GAEB-Struktur-Mapper'
    ],
    wording: {
      hero: 'Trockenbau-Kalkulation mit System.',
      takeoff: 'Mengen-Scanner für Profile & Platten.',
      risk: 'Brandschutz-Risiko-Radar.',
      pricing: 'LV-Marge pro m².'
    }
  },
  {
    id: 'flooring',
    trade: 'Estrich & Boden',
    company: 'Fläche & Form AG',
    primaryColor: '#d97706',
    secondaryColor: '#fffbeb',
    accentColor: '#92400e',
    textColor: '#451a03',
    bgClass: 'bg-amber-50',
    description: 'Spezialisiert auf Trocknungszeiten-Management und Schichtdicken.',
    specificFeatures: [
      'Trocknungszeit-Simulator',
      'Schichtdicken-Aufmaß',
      'CM-Messungsprotokollierung'
    ],
    wording: {
      hero: 'Der digitale Estrich-Meister.',
      takeoff: 'Schichtdicken- & Flächen-Aufmaß.',
      risk: 'Feuchtigkeits-Falle erkennen.',
      pricing: 'Kubatur-Scharfe Kalkulation.'
    }
  },
  {
    id: 'electrical',
    trade: 'Elektrotechnik',
    company: 'VoltSystems GmbH',
    primaryColor: '#0ea5e9',
    secondaryColor: '#0f172a',
    accentColor: '#38bdf8',
    textColor: '#f8fafc',
    bgClass: 'bg-slate-900',
    description: 'Individueller Agent für Trassen-Takeoff und Kupferpreis-Anpassung.',
    specificFeatures: [
      'Kupferpreis-Index-Sync',
      'Leitungstrassen-Extraktion',
      'Stücklisten-Autopilot'
    ],
    wording: {
      hero: 'Elektro-Angebote unter Strom.',
      takeoff: 'Trassen- & Punkt-Scanner.',
      risk: 'Materialpreis-Sicherung.',
      pricing: 'Kupfer-Marge in Echtzeit.'
    }
  },
  {
    id: 'landscaping',
    trade: 'GalaBau',
    company: 'GrünRaum Projekte',
    primaryColor: '#15803d',
    secondaryColor: '#f0fdf4',
    accentColor: '#166534',
    textColor: '#14532d',
    bgClass: 'bg-emerald-50',
    description: 'Berechnung von Erdmassen und Pflanzen-Stücklisten aus Plan-Vektoren.',
    specificFeatures: [
      'Erdmassen-Bilanzierung',
      'Pflanzlisten-Generator',
      'Stein-Verschnitt-Rechner'
    ],
    wording: {
      hero: 'Natur kalkulierbar machen.',
      takeoff: 'Kubatur- & Stücklisten-Rechner.',
      risk: 'Baugrund-Widersprüche finden.',
      pricing: 'Saisonale Preis-Anpassung.'
    }
  },
  {
    id: 'facade',
    trade: 'Fassadenbau & Gerüst',
    company: 'Skyline Fassadenbau',
    primaryColor: '#dc2626',
    secondaryColor: '#fef2f2',
    accentColor: '#991b1b',
    textColor: '#450a0a',
    bgClass: 'bg-white',
    description: 'Optimiert für Gerüststellung und komplexe Oberflächen-Geometrien.',
    specificFeatures: [
      'Gerüst-Konfigurator (VOB)',
      'Abwicklungs-Scanner',
      'Dämmwert-Compliance-Check'
    ],
    wording: {
      hero: 'Die Fassade als Asset.',
      takeoff: 'Abwicklungs- & Flächen-Optimierer.',
      risk: 'Gerüst-Lücken identifizieren.',
      pricing: 'System-Marge für Hülle & Kern.'
    }
  }
]

const TRANSLATIONS = {
  de: {
    title: 'Portfolio der Agenten.',
    subtitle: 'Wir bauen keine Standard-Software. Wir erschaffen proprietäre Vermögenswerte für Ihren Betrieb. Sehen Sie, wie der AngebotsAgent pro Gewerk angepasst wird.',
    badge: 'Individuelle Builds',
    examples: 'Beispiele',
    customSystem: 'Individuelles System',
    costModel: 'Cost Model',
    payPerApi: 'Pay-per-API',
    wordingTitle: 'Fachspezifische Wording-Anpassung',
    heroMessaging: 'Hero Messaging',
    takeoffModule: 'Aufmaß-Modul',
    riskRadar: 'Risiko-Radar',
    marginPrice: 'Marge & Preis',
    featuresTitle: 'Proprietäre Features',
    hostingNote: 'Dieses System wird auf der firmeneigenen Domain gehostet.',
    ownership: '100% Ownership.',
    ctaButton: 'System-Check für Ihr Gewerk',
    closerTitle: 'Keine Standard-SaaS.',
    closerHighlight: 'Ihre Unternehmens-Werte.',
    closerText: 'Jeder dieser Agenten ist ein Unikat. Entwickelt für die spezifischen Probleme des jeweiligen Gewerks. Wir bauen keine Tools, wir bauen digitale Assets.',
    runtime: 'Laufzeit',
    users: 'Nutzer',
    codeOwnership: 'Code-Ownership',
    unlimited: 'Unbegrenzt',
    footer: '© 2025 AngebotsAgent. Ihr Eigentum. Ihre Marge. Ihre Zukunft.',
    tagline: 'Individuelle Bau-KI-Lösungen.',
    rebelzText: 'Eine Dienstleistung von Rebelz AI',
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
    vobSupport: 'VOB Support',
  },
  en: {
    title: 'Portfolio of Agents.',
    subtitle: 'We don\'t build standard software. We create proprietary assets for your business. See how BidAgent is customized per trade.',
    badge: 'Individual Builds',
    examples: 'Examples',
    customSystem: 'Custom System',
    costModel: 'Cost Model',
    payPerApi: 'Pay-per-API',
    wordingTitle: 'Trade-Specific Wording Adaptation',
    heroMessaging: 'Hero Messaging',
    takeoffModule: 'Takeoff Module',
    riskRadar: 'Risk Radar',
    marginPrice: 'Margin & Price',
    featuresTitle: 'Proprietary Features',
    hostingNote: 'This system is hosted on the company\'s own domain.',
    ownership: '100% Ownership.',
    ctaButton: 'System Check for Your Trade',
    closerTitle: 'No Standard SaaS.',
    closerHighlight: 'Your Business Assets.',
    closerText: 'Each of these agents is unique. Developed for the specific problems of each trade. We don\'t build tools, we build digital assets.',
    runtime: 'Runtime',
    users: 'Users',
    codeOwnership: 'Code Ownership',
    unlimited: 'Unlimited',
    footer: '© 2025 AngebotsAgent. Your Property. Your Margin. Your Future.',
    tagline: 'Individual Construction AI Solutions.',
    rebelzText: 'A service by Rebelz AI',
    impressum: 'Legal Notice',
    datenschutz: 'Privacy Policy',
    vobSupport: 'VOB Support',
  }
}

export default function BeispielePage() {
  const [lang, setLang] = useState<Language>('de')
  const [selected, setSelected] = useState<ExampleCase | null>(null)
  const t = TRANSLATIONS[lang]

  const rebelzLogo = "https://eoahpwciwttfavzpqfnz.supabase.co/storage/v1/object/sign/unrelated/ChatGPT%20Image%20Dec%2029,%202025,%2002_08_06%20AM.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85YmJlMzI3NC0xODJjLTRmZGUtODk2NC1hMTcxNzVmY2I1NGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1bnJlbGF0ZWQvQ2hhdEdQVCBJbWFnZSBEZWMgMjksIDIwMjUsIDAyXzA4XzA2IEFNLnBuZyIsImlhdCI6MTc2Nzk1NDE1MSwiZXhwIjoxOTU3MTcwMTUxfQ.ZY_xLspOoFMMjMG5ZG22Gwr-CebXCgo_18urp_hA8co"

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 brand-font">
            Angebots<span className="text-blue-700 italic">Agent</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher current={lang} onChange={setLang} />
          <Link
            href="/beispiele"
            className="text-xs font-black uppercase tracking-widest text-blue-600"
          >
            {t.examples}
          </Link>
          <Link
            href="/login"
            className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-16 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-20 space-y-6">
            <span className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px]">{t.badge}</span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter brand-font">{t.title}</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto italic font-medium leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelected(ex)}
                className="flex flex-col text-left group transition-all"
              >
                <div className={`w-full aspect-[3/4] rounded-[2.5rem] p-8 ${ex.bgClass} border border-slate-200 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-4 transition-all duration-500 overflow-hidden relative`}>
                  <div className="absolute top-0 right-0 p-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ex.primaryColor }}></div>
                  </div>
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-40">{ex.trade}</p>
                      <h3 className="text-xl font-bold tracking-tighter leading-tight italic" style={{ color: ex.textColor }}>
                        {ex.company}
                      </h3>
                    </div>
                    <div className="space-y-4">
                       <div className="h-1 w-12 rounded-full" style={{ backgroundColor: ex.primaryColor }}></div>
                       <p className="text-xs font-bold opacity-60 italic leading-snug">
                         {ex.description}
                       </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Modal-style Detail View */}
          {selected && (
            <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setSelected(null)}>
              <div
                className="max-w-5xl w-full bg-white rounded-[4rem] shadow-3xl overflow-hidden animate-fade-in relative flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sidebar: The Brand */}
                <div className="md:w-1/3 p-12 text-white flex flex-col justify-between" style={{ backgroundColor: selected.primaryColor }}>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{t.customSystem}</span>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-none mt-4">{selected.company}</h2>
                    <p className="mt-6 text-sm font-medium opacity-80 italic">{selected.description}</p>
                  </div>
                  <div className="space-y-4">
                     <div className="p-4 bg-black/10 rounded-2xl border border-white/10 italic">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{t.costModel}</p>
                        <p className="text-lg font-bold">{t.payPerApi}</p>
                     </div>
                  </div>
                </div>

                {/* Content: The Engine */}
                <div className="md:w-2/3 p-12 space-y-12">
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div>
                     <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic">{t.wordingTitle}</h3>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-300 mb-1">{t.heroMessaging}</p>
                           <p className="text-lg font-bold italic text-slate-900">&quot;{selected.wording.hero}&quot;</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-300 mb-1">{t.takeoffModule}</p>
                           <p className="text-lg font-bold italic text-slate-900">&quot;{selected.wording.takeoff}&quot;</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-300 mb-1">{t.riskRadar}</p>
                           <p className="text-lg font-bold italic text-slate-900">&quot;{selected.wording.risk}&quot;</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-300 mb-1">{t.marginPrice}</p>
                           <p className="text-lg font-bold italic text-slate-900">&quot;{selected.wording.pricing}&quot;</p>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic">{t.featuresTitle}</h3>
                     <div className="flex flex-wrap gap-3">
                        {selected.specificFeatures.map((f, i) => (
                          <span key={i} className="px-6 py-2 bg-slate-100 rounded-full text-xs font-black italic text-slate-600 border border-slate-200">
                            {f}
                          </span>
                        ))}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                     <div className="text-slate-400 text-xs italic font-medium">
                        {t.hostingNote}<br/>
                        <span className="font-bold text-slate-900">{t.ownership}</span>
                     </div>
                     <button
                       style={{ backgroundColor: selected.primaryColor }}
                       className="text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl"
                     >
                       {t.ctaButton}
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Speed & Ownership Reiteration */}
        <section className="mt-32 max-w-5xl mx-auto bg-slate-900 text-white rounded-[4rem] p-16 relative overflow-hidden">
           <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none brand-font">{t.closerTitle}<br/><span className="text-blue-500">{t.closerHighlight}</span></h2>
              <p className="text-xl text-slate-400 italic max-w-2xl leading-relaxed">
                 {t.closerText}
              </p>
              <div className="flex space-x-12 pt-8">
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t.runtime}</p>
                    <p className="text-lg font-bold">{t.unlimited}</p>
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t.users}</p>
                    <p className="text-lg font-bold">{t.unlimited}</p>
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t.codeOwnership}</p>
                    <p className="text-lg font-bold">100%</p>
                 </div>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12 italic">
          {/* Main Footer Brand and Links */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="text-left">
              <p className="text-2xl font-black text-slate-900 brand-font mb-1">
                Angebots<span className="text-blue-700">Agent</span>
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t.tagline}
              </p>
            </div>
            {/* Rebelz AI Attribution */}
            <a
              href="https://rebelzai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-end group transition-all"
            >
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-slate-900 transition-colors mb-2">
                 {t.rebelzText}
               </span>
               <img
                 src={rebelzLogo}
                 alt="Rebelz AI Logo"
                 className="h-8 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
               />
            </a>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="opacity-40 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
               {t.footer}
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
               <Link href="/beispiele" className="hover:text-slate-900 transition-colors">{t.examples}</Link>
               <button type="button" className="hover:text-slate-900 transition-colors">{t.impressum}</button>
               <button type="button" className="hover:text-slate-900 transition-colors">{t.datenschutz}</button>
               <button type="button" className="hover:text-slate-900 transition-colors">{t.vobSupport}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
