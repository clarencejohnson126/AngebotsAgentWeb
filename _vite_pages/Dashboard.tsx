
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { navigateTo } from '../App';

interface Props {
  lang: Language;
}

export const Dashboard: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  
  const sections = [
    { title: lang === 'de' ? 'Workflow: Kalkulation' : 'Workflow: Estimating', items: [
      { h: '#/inbox', l: lang === 'de' ? 'Belege & Pläne (OCR)' : 'Docs & Plans (OCR)', d: lang === 'de' ? 'Mengen extrahieren' : 'Extract quantities' },
      { h: '#/tenders', l: lang === 'de' ? 'Ausschreibungs-Pool' : 'Tender Pool', d: lang === 'de' ? 'Potenziale finden' : 'Find potentials' },
      { h: '#/calculations', l: lang === 'de' ? 'Maßblatt-Editor' : 'Takeoff Editor', d: lang === 'de' ? 'Aufmaß erstellen' : 'Create takeoff' },
      { h: '#/beispiele', l: t.examples, d: lang === 'de' ? 'Individuelle Builds' : 'Custom builds' },
    ]},
    { title: lang === 'de' ? 'Workflow: Abschluss' : 'Workflow: Closing', items: [
      { h: '#/price-library', l: t.priceLibrary, d: lang === 'de' ? 'Preise pflegen' : 'Maintain prices' },
      { h: '#/dashboard', l: lang === 'de' ? 'Export Center' : 'Export Center', d: 'PDF & Excel' },
    ]},
    { title: lang === 'de' ? 'Wissen & Kontrolle' : 'Knowledge & Control', items: [
      { h: '#/knowledge', l: lang === 'de' ? 'VOB/B Archiv' : 'VOB/B Archive', d: lang === 'de' ? 'Regelwerke' : 'Rules' },
      { h: '#/analytics', l: lang === 'de' ? 'Margen-Analyse' : 'Margin Analytics', d: 'Controlling' },
      { h: '#/audit', l: lang === 'de' ? 'Aktivitäten' : 'Activities', d: 'Logbuch' },
    ]}
  ];

  return (
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
                <button 
                  key={item.h} 
                  onClick={(e) => navigateTo(item.h, e)} 
                  className="group block text-left"
                >
                  <p className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors brand-font italic leading-none mb-2 underline decoration-transparent group-hover:decoration-blue-200">{item.l}</p>
                  <p className="text-[10px] font-bold text-slate-400 opacity-60 uppercase tracking-widest">{item.d}</p>
                </button>
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
         <button 
          onClick={(e) => navigateTo('#/project/1', e)}
          className="relative z-10 mt-8 md:mt-0 bg-white text-slate-900 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
         >
           {lang === 'de' ? 'Projekt öffnen →' : 'Open project →'}
         </button>
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
      </div>
    </div>
  );
};
