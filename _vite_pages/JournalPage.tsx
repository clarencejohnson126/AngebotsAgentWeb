
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const JournalPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.journal}</h1>
        <p className="text-slate-500 font-medium italic">KI-Zusammenfassung Ihrer Baustellenfotos und täglichen Notizen.</p>
      </div>

      <div className="space-y-10">
        {[
          { date: 'Heute, 24. Mai', p: 'Sonnenhang', content: 'Verzögerung durch Vorunternehmer (Estrich nicht trocken). Behinderungsanzeige wurde generiert.', risk: 'Hoch' },
          { date: 'Gestern, 23. Mai', p: 'TechCampus', content: 'Wandabnahme OG1 erfolgreich. 400m² fertiggestellt. Keine Mängel.', risk: 'Niedrig' },
        ].map((j, i) => (
          <div key={i} className="relative pl-12 border-l-2 border-slate-100 italic">
             <div className="absolute top-0 -left-[9px] w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
             <p className="text-[10px] font-black uppercase text-slate-300 mb-2 tracking-widest">{j.date} • {j.p}</p>
             <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <p className="text-slate-800 leading-relaxed font-bold mb-4">"{j.content}"</p>
                <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                   <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">KI-Analyse: Risiko {j.risk}</span>
                   <button className="text-xs font-bold text-slate-400 hover:text-slate-900 underline transition-colors">Vollständiges Protokoll →</button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
