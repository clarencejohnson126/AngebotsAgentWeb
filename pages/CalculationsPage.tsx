
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const CalculationsPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.calculations}</h1>
          <p className="text-slate-500 font-medium">Freies Kalkulationsblatt für manuelle Massenermittlung.</p>
        </div>
        <button className="bg-green-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100">Kalkulation Exportieren</button>
      </div>
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
         <div className="bg-slate-900 p-4 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Editor Workspace</span>
            <div className="flex space-x-2">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
         </div>
         <div className="p-10 italic">
            <div className="grid grid-cols-12 gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-4">
               <div className="col-span-1">Pos</div>
               <div className="col-span-4">Bezeichnung / Bauteil</div>
               <div className="col-span-2">Formel</div>
               <div className="col-span-2">Länge</div>
               <div className="col-span-2">Höhe</div>
               <div className="col-span-1 text-right">Menge</div>
            </div>
            <div className="space-y-4">
              {[
                { pos: '1.1', desc: 'Wand OG1 - Raum 101', formula: 'L * H', l: '12.50', h: '3.00', m: '37.50' },
                { pos: '1.2', desc: 'Wand OG1 - Raum 102', formula: 'L * H', l: '8.20', h: '3.00', m: '24.60' },
                { pos: '2.1', desc: 'Abzug Türen OG1', formula: '-1 * n', l: '0.88', h: '2.12', m: '-1.86' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 text-sm font-medium border-b border-slate-50 pb-2">
                   <div className="col-span-1 text-slate-300 font-mono">{row.pos}</div>
                   <div className="col-span-4 text-slate-800 font-bold">{row.desc}</div>
                   <div className="col-span-2 text-slate-400">{row.formula}</div>
                   <div className="col-span-2">{row.l}</div>
                   <div className="col-span-2">{row.h}</div>
                   <div className="col-span-1 text-right font-black text-blue-600">{row.m}</div>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
};
