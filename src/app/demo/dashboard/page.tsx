'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

const TRANSLATIONS = {
  de: {
    projects: 'Projekte',
    newProject: 'Neues Projekt',
    priceLibrary: 'Preisbibliothek',
    examples: 'Beispiele',
  },
  en: {
    projects: 'Projects',
    newProject: 'New Project',
    priceLibrary: 'Price Library',
    examples: 'Examples',
  }
}

export default function DemoDashboard() {
  const [lang, setLang] = useState<Language>('de')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = TRANSLATIONS[lang]

  const sections = [
    { title: lang === 'de' ? 'Workflow: Kalkulation' : 'Workflow: Estimating', items: [
      { h: '/demo/inbox', l: lang === 'de' ? 'Belege & Pläne (OCR)' : 'Docs & Plans (OCR)', d: lang === 'de' ? 'Mengen extrahieren' : 'Extract quantities' },
      { h: '/demo/tenders', l: lang === 'de' ? 'Ausschreibungs-Pool' : 'Tender Pool', d: lang === 'de' ? 'Potenziale finden' : 'Find potentials' },
      { h: '/demo/schnellscan', l: lang === 'de' ? 'Maßblatt-Editor' : 'Takeoff Editor', d: lang === 'de' ? 'Aufmaß erstellen' : 'Create takeoff' },
      { h: '/beispiele', l: t.examples, d: lang === 'de' ? 'Individuelle Builds' : 'Custom builds' },
    ]},
    { title: lang === 'de' ? 'Workflow: Abschluss' : 'Workflow: Closing', items: [
      { h: '/demo/price-library', l: t.priceLibrary, d: lang === 'de' ? 'Preise pflegen' : 'Maintain prices' },
      { h: '/demo/dashboard', l: lang === 'de' ? 'Export Center' : 'Export Center', d: 'PDF & Excel' },
    ]},
    { title: lang === 'de' ? 'Wissen & Kontrolle' : 'Knowledge & Control', items: [
      { h: '/demo/knowledge', l: lang === 'de' ? 'VOB/B Archiv' : 'VOB/B Archive', d: lang === 'de' ? 'Regelwerke' : 'Rules' },
      { h: '/demo/analytics', l: lang === 'de' ? 'Margen-Analyse' : 'Margin Analytics', d: 'Controlling' },
      { h: '/demo/audit', l: lang === 'de' ? 'Aktivitäten' : 'Activities', d: 'Logbuch' },
    ]}
  ]

  const groups = [
    {
      title: 'Kalkulation',
      items: [
        { href: '/demo/dashboard', label: t.projects },
        { href: '/demo/tenders', label: lang === 'de' ? 'Ausschreibungen' : 'Tenders' },
        { href: '/demo/schnellscan', label: lang === 'de' ? 'Kalkulationen' : 'Calculations' },
        { href: '/beispiele', label: t.examples },
      ]
    },
    {
      title: 'Workflow',
      items: [
        { href: '/demo/inbox', label: lang === 'de' ? 'Posteingang' : 'Inbox' },
        { href: '/demo/price-library', label: t.priceLibrary },
        { href: '/demo/materials', label: lang === 'de' ? 'Materialien' : 'Materials' },
        { href: '/demo/billing', label: lang === 'de' ? 'Abrechnung' : 'Billing' },
      ]
    },
    {
      title: 'Controlling',
      items: [
        { href: '/demo/analytics', label: lang === 'de' ? 'Erfolgs-Dashboard' : 'Performance Analytics' },
        { href: '/demo/reporting', label: lang === 'de' ? 'Reporting' : 'Reporting' },
        { href: '/demo/audit', label: lang === 'de' ? 'Audit-Log' : 'Audit Log' },
        { href: '/demo/settings', label: lang === 'de' ? 'Einstellungen' : 'Settings' },
      ]
    },
    {
      title: 'Wissen & Recht',
      items: [
        { href: '/demo/knowledge', label: lang === 'de' ? 'Wissen' : 'Knowledge' },
        { href: '/demo/support', label: lang === 'de' ? 'Technischer Support' : 'Technical Support' },
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 brand-font">
            Angebots<span className="text-blue-700 italic">Agent</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span>Menu</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setLang('de')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'de' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              DE
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/demo/support" className="p-2 text-slate-400 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </Link>
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">JD</div>
          </div>
        </div>
      </header>

      {/* Mega Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-20 p-12 overflow-y-auto">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            {groups.map((group, i) => (
              <div key={i}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-6 border-b border-blue-50 pb-2">{group.title}</h3>
                <nav className="flex flex-col space-y-4">
                  {group.items.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-left text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors italic"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <div className="p-12 max-w-7xl mx-auto space-y-16">
          <div className="flex justify-between items-center border-b border-slate-200 pb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2 brand-font italic uppercase tracking-tight underline decoration-blue-600 decoration-4 underline-offset-8">
                {lang === 'de' ? 'Arbeitsbereich' : 'Workspace'}
              </h1>
              <p className="text-slate-500 font-medium italic">
                {lang === 'de' ? 'Guten Tag. Bereit für die nächste Kalkulation?' : 'Good day. Ready for the next estimation?'}
              </p>
            </div>
            <button className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-colors">
              + {t.newProject}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 border-b border-slate-100 pb-4 italic">
                  {section.title}
                </h3>
                <div className="flex flex-col space-y-6">
                  {section.items.map(item => (
                    <Link
                      key={item.h}
                      href={item.h}
                      className="group block text-left"
                    >
                      <p className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors brand-font italic leading-none mb-2 underline decoration-transparent group-hover:decoration-blue-200">{item.l}</p>
                      <p className="text-[10px] font-bold text-slate-400 opacity-60 uppercase tracking-widest">{item.d}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row justify-between items-center shadow-2xl overflow-hidden relative border-t-4 border-blue-600">
             <div className="relative z-10 space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-bold italic brand-font">Wohnanlage Sonnenhang</h2>
                <div className="flex justify-center md:justify-start space-x-8 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                   <span>✓ {lang === 'de' ? '14 Nachträge' : '14 Potential Claims'}</span>
                   <span>✓ {lang === 'de' ? 'Aufmaß fertig' : 'Takeoff ready'}</span>
                </div>
             </div>
             <Link
              href="/demo/project/1"
              className="relative z-10 mt-8 md:mt-0 bg-white text-slate-900 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
             >
               {lang === 'de' ? 'Projekt öffnen →' : 'Open project →'}
             </Link>
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12 italic">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="text-left">
              <p className="text-2xl font-black text-slate-900 brand-font mb-1">
                Angebots<span className="text-blue-700">Agent</span>
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Individuelle Bau-KI-Lösungen.
              </p>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="opacity-40 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
               © 2025 AngebotsAgent.
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
               <Link href="/beispiele" className="hover:text-slate-900 transition-colors">{t.examples}</Link>
               <Link href="/impressum" className="hover:text-slate-900 transition-colors">Impressum</Link>
               <Link href="/datenschutz" className="hover:text-slate-900 transition-colors">Datenschutz</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
