
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const HiringPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-5xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.hiring}</h1>
        <p className="text-slate-500 font-medium italic">Sichern Sie die Zukunft Ihres Betriebs durch qualifizierte Fachkräfte.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { pos: 'Trockenbaumonteur (m/w/d)', apps: 12, status: 'Dringend' },
          { pos: 'Bauleiter Hochbau', apps: 4, status: 'Aktiv' },
          { pos: 'Auszubildender 2024', apps: 18, status: 'Laufend' },
        ].map((job, i) => (
          <div key={i} className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all group">
             <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-slate-900 italic leading-tight">{job.pos}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest ${job.status === 'Dringend' ? 'text-red-500' : 'text-blue-600'}`}>{job.status}</span>
             </div>
             <p className="text-sm text-slate-500 mb-6 italic">{job.apps} Bewerbungen eingegangen</p>
             <button className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Bewerber sichten →</button>
          </div>
        ))}
      </div>
    </div>
  );
};
