
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const ArchivePage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.archive}</h1>
      <p className="text-slate-500 font-medium mb-12 border-b border-slate-200 pb-8">Historie abgeschlossener Kalkulationen und Angebote.</p>
      
      <div className="space-y-4">
        {[
          { name: 'Altbau Sophienstraße', date: 'Nov 2023', total: '€ 142.000', result: 'Beauftragt' },
          { name: 'Klinikum Nord', date: 'Aug 2023', total: '€ 2.100.000', result: 'Nicht beauftragt' },
          { name: 'Sporthalle Mitte', date: 'Mai 2023', total: '€ 85.000', result: 'Beauftragt' },
        ].map((proj, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl flex justify-between items-center group hover:bg-slate-50 transition-colors">
            <div>
              <p className="text-sm font-black text-slate-900 mb-1">{proj.name}</p>
              <p className="text-xs text-slate-400">{proj.date} • Summe: {proj.total}</p>
            </div>
            <div className="flex items-center space-x-6">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${proj.result === 'Beauftragt' ? 'text-green-600' : 'text-slate-300'}`}>{proj.result}</span>
              <button className="opacity-0 group-hover:opacity-100 text-blue-600 font-bold text-xs uppercase transition-opacity italic">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
