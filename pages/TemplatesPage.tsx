
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const TemplatesPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-6xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.templates}</h1>
          <p className="text-slate-500 font-medium italic leading-relaxed">Gestalten Sie das Layout Ihrer Angebots-PDFs im Corporate Design.</p>
        </div>
        <button className="bg-slate-900 text-white px-10 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">Vorschau</button>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
         <div className="bg-white border border-slate-200 aspect-[3/4] rounded-[3rem] shadow-2xl p-12 italic text-slate-300 font-bold border-dashed flex items-center justify-center">
            [ Template Canvas Builder ]
         </div>
         <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 italic border-b border-slate-100 pb-2">Verfügbare Vorlagen</h3>
            {[
              { name: 'Modern Minimal', status: 'Aktiv' },
              { name: 'VOB-Klassik', status: 'Archiv' },
              { name: 'Kunden-Briefing Light', status: 'Entwurf' },
            ].map((tmp, i) => (
              <div key={i} className="bg-white p-6 border border-slate-200 rounded-2xl flex justify-between items-center hover:border-blue-500 cursor-pointer transition-all">
                 <span className="text-lg font-bold italic">{tmp.name}</span>
                 <span className="text-[10px] font-black uppercase text-slate-400">{tmp.status}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
