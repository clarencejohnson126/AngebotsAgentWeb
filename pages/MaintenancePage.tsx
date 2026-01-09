
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const MaintenancePage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-6xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.maintenance}</h1>
          <p className="text-slate-500 font-medium italic leading-relaxed">Verwaltung der 5-jährigen Gewährleistungsansprüche und Mängelbeseitigung.</p>
        </div>
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center font-black text-blue-600 text-2xl italic shadow-inner">24</div>
      </div>

      <div className="grid gap-6">
        {[
          { project: 'Musterhaus Parkallee', issue: 'Rissbildung Silikonfuge', deadline: 'In 3 Tagen', type: 'Mangel' },
          { project: 'Hotel am See', issue: 'Wartung Brandschutztüren', deadline: '12.08.2024', type: 'Wartung' },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 p-8 rounded-3xl flex justify-between items-center hover:bg-slate-50 transition-all">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">{m.project}</p>
                <h3 className="text-2xl font-black italic">{m.issue}</h3>
             </div>
             <div className="text-right italic">
                <p className="text-sm font-bold text-slate-900 mb-1">Frist: {m.deadline}</p>
                <span className={`text-[10px] font-black uppercase ${m.type === 'Mangel' ? 'text-red-600' : 'text-blue-600'}`}>{m.type}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
