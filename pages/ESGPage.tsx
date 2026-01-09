
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const ESGPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.esg}</h1>
          <p className="text-slate-500 font-medium italic leading-relaxed">CO2-Bilanzierung und Recycling-Dokumentation für DGNB/LEED Zertifikate.</p>
        </div>
        <button className="bg-green-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest">Bericht Download</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
           <p className="text-[10px] font-black text-green-700 uppercase mb-2 tracking-widest">Recycling Quote</p>
           <p className="text-4xl font-black text-green-900">82%</p>
        </div>
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">CO2-Fußabdruck (t)</p>
           <p className="text-4xl font-black text-slate-900">14.2</p>
        </div>
        <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
           <p className="text-[10px] font-black text-blue-700 uppercase mb-2 tracking-widest">Regionalität</p>
           <p className="text-4xl font-black text-blue-900">65% <span className="text-sm font-medium italic opacity-40">Lokal</span></p>
        </div>
      </div>
    </div>
  );
};
