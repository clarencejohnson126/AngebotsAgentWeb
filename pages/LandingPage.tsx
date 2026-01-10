
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { navigateTo } from '../App';

export const LandingPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  // Logic to maintain the 3-row split without italics for the keywords
  const getHeroTitleParts = () => {
    if (lang === 'de') {
      return [
        <>Angebote <span className="text-blue-600">schnell</span></>,
        <>erstellen. Aufträge</>,
        <>sicher <span className="text-blue-600">gewinnen</span>.</>
      ];
    }
    return [
      <>Create offers <span className="text-blue-600">fast</span></>,
      <>Win contracts</>,
      <><span className="text-blue-600">reliably</span> and safe</>
    ];
  };

  const titleParts = getHeroTitleParts();

  return (
    <div className="flex flex-col overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 bg-white">
      
      {/* 1. HERO: ARCHITECTURAL PRECISION */}
      <section className="min-h-[85vh] flex flex-col justify-center items-center px-6 text-center relative bg-[#fcfcfc] border-b border-slate-100">
        <div className="max-w-7xl mx-auto z-10 flex flex-col items-center w-full">
          <span className="text-blue-600 font-black uppercase tracking-[0.6em] text-[11px] mb-10 block animate-fade-in">
            {t.heroMicro}
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-[6.8rem] font-black text-slate-900 mb-12 tracking-tight leading-[1.05] brand-font uppercase w-full">
            <span className="block whitespace-nowrap">{titleParts[0]}</span>
            <span className="block whitespace-nowrap">{titleParts[1]}</span>
            <span className="block whitespace-nowrap">{titleParts[2]}</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-500 mb-16 max-w-6xl mx-auto leading-relaxed font-medium italic px-4 opacity-70">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <button 
              onClick={(e) => navigateTo('#/dashboard', e)}
              className="bg-blue-600 text-white px-12 py-6 rounded-full font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all transform hover:-translate-y-1"
            >
              {t.ctaDemo}
            </button>
            <button 
              onClick={(e) => navigateTo('#/dashboard', e)}
              className="text-slate-900 px-12 py-6 rounded-full font-black text-xl hover:bg-slate-50 border-4 border-slate-900 transition-all"
            >
              {t.ctaLogin}
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-10 animate-bounce text-slate-200">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* 2. OVERVIEW: THE 4 PILLARS */}
      <section className="py-32 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight brand-font uppercase">
              {lang === 'de' ? 'Die 4 Kern-Vorteile.' : 'The 4 Core Pillars.'}
            </h2>
            <p className="text-slate-400 text-xl font-medium italic max-w-2xl mx-auto">
              {lang === 'de' ? 'Ein durchgängiger, digitaler Workflow vom ersten Plan bis zum fertigen Export.' : 'A seamless digital workflow from the first plan to the final export.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n: '01', t: lang === 'de' ? 'Massenermittlung' : 'Quantity Takeoff', d: lang === 'de' ? 'KI-Extraktion aus Plänen & GAEB.' : 'AI extraction from plans & GAEB.' },
              { n: '02', t: lang === 'de' ? 'Nachtrags-Radar' : 'Risk Detection', d: lang === 'de' ? 'Risiken finden vor Abgabe.' : 'Find risks before submission.' },
              { n: '03', t: lang === 'de' ? 'Preis-Strategie' : 'Price Strategy', d: lang === 'de' ? 'Marge sichern, Gebote gewinnen.' : 'Secure margin, win bids.' },
              { n: '04', t: lang === 'de' ? 'Profi-Export' : 'Pro Export', d: lang === 'de' ? 'PDF & Excel in Sekunden.' : 'PDF & Excel in seconds.' }
            ].map((p, i) => (
              <div key={i} className="border border-white/10 p-10 rounded-[2rem] bg-white/5 hover:bg-blue-600 transition-all group cursor-pointer" onClick={() => {
                const element = document.getElementById(`feature-${i+1}`);
                element?.scrollIntoView({ behavior: 'smooth' });
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
      <section id="feature-1" className="py-40 bg-white px-6 overflow-hidden border-b border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-1/2 space-y-10">
            <div className="space-y-4">
              <span className="text-blue-600 font-black uppercase tracking-widest text-xs">Modul 01</span>
              <h2 className="text-4xl md:text-5xl font-black brand-font uppercase leading-tight text-slate-900">
                {lang === 'de' ? 'Massenermittlung & Aufmaß' : 'Quantity Extraction & Takeoff'}
              </h2>
            </div>
            <p className="text-xl text-slate-500 font-medium italic leading-relaxed">
              {lang === 'de' 
                ? "AngebotsAgent extrahiert und strukturiert Massen direkt aus Ausschreibungsunterlagen und Bauplänen. Er liest Flächen aus Raumtabellen und Plananmerkungen und unterstützt das nutzergestützte Aufmaß dort, wo Mengen fehlen."
                : "AngebotsAgent extracts and structures quantities directly from tender documents and construction plans."
              }
            </p>
            <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 font-bold italic text-blue-900 leading-relaxed">
              {lang === 'de'
                ? "Mengen sind prüfbar und direkt mit der Quelle im Plan verlinkt."
                : "Quantities are auditable and linked directly to the plan source."
              }
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
             <div className="bg-[#f8f9fa] rounded-[2.5rem] p-1 shadow-3xl border border-slate-200 overflow-hidden transform rotate-1">
                <div className="bg-white p-6 border-b border-slate-200 flex items-center justify-between">
                   <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Massen_Extraktion.xlsx</span>
                </div>
                <div className="p-4">
                   <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                         <tr>
                            <th className="p-3 border border-slate-200">Position</th>
                            <th className="p-3 border border-slate-200">Bauteil</th>
                            <th className="p-3 border border-slate-200">Menge</th>
                            <th className="p-3 border border-slate-200">Quelle</th>
                         </tr>
                      </thead>
                      <tbody className="italic font-medium text-slate-700">
                         <tr>
                            <td className="p-3 border border-slate-200">1.1.20</td>
                            <td className="p-3 border border-slate-200">GK-Wand F90</td>
                            <td className="p-3 border border-slate-200 bg-blue-50 font-black">452,50 m²</td>
                            <td className="p-3 border border-slate-200 text-blue-600">Plan_OG1.pdf</td>
                         </tr>
                         <tr>
                            <td className="p-3 border border-slate-200">1.1.25</td>
                            <td className="p-3 border border-slate-200">Vorsatzschale</td>
                            <td className="p-3 border border-slate-200 bg-blue-50 font-black">112,00 m²</td>
                            <td className="p-3 border border-slate-200 text-blue-600">Plan_EG.pdf</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURE 2: RISK RADAR (Comparison Excerpt) */}
      <section id="feature-2" className="py-40 bg-slate-50 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-24">
          <div className="lg:w-1/2 space-y-10">
            <div className="space-y-4">
              <span className="text-red-600 font-black uppercase tracking-widest text-xs">Modul 02</span>
              <h2 className="text-4xl md:text-5xl font-black brand-font uppercase leading-tight text-slate-900">
                {lang === 'de' ? 'Nachtrags-Radar' : 'Change Order Radar'}
              </h2>
            </div>
            <p className="text-xl text-slate-500 font-medium italic leading-relaxed">
              {lang === 'de'
                ? "AngebotsAgent vergleicht LV-Texte mit den Plänen, um Inkonsistenzen und fehlende Leistungen zu identifizieren. Sie erkennen Risiken, bevor diese zum Problem werden."
                : "AngebotsAgent compares tender texts with plans to identify inconsistencies and missing services."
              }
            </p>
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100 font-bold italic text-red-900 leading-relaxed">
              {lang === 'de'
                ? "Vermeiden Sie Kalkulationsfehler und sichern Sie sich wertvolle Argumente für spätere Nachträge."
                : "Avoid calculation errors and secure valuable arguments for later change orders."
              }
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
             <div className="bg-white rounded-[2.5rem] p-10 shadow-3xl border-l-[12px] border-red-500 transform -rotate-1">
                <div className="space-y-6">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="text-red-600 font-black uppercase tracking-widest text-[11px]">⚠ Widerspruch erkannt</h4>
                      <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest italic">Analysebericht #402</span>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase text-slate-400">Ausschreibungstext</p>
                         <p className="text-xs font-bold text-slate-900 leading-relaxed italic">"Standard-Beplankung für Innenwände vorgesehen."</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase text-red-500">Planvorgabe (Detailschnitt)</p>
                         <p className="text-xs font-bold text-red-600 leading-relaxed italic">"Brandschutzanforderung F90 zwingend erforderlich."</p>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-[11px] text-slate-600 font-bold">
                      HINWEIS: Mehrkosten für Material und Lohn ca. +15%. <br/>Strategische Empfehlung: Klärung per Bieterfrage oder im Nachtrags-Logbuch vormerken.
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURE 3: PRICING (Logic Card) */}
      <section id="feature-3" className="py-40 bg-white px-6 border-b border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-1/2 space-y-10">
            <div className="space-y-4">
              <span className="text-green-600 font-black uppercase tracking-widest text-xs">Modul 03</span>
              <h2 className="text-4xl md:text-5xl font-black brand-font uppercase leading-tight text-slate-900">
                {lang === 'de' ? 'Kalkulation & Marge' : 'Pricing & Margin Control'}
              </h2>
            </div>
            <p className="text-xl text-slate-500 font-medium italic leading-relaxed">
              {lang === 'de'
                ? "Nutzen Sie Ihre eigene Preisbibliothek und hinterlegen Sie Aufschlagsregeln. Der Agent berechnet Zielpreise unter Berücksichtigung von Risikopuffern."
                : "Use your own price library and store markup rules. The agent calculates target prices considering risk buffers."
              }
            </p>
            <div className="bg-green-50 p-8 rounded-3xl border border-green-100 font-bold italic text-green-900 leading-relaxed">
              {lang === 'de'
                ? "Volle Kontrolle über Deckungsbeitrag und Wagnis-Gewinn."
                : "Full control over contribution margin and profit-risk."
              }
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
             <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-8 shadow-4xl transform rotate-1 relative">
                <div className="absolute top-8 right-12 opacity-10">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div className="space-y-6 italic">
                   <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[11px] font-black uppercase text-slate-500">Selbstkosten (EK)</span>
                      <span className="text-xl font-bold">€ 112.450,00</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[11px] font-black uppercase text-green-500">Marge (15%)</span>
                      <span className="text-xl font-bold text-green-400">+ € 16.867,50</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[11px] font-black uppercase text-blue-500">Wagnis/Risiko</span>
                      <span className="text-xl font-bold text-blue-400">+ € 5.400,00</span>
                   </div>
                   <div className="pt-4 flex justify-between items-center">
                      <span className="text-[13px] font-black uppercase tracking-widest text-slate-300">Angebotssumme Netto</span>
                      <span className="text-4xl font-black text-white">€ 134.717,50</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURE 4: EXPORT (Word Style Preview) */}
      <section id="feature-4" className="py-40 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-24">
          <div className="lg:w-1/2 space-y-10">
            <div className="space-y-4">
              <span className="text-white opacity-40 font-black uppercase tracking-widest text-xs">Modul 04</span>
              <h2 className="text-4xl md:text-5xl font-black brand-font uppercase leading-tight">
                {lang === 'de' ? 'Profi-Export' : 'Professional Export'}
              </h2>
            </div>
            <p className="text-xl text-slate-300 font-medium italic leading-relaxed">
              {lang === 'de'
                ? "Generieren Sie versandfertige Angebote als PDF oder Excel. Inklusive formalem Anschreiben und strukturierter Positionsübersicht in Ihrem Firmendesign."
                : "Generate ready-to-send offers as PDF or Excel including a formal letter."
              }
            </p>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 font-bold italic text-white/80 leading-relaxed">
              {lang === 'de'
                ? "Ein Klick für den Export – Stunden gespart bei der Formatierung."
                : "One click to export – hours saved in formatting."
              }
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
             <div className="bg-white text-slate-900 p-14 rounded-[3rem] shadow-4xl transform -rotate-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 border-l border-b border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-300 uppercase rotate-45 -mr-16 -mt-16">
                   {lang === 'de' ? 'ENTWURF' : 'DRAFT'}
                </div>
                <div className="space-y-8 italic">
                   <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                      <div className="space-y-1">
                         <div className="h-3 w-32 bg-slate-100 rounded"></div>
                         <div className="h-3 w-48 bg-slate-100 rounded"></div>
                      </div>
                      <div className="w-10 h-10 bg-blue-600 rounded-lg"></div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-2xl font-black brand-font uppercase tracking-tight">Angebot: Neubau BV Sonnenhang</h3>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                         Sehr geehrte Damen und Herren,<br/><br/>
                         vielen Dank für die Zusendung der Ausschreibungsunterlagen. Hiermit unterbreiten wir Ihnen unser Angebot für die Trockenbauleistungen basierend auf den vorliegenden Plänen und dem Leistungsverzeichnis.
                      </p>
                   </div>
                   <div className="pt-8 grid grid-cols-2 gap-6 border-t border-slate-100">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                         <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Angebotssumme Netto</p>
                         <p className="text-xl font-black">€ 134.717,50</p>
                      </div>
                      <div className="p-4 bg-blue-600 text-white rounded-2xl">
                         <p className="text-[9px] font-black uppercase text-blue-200 mb-1">Status</p>
                         <p className="text-xl font-black uppercase tracking-widest text-[11px] mt-2">Versandfertig</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 7. THE CLOSER: OWNERSHIP ARGUMENT */}
      <section className="py-60 bg-white px-6 text-center border-t border-slate-50">
        <div className="max-w-4xl mx-auto space-y-16">
          <span className="bg-blue-600 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.4em] shadow-xl shadow-blue-200 inline-block">
            {lang === 'de' ? 'Das Eigentums-Prinzip' : 'The Ownership Principle'}
          </span>
          <h2 className="text-5xl md:text-8xl font-black tracking-tight brand-font uppercase leading-none text-slate-900">
            {lang === 'de' ? 'Ihr Agent.' : 'Your Agent.'} <br/><span className="text-blue-600">{lang === 'de' ? 'Ihr Eigentum.' : 'Your Property.'}</span>
          </h2>
          <p className="text-2xl text-slate-500 font-medium italic leading-relaxed max-w-2xl mx-auto opacity-80 px-4">
            {lang === 'de' 
              ? "Wir verkaufen Ihnen keine Miete. Wir bauen Ihnen einen digitalen Vermögenswert. Keine monatlichen Gebühren pro Nutzer – das Ding gehört Ihnen!"
              : "We don't sell you a rent. We build you a digital asset. No monthly fees per user – it belongs to you!"
            }
          </p>
          <div className="pt-8">
            <button 
              onClick={(e) => navigateTo('#/dashboard', e)}
              className="bg-slate-900 text-white px-20 py-8 rounded-full font-black text-2xl hover:bg-blue-600 shadow-3xl transition-all transform hover:-translate-y-2"
            >
              {lang === 'de' ? 'System anfordern →' : 'Request system →'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
