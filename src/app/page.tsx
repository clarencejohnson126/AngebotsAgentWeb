'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

const TRANSLATIONS = {
  de: {
    heroMicro: 'Explizit für Nachunternehmer im Bau',
    heroSubtitle: 'Wir entwickeln Ihren eigenen AngebotsAgent als Dashboard-Funktion, der Mengen aus Plänen zieht, Nachtragspotentiale erkennt und VOB-konforme Angebote in Ihrem Branding erstellt. Keine monatlichen hohen Lizensgebühren, das Ding gehört Ihnen!',
    ctaDemo: 'Begehung',
    ctaLogin: 'Login',
    examples: 'Beispiele',
  },
  en: {
    heroMicro: 'Explicitly for Construction Subcontractors',
    heroSubtitle: 'We develop your own BidAgent as a dashboard function that extracts quantities from plans, identifies claim potentials and creates VOB-compliant offers in your branding. No high monthly license fees, the thing belongs to you!',
    ctaDemo: 'Site Visit',
    ctaLogin: 'Login',
    examples: 'Examples',
  }
}

// Mascot image paths (from public folder)
const mascotHero = '/mascots/Maskot for hero page.png'
const mascotPage3 = '/mascots/Page 3.png'
const mascotPage5 = '/mascots/Page 5.png'
const mascotPage7 = '/mascots/Page 7.png'

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('de')
  const t = TRANSLATIONS[lang]

  const getHeroTitleParts = () => {
    if (lang === 'de') {
      return [
        <>Angebote <span className="text-blue-600">schneller</span></>,
        <>erstellen. Aufträge</>,
        <><span className="text-blue-600">besser</span> gewinnen.</>
      ]
    }
    return [
      <>Create offers <span className="text-blue-600">fast</span></>,
      <>Win contracts</>,
      <><span className="text-blue-600">reliably</span> and safe</>
    ]
  }

  const titleParts = getHeroTitleParts()

  return (
    <div className="flex flex-col overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 brand-font">
            Angebots<span className="text-blue-700 italic">Agent</span>
          </Link>
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
          <Link
            href="/beispiele"
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
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

      {/* 1. HERO: ARCHITECTURAL PRECISION */}
      <section className="min-h-[100vh] md:min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 py-12 md:py-0 text-center relative bg-[#fcfcfc] border-b border-slate-100">
        <div className="max-w-7xl mx-auto z-10 flex flex-col lg:flex-row items-center w-full">
          <div className="flex-1 flex flex-col items-center lg:items-start lg:text-left">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] text-[10px] sm:text-[11px] mb-6 md:mb-10 block animate-fade-in">
              {t.heroMicro}
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-[5.5rem] font-black text-slate-900 mb-8 md:mb-12 tracking-tight leading-[1.05] brand-font uppercase w-full">
              <span className="block sm:whitespace-nowrap">{titleParts[0]}</span>
              <span className="block sm:whitespace-nowrap">{titleParts[1]}</span>
              <span className="block sm:whitespace-nowrap">{titleParts[2]}</span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-500 mb-16 max-w-3xl leading-relaxed font-medium italic px-4 lg:px-0 opacity-70">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/demo/dashboard"
                className="bg-blue-600 text-white px-8 py-4 sm:px-12 sm:py-6 rounded-full font-black text-base sm:text-xl hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all transform hover:-translate-y-1 w-full sm:w-auto text-center"
              >
                {t.ctaDemo}
              </Link>
              <Link
                href="/projekte"
                className="text-slate-900 px-8 py-4 sm:px-12 sm:py-6 rounded-full font-black text-base sm:text-xl hover:bg-slate-50 border-4 border-slate-900 transition-all w-full sm:w-auto inline-block text-center"
              >
                {t.ctaLogin}
              </Link>
            </div>
          </div>

          {/* Mascot - Right Side */}
          <div className="flex-shrink-0 mt-8 lg:mt-0 lg:ml-8">
            <img
              src={mascotHero}
              alt="AngebotsAgent Mascot"
              className="w-40 sm:w-48 md:w-56 lg:w-64 xl:w-80 h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="absolute bottom-10 animate-bounce text-slate-200">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* 2. OVERVIEW: THE 4 PILLARS */}
      <section className="py-16 md:py-32 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-24 space-y-4 md:space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight brand-font uppercase">
              {lang === 'de' ? 'Die 4 Kern-Vorteile.' : 'The 4 Core Pillars.'}
            </h2>
            <p className="text-slate-400 text-base md:text-xl font-medium italic max-w-2xl mx-auto px-4">
              {lang === 'de' ? 'Ein durchgängiger, digitaler Workflow vom ersten Plan bis zum fertigen Export.' : 'A seamless digital workflow from the first plan to the final export.'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { n: '01', t: lang === 'de' ? 'Massenermittlung' : 'Quantity Takeoff', d: lang === 'de' ? 'KI-Extraktion aus Plänen & GAEB.' : 'AI extraction from plans & GAEB.' },
              { n: '02', t: lang === 'de' ? 'Nachtrags-Radar' : 'Risk Detection', d: lang === 'de' ? 'Risiken finden vor Abgabe.' : 'Find risks before submission.' },
              { n: '03', t: lang === 'de' ? 'Preis-Strategie' : 'Price Strategy', d: lang === 'de' ? 'Marge sichern, Gebote gewinnen.' : 'Secure margin, win bids.' },
              { n: '04', t: lang === 'de' ? 'Profi-Export' : 'Pro Export', d: lang === 'de' ? 'PDF & Excel in Sekunden.' : 'PDF & Excel in seconds.' }
            ].map((p, i) => (
              <div key={i} className="border border-white/10 p-6 md:p-10 rounded-2xl md:rounded-[2rem] bg-white/5 hover:bg-blue-600 transition-all group cursor-pointer" onClick={() => {
                const element = document.getElementById(`feature-${i+1}`)
                element?.scrollIntoView({ behavior: 'smooth' })
              }}>
                <p className="text-4xl font-black mb-6 opacity-20 group-hover:opacity-100 italic">{p.n}</p>
                <h3 className="text-xl font-bold mb-4 brand-font uppercase">{p.t}</h3>
                <p className="text-sm text-slate-400 group-hover:text-white/90 leading-relaxed italic">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURE 1: QUANTITY EXTRACTION (Excel Excerpt) */}
      <section id="feature-1" className="py-16 md:py-40 bg-white px-4 sm:px-6 border-b border-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-24">
          <div className="lg:w-1/2 space-y-6 md:space-y-10">
            <div className="space-y-4">
              <span className="text-blue-600 font-black uppercase tracking-widest text-xs">Modul 01</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black brand-font uppercase leading-tight text-slate-900">
                {lang === 'de' ? 'Massenermittlung & Aufmaß' : 'Quantity Extraction & Takeoff'}
              </h2>
            </div>
            <p className="text-base md:text-xl text-slate-500 font-medium italic leading-relaxed">
              {lang === 'de'
                ? "AngebotsAgent extrahiert und strukturiert Massen direkt aus Ausschreibungsunterlagen und Bauplänen. Er liest Flächen aus Raumtabellen und Plananmerkungen und unterstützt das nutzergestützte Aufmaß dort, wo Mengen fehlen."
                : "AngebotsAgent extracts and structures quantities directly from tender documents and construction plans."
              }
            </p>
            <div className="bg-blue-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-blue-100 font-bold italic text-blue-900 leading-relaxed text-sm md:text-base">
              {lang === 'de'
                ? "Mengen sind prüfbar und direkt mit der Quelle im Plan verlinkt."
                : "Quantities are auditable and linked directly to the plan source."
              }
            </div>
          </div>
          <div className="lg:w-1/2 w-full relative">
             <div className="bg-[#f8f9fa] rounded-2xl md:rounded-[2.5rem] p-1 shadow-xl md:shadow-3xl border border-slate-200 overflow-hidden">
                <div className="bg-white p-4 md:p-6 border-b border-slate-200 flex items-center justify-between">
                   <div className="flex space-x-2">
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-slate-200"></div>
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-slate-200"></div>
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-slate-200"></div>
                   </div>
                   <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Massen_Extraktion.xlsx</span>
                </div>
                <div className="p-2 md:p-4 overflow-x-auto">
                   <table className="w-full text-left text-[10px] md:text-[11px] border-collapse min-w-[300px]">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                         <tr>
                            <th className="p-2 md:p-3 border border-slate-200">Position</th>
                            <th className="p-2 md:p-3 border border-slate-200">Bauteil</th>
                            <th className="p-2 md:p-3 border border-slate-200">Menge</th>
                            <th className="p-2 md:p-3 border border-slate-200">Quelle</th>
                         </tr>
                      </thead>
                      <tbody className="italic font-medium text-slate-700">
                         <tr>
                            <td className="p-2 md:p-3 border border-slate-200">1.1.20</td>
                            <td className="p-2 md:p-3 border border-slate-200">GK-Wand F90</td>
                            <td className="p-2 md:p-3 border border-slate-200 bg-blue-50 font-black">452,50 m²</td>
                            <td className="p-2 md:p-3 border border-slate-200 text-blue-600">Plan_OG1.pdf</td>
                         </tr>
                         <tr>
                            <td className="p-2 md:p-3 border border-slate-200">1.1.25</td>
                            <td className="p-2 md:p-3 border border-slate-200">Vorsatzschale</td>
                            <td className="p-2 md:p-3 border border-slate-200 bg-blue-50 font-black">112,00 m²</td>
                            <td className="p-2 md:p-3 border border-slate-200 text-blue-600">Plan_EG.pdf</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
             {/* Aufmaß testen Link */}
             <Link
               href="/demo/schnellscan"
               className="mt-4 md:mt-6 inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm md:text-base group"
             >
               <span>{lang === 'de' ? 'Aufmaß testen' : 'Try Takeoff'}</span>
               <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
               </svg>
             </Link>
             {/* Mascot - Right Side - Hidden on mobile/tablet */}
             <img
               src={mascotPage3}
               alt="AngebotsAgent Mascot - Quantity Extraction"
               className="hidden xl:block absolute -right-16 2xl:-right-32 top-1/2 -translate-y-1/2 w-40 2xl:w-52 h-auto object-contain drop-shadow-xl z-10"
             />
          </div>
        </div>
      </section>

      {/* 4. FEATURE 2: RISK RADAR (Comparison Excerpt) */}
      <section id="feature-2" className="py-16 md:py-40 bg-slate-50 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-12 md:gap-24">
          <div className="lg:w-1/2 space-y-6 md:space-y-10">
            <div className="space-y-4">
              <span className="text-red-600 font-black uppercase tracking-widest text-xs">Modul 02</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black brand-font uppercase leading-tight text-slate-900">
                {lang === 'de' ? 'Nachtrags-Radar' : 'Change Order Radar'}
              </h2>
            </div>
            <p className="text-base md:text-xl text-slate-500 font-medium italic leading-relaxed">
              {lang === 'de'
                ? "AngebotsAgent vergleicht LV-Texte mit den Plänen, um Inkonsistenzen und fehlende Leistungen zu identifizieren. Sie erkennen Risiken, bevor diese zum Problem werden."
                : "AngebotsAgent compares tender texts with plans to identify inconsistencies and missing services."
              }
            </p>
            <div className="bg-red-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-red-100 font-bold italic text-red-900 leading-relaxed text-sm md:text-base">
              {lang === 'de'
                ? "Vermeiden Sie Kalkulationsfehler und sichern Sie sich wertvolle Argumente für spätere Nachträge."
                : "Avoid calculation errors and secure valuable arguments for later change orders."
              }
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
             <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-xl md:shadow-3xl border-l-[8px] md:border-l-[12px] border-red-500">
                <div className="space-y-4 md:space-y-6">
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 md:mb-4">
                      <h4 className="text-red-600 font-black uppercase tracking-widest text-[10px] md:text-[11px]">⚠ Widerspruch erkannt</h4>
                      <span className="text-slate-300 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">Analysebericht #402</span>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-2">
                         <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400">Ausschreibungstext</p>
                         <p className="text-xs font-bold text-slate-900 leading-relaxed italic">&quot;Standard-Beplankung für Innenwände vorgesehen.&quot;</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] md:text-[10px] font-black uppercase text-red-500">Planvorgabe (Detailschnitt)</p>
                         <p className="text-xs font-bold text-red-600 leading-relaxed italic">&quot;Brandschutzanforderung F90 zwingend erforderlich.&quot;</p>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 italic text-[10px] md:text-[11px] text-slate-600 font-bold">
                      HINWEIS: Mehrkosten für Material und Lohn ca. +15%. <br/>Strategische Empfehlung: Klärung per Bieterfrage oder im Nachtrags-Logbuch vormerken.
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURE 3: PRICING (Logic Card) */}
      <section id="feature-3" className="py-16 md:py-40 bg-white px-4 sm:px-6 border-b border-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-24">
          <div className="lg:w-1/2 space-y-6 md:space-y-10">
            <div className="space-y-4">
              <span className="text-green-600 font-black uppercase tracking-widest text-xs">Modul 03</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black brand-font uppercase leading-tight text-slate-900">
                {lang === 'de' ? 'Kalkulation & Marge' : 'Pricing & Margin Control'}
              </h2>
            </div>
            <p className="text-base md:text-xl text-slate-500 font-medium italic leading-relaxed">
              {lang === 'de'
                ? "Nutzen Sie Ihre eigene Preisbibliothek und hinterlegen Sie Aufschlagsregeln. Der Agent berechnet Zielpreise unter Berücksichtigung von Risikopuffern."
                : "Use your own price library and store markup rules. The agent calculates target prices considering risk buffers."
              }
            </p>
            <div className="bg-green-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-green-100 font-bold italic text-green-900 leading-relaxed text-sm md:text-base">
              {lang === 'de'
                ? "Volle Kontrolle über Deckungsbeitrag und Wagnis-Gewinn."
                : "Full control over contribution margin and profit-risk."
              }
            </div>
          </div>
          <div className="lg:w-1/2 w-full relative">
             <div className="bg-slate-900 p-6 sm:p-8 md:p-12 rounded-2xl md:rounded-[4rem] text-white space-y-4 md:space-y-8 shadow-xl md:shadow-4xl relative">
                <div className="absolute top-4 md:top-8 right-6 md:right-12 opacity-10">
                  <svg className="w-16 md:w-24 h-16 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div className="space-y-4 md:space-y-6 italic">
                   <div className="flex justify-between items-center border-b border-white/10 pb-3 md:pb-4">
                      <span className="text-[10px] md:text-[11px] font-black uppercase text-slate-500">Selbstkosten (EK)</span>
                      <span className="text-base md:text-xl font-bold">€ 112.450,00</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/10 pb-3 md:pb-4">
                      <span className="text-[10px] md:text-[11px] font-black uppercase text-green-500">Marge (15%)</span>
                      <span className="text-base md:text-xl font-bold text-green-400">+ € 16.867,50</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/10 pb-3 md:pb-4">
                      <span className="text-[10px] md:text-[11px] font-black uppercase text-blue-500">Wagnis/Risiko</span>
                      <span className="text-base md:text-xl font-bold text-blue-400">+ € 5.400,00</span>
                   </div>
                   <div className="pt-2 md:pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-[11px] md:text-[13px] font-black uppercase tracking-widest text-slate-300">Angebotssumme Netto</span>
                      <span className="text-2xl md:text-4xl font-black text-white">€ 134.717,50</span>
                   </div>
                </div>
             </div>
             {/* Mascot - Right Side - Hidden on mobile/tablet */}
             <img
               src={mascotPage7}
               alt="AngebotsAgent Mascot - Pricing"
               className="hidden xl:block absolute -right-16 2xl:-right-32 top-1/2 -translate-y-1/2 w-40 2xl:w-52 h-auto object-contain drop-shadow-xl z-10"
             />
          </div>
        </div>
      </section>

      {/* 6. FEATURE 4: EXPORT (Word Style Preview) */}
      <section id="feature-4" className="py-16 md:py-40 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-12 md:gap-24">
          <div className="lg:w-1/2 space-y-6 md:space-y-10">
            <div className="space-y-4">
              <span className="text-white opacity-40 font-black uppercase tracking-widest text-xs">Modul 04</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black brand-font uppercase leading-tight">
                {lang === 'de' ? 'Profi-Export' : 'Professional Export'}
              </h2>
            </div>
            <p className="text-base md:text-xl text-slate-300 font-medium italic leading-relaxed">
              {lang === 'de'
                ? "Generieren Sie versandfertige Angebote als PDF oder Excel. Inklusive formalem Anschreiben und strukturierter Positionsübersicht in Ihrem Firmendesign."
                : "Generate ready-to-send offers as PDF or Excel including a formal letter."
              }
            </p>
            <div className="bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 font-bold italic text-white/80 leading-relaxed text-sm md:text-base">
              {lang === 'de'
                ? "Ein Klick für den Export – Stunden gespart bei der Formatierung."
                : "One click to export – hours saved in formatting."
              }
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
             <div className="bg-white text-slate-900 p-6 sm:p-10 md:p-14 rounded-2xl md:rounded-[3rem] shadow-xl md:shadow-4xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-slate-50 border-l border-b border-slate-100 flex items-center justify-center font-black text-[8px] md:text-[10px] text-slate-300 uppercase rotate-45 -mr-12 md:-mr-16 -mt-12 md:-mt-16">
                   {lang === 'de' ? 'ENTWURF' : 'DRAFT'}
                </div>
                <div className="space-y-4 md:space-y-8 italic">
                   <div className="flex justify-between items-start border-b border-slate-100 pb-4 md:pb-8">
                      <div className="space-y-1">
                         <div className="h-2 md:h-3 w-24 md:w-32 bg-slate-100 rounded"></div>
                         <div className="h-2 md:h-3 w-32 md:w-48 bg-slate-100 rounded"></div>
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg"></div>
                   </div>
                   <div className="space-y-3 md:space-y-4">
                      <h3 className="text-lg md:text-2xl font-black brand-font uppercase tracking-tight">Angebot: Neubau BV Sonnenhang</h3>
                      <p className="text-[10px] md:text-xs text-slate-500 font-bold leading-relaxed">
                         Sehr geehrte Damen und Herren,<br/><br/>
                         vielen Dank für die Zusendung der Ausschreibungsunterlagen. Hiermit unterbreiten wir Ihnen unser Angebot für die Trockenbauleistungen basierend auf den vorliegenden Plänen und dem Leistungsverzeichnis.
                      </p>
                   </div>
                   <div className="pt-4 md:pt-8 grid grid-cols-2 gap-3 md:gap-6 border-t border-slate-100">
                      <div className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl">
                         <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mb-1">Angebotssumme Netto</p>
                         <p className="text-sm md:text-xl font-black">€ 134.717,50</p>
                      </div>
                      <div className="p-3 md:p-4 bg-blue-600 text-white rounded-xl md:rounded-2xl">
                         <p className="text-[8px] md:text-[9px] font-black uppercase text-blue-200 mb-1">Status</p>
                         <p className="text-sm md:text-xl font-black uppercase tracking-widest text-[9px] md:text-[11px] mt-1 md:mt-2">Versandfertig</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 7. THE CLOSER: OWNERSHIP ARGUMENT */}
      <section className="py-20 md:py-40 lg:py-60 bg-white px-4 sm:px-6 border-t border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8 md:space-y-12 lg:space-y-16">
            <span className="bg-blue-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-xl shadow-blue-200 inline-block">
              {lang === 'de' ? 'Das Eigentums-Prinzip' : 'The Ownership Principle'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight brand-font uppercase leading-none text-slate-900">
              {lang === 'de' ? 'Ihr Agent.' : 'Your Agent.'} <br/><span className="text-blue-600">{lang === 'de' ? 'Ihr Eigentum.' : 'Your Property.'}</span>
            </h2>
            <p className="text-base md:text-xl lg:text-2xl text-slate-500 font-medium italic leading-relaxed max-w-2xl opacity-80 px-4 lg:px-0 mx-auto lg:mx-0">
              {lang === 'de'
                ? "Wir verkaufen Ihnen keine Miete. Wir bauen Ihnen einen digitalen Vermögenswert. Keine monatlichen Gebühren pro Nutzer – das Ding gehört Ihnen!"
                : "We don't sell you a rent. We build you a digital asset. No monthly fees per user – it belongs to you!"
              }
            </p>
            <div className="pt-4 md:pt-8">
              <Link
                href="/demo/dashboard"
                className="inline-block bg-slate-900 text-white px-10 py-5 md:px-16 md:py-6 lg:px-20 lg:py-8 rounded-full font-black text-base md:text-xl lg:text-2xl hover:bg-blue-600 shadow-xl md:shadow-3xl transition-all transform hover:-translate-y-2"
              >
                {lang === 'de' ? 'Begehung →' : 'Site Visit →'}
              </Link>
            </div>
          </div>
          {/* Mascot - Right Side */}
          <div className="flex-shrink-0 mt-8 lg:mt-0">
            <img
              src={mascotPage5}
              alt="AngebotsAgent Mascot - Ownership"
              className="w-40 sm:w-56 md:w-72 lg:w-80 xl:w-96 h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12 italic">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="text-left">
              <p className="text-2xl font-black text-slate-900 brand-font mb-1">
                Angebots<span className="text-blue-700">Agent</span>
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {lang === 'de' ? 'Individuelle Bau-KI-Lösungen.' : 'Custom Construction AI Solutions.'}
              </p>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="opacity-40 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
               © 2025 AngebotsAgent. {lang === 'de' ? 'Ihr Eigentum. Ihre Marge. Ihre Zukunft.' : 'Your Property. Your Margin. Your Future.'}
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
               <Link href="/beispiele" className="hover:text-slate-900 transition-colors">{t.examples}</Link>
               <button type="button" className="hover:text-slate-900 transition-colors">{lang === 'de' ? 'Impressum' : 'Legal Notice'}</button>
               <button type="button" className="hover:text-slate-900 transition-colors">{lang === 'de' ? 'Datenschutz' : 'Privacy Policy'}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
