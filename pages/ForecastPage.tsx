
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const ForecastPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12">
      <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.forecast}</h1>
      <p className="text-slate-500 font-medium italic border-b border-slate-200 pb-8 mb-12">Datenbasierte Vorhersage Ihrer Liquidität für das nächste Geschäftsjahr.</p>
      
      <div className="grid md:grid-cols-2 gap-12">
         <div className="bg-white border border-slate-200 p-12 rounded-[3rem] shadow-xl">
            <h3 className="text-xl font-bold mb-8 italic">Erwarteter Cash-In (Q3-Q4)</h3>
            <div className="h-48 flex items-end space-x-2">
               {[60, 40, 90, 100, 70, 85].map((h, i) => (
                 <div key={i} className="flex-grow bg-slate-100 rounded-full group relative">
                    <div className="absolute bottom-0 w-full bg-blue-600 rounded-full transition-all duration-1000" style={{ height: `${h}%` }}></div>
                 </div>
               ))}
            </div>
            <p className="text-center mt-6 text-[10px] font-black uppercase text-slate-300 tracking-widest">Piped vs. Confirmed Projects</p>
         </div>
         <div className="bg-slate-900 text-white p-12 rounded-[3rem] flex flex-col justify-center italic">
            <p className="text-sm font-black text-blue-500 uppercase tracking-widest mb-4">KI-Prognose</p>
            <p className="text-3xl font-bold leading-tight">"Basierend auf Ihrer aktuellen Gewinnrate (22%) wird im Oktober ein Engpass von € 45k prognostiziert."</p>
            <button className="mt-10 text-xs font-black uppercase tracking-widest underline decoration-blue-500">Gegenmaßnahmen planen →</button>
         </div>
      </div>
    </div>
  );
};
