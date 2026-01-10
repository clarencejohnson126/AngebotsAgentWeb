
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ExampleCase {
  id: string;
  trade: string;
  company: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  bgClass: string;
  description: string;
  specificFeatures: string[];
  wording: {
    hero: string;
    takeoff: string;
    risk: string;
    pricing: string;
  };
}

const EXAMPLES: ExampleCase[] = [
  {
    id: 'drywall',
    trade: 'Trockenbau',
    company: 'WandWerk GmbH',
    primaryColor: '#2563eb', // Blue
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
    primaryColor: '#d97706', // Amber/Orange
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
    primaryColor: '#0ea5e9', // Sky Blue
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
    primaryColor: '#15803d', // Green
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
    primaryColor: '#dc2626', // Red
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
];

export const ExamplesPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [selected, setSelected] = useState<ExampleCase | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-16 px-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-20 space-y-6">
          <span className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px]">Individuelle Builds</span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter brand-font">Portfolio der Agenten.</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto italic font-medium leading-relaxed">
            Wir bauen keine Standard-Software. Wir erschaffen proprietäre Vermögenswerte für Ihren Betrieb. Sehen Sie, wie der AngebotsAgent pro Gewerk angepasst wird.
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
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Individuelles System</span>
                  <h2 className="text-4xl font-black italic tracking-tighter leading-none mt-4">{selected.company}</h2>
                  <p className="mt-6 text-sm font-medium opacity-80 italic">{selected.description}</p>
                </div>
                <div className="space-y-4">
                   <div className="p-4 bg-black/10 rounded-2xl border border-white/10 italic">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Cost Model</p>
                      <p className="text-lg font-bold">Pay-per-API</p>
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
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic">Fachspezifische Wording-Anpassung</h3>
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-300 mb-1">Hero Messaging</p>
                         <p className="text-lg font-bold italic text-slate-900">"{selected.wording.hero}"</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-300 mb-1">Aufmaß-Modul</p>
                         <p className="text-lg font-bold italic text-slate-900">"{selected.wording.takeoff}"</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-300 mb-1">Risiko-Radar</p>
                         <p className="text-lg font-bold italic text-slate-900">"{selected.wording.risk}"</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-300 mb-1">Marge & Preis</p>
                         <p className="text-lg font-bold italic text-slate-900">"{selected.wording.pricing}"</p>
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic">Proprietäre Features</h3>
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
                      Dieses System wird auf der firmeneigenen Domain gehostet.<br/>
                      <span className="font-bold text-slate-900">100% Ownership.</span>
                   </div>
                   <button 
                     style={{ backgroundColor: selected.primaryColor }}
                     className="text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl"
                   >
                     System-Check für Ihr Gewerk
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
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">Keine Standard-SaaS.<br/><span className="text-blue-500">Ihre Unternehmens-Werte.</span></h2>
            <p className="text-xl text-slate-400 italic max-w-2xl leading-relaxed">
               Jeder dieser Agenten ist ein Unikat. Entwickelt für die spezifischen Probleme des jeweiligen Gewerks. Wir bauen keine Tools, wir bauen digitale Assets.
            </p>
            <div className="flex space-x-12 pt-8">
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Laufzeit</p>
                  <p className="text-lg font-bold">Unbegrenzt</p>
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Nutzer</p>
                  <p className="text-lg font-bold">Unbegrenzt</p>
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Code-Ownership</p>
                  <p className="text-lg font-bold">100%</p>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
      </section>
    </div>
  );
};
