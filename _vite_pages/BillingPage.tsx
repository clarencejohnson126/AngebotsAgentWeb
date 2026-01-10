
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const BillingPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.billing}</h1>
        <p className="text-slate-500 font-medium italic">Überblick über Abschlagsrechnungen, Einbehalte und Skonto.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Offene Forderungen', val: '€ 452.900', color: 'text-red-600' },
          { label: 'Einbehalte (VOB)', val: '€ 85.000', color: 'text-slate-400' },
          { label: 'Fakturiert (lfd. Monat)', val: '€ 120.400', color: 'text-blue-600' },
          { label: 'Netto-Cashflow', val: '+ € 42.000', color: 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
             <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
         <table className="w-full text-left">
           <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
             <tr>
               <th className="px-6 py-4 italic">RE-Nummer</th>
               <th className="px-6 py-4 italic">Projekt</th>
               <th className="px-6 py-4 italic">Summe Netto</th>
               <th className="px-6 py-4 italic text-right">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-50 italic">
             {[
               { id: 'RE-2024-045', p: 'Sonnenhang OG1', val: '€ 42.000', s: 'Überfällig' },
               { id: 'RE-2024-044', p: 'TechCampus Leipzig', val: '€ 12.500', s: 'Bezahlt' },
             ].map((r, i) => (
               <tr key={i} className="hover:bg-slate-50">
                 <td className="px-6 py-4 font-mono text-xs">{r.id}</td>
                 <td className="px-6 py-4 text-sm font-bold">{r.p}</td>
                 <td className="px-6 py-4 text-sm">{r.val}</td>
                 <td className={`px-6 py-4 text-right text-[10px] font-black uppercase ${r.s === 'Bezahlt' ? 'text-green-600' : 'text-red-500'}`}>{r.s}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
};
