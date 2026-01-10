
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const VendorComparePage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10 border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.vendorCompare}</h1>
        <p className="text-slate-500 font-medium italic">Optimieren Sie Ihren Einkauf durch KI-gestützten Preisvergleich.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl overflow-x-auto">
         <table className="w-full text-left min-w-[800px]">
            <thead>
               <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 italic">
                  <th className="py-4 px-4">Material (Mengen-Set)</th>
                  <th className="py-4 px-4">BAUSTOFF UNION</th>
                  <th className="py-4 px-4">RAAB KARCHER</th>
                  <th className="py-4 px-4">BAYWA</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 italic font-medium">
               {[
                 { m: 'GK-Platten (500 m²)', v1: '€ 2.250', v2: '€ 2.100*', v3: '€ 2.400' },
                 { m: 'CW-Profile (200 lfm)', v1: '€ 800', v2: '€ 850', v3: '€ 780*' },
                 { m: 'Dämmwolle (50 Pak)', v1: '€ 1.500*', v2: '€ 1.600', v3: '€ 1.550' },
               ].map((row, i) => (
                 <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-6 px-4 font-bold text-slate-900">{row.m}</td>
                    <td className={`py-6 px-4 ${row.v1.includes('*') ? 'text-blue-600 font-black underline' : 'text-slate-400'}`}>{row.v1.replace('*', '')}</td>
                    <td className={`py-6 px-4 ${row.v2.includes('*') ? 'text-blue-600 font-black underline' : 'text-slate-400'}`}>{row.v2.replace('*', '')}</td>
                    <td className={`py-6 px-4 ${row.v3.includes('*') ? 'text-blue-600 font-black underline' : 'text-slate-400'}`}>{row.v3.replace('*', '')}</td>
                 </tr>
               ))}
            </tbody>
         </table>
         <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center italic">
            <span className="text-xs text-slate-400">* Markierte Preise inkl. Firmen-Rabattgruppe A</span>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest">Warenkorb generieren</button>
         </div>
      </div>
    </div>
  );
};
