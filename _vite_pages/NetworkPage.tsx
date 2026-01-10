
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const NetworkPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.network}</h1>
        <p className="text-slate-500 font-medium italic leading-relaxed">Regionale Übersicht Ihrer Partner-Infrastruktur und Baustellen.</p>
      </div>

      <div className="bg-slate-50 rounded-[4rem] h-96 flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden group">
         <div className="text-center italic z-10 transition-transform group-hover:scale-110 duration-1000">
            <p className="text-4xl font-black text-slate-300 opacity-40 uppercase tracking-widest mb-4 italic">Interaktive Karte</p>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-xl">Google Maps Integration fällig</p>
         </div>
         <div className="absolute top-20 left-40 w-4 h-4 bg-blue-600 rounded-full animate-ping"></div>
         <div className="absolute bottom-32 right-64 w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
