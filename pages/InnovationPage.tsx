
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const InnovationPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-5xl mx-auto space-y-12 italic font-medium">
      <div className="border-b border-slate-200 pb-8 text-center">
        <h1 className="text-5xl font-black text-slate-900 mb-4 brand-font italic uppercase tracking-tighter">{t.innovation}</h1>
        <p className="text-slate-500 max-w-lg mx-auto">Digitale Zwillinge (BIM), 3D-Scans und fortschrittliche Bautechnologien.</p>
      </div>
      <div className="grid grid-cols-2 gap-10">
         <div className="bg-slate-100 aspect-video rounded-[3rem] p-10 flex flex-col justify-end group cursor-pointer hover:bg-blue-600 transition-all duration-700">
            <h3 className="text-3xl font-black text-slate-900 group-hover:text-white transition-colors">BIM 5D</h3>
            <p className="text-xs text-slate-400 group-hover:text-blue-100">Kosten- & Zeitdimension im Modell</p>
         </div>
         <div className="bg-slate-900 aspect-video rounded-[3rem] p-10 flex flex-col justify-end group cursor-pointer border border-slate-800">
            <h3 className="text-3xl font-black text-white">Prefabs</h3>
            <p className="text-xs text-slate-500">Modulbau-Tracking</p>
         </div>
      </div>
    </div>
  );
};
