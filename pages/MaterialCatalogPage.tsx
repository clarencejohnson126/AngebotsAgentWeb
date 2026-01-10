
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const MaterialCatalogPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="mb-10 flex justify-between items-center border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.materials}</h1>
          <p className="text-slate-500 font-medium">Verwalten Sie Ihre Einkaufskonditionen bei Großhändlern.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2 rounded text-xs font-black uppercase tracking-widest">Import CSV</button>
      </div>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 border border-slate-200 rounded-xl">
           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lieferanten</p>
           <p className="text-xl font-black">12 Partner</p>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl">
           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Gesamt-SKUs</p>
           <p className="text-xl font-black">2.450 Artikel</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
           <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
             <tr>
               <th className="px-6 py-4">Artikelnummer</th>
               <th className="px-6 py-4">Bezeichnung</th>
               <th className="px-6 py-4">Einheit</th>
               <th className="px-6 py-4 text-right">Listenpreis</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 italic">
             {[
               { id: 'GK-12-001', name: 'Gipskartonbauplatte 12.5mm', unit: 'm²', price: '€ 4.50' },
               { id: 'CW-75-001', name: 'CW-Profil 75/50/06 - 3000mm', unit: 'Stk', price: '€ 12.80' },
               { id: 'UD-28-005', name: 'UD-Profil 28/27/06 - 3000mm', unit: 'Stk', price: '€ 8.20' },
             ].map((art, i) => (
               <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer">
                 <td className="px-6 py-4 font-mono text-xs">{art.id}</td>
                 <td className="px-6 py-4 text-sm font-bold text-slate-800">{art.name}</td>
                 <td className="px-6 py-4 text-sm">{art.unit}</td>
                 <td className="px-6 py-4 text-right font-black text-slate-900">{art.price}</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};
