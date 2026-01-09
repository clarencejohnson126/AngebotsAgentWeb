
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const EducationPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-12 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.education}</h1>
          <p className="text-slate-500 font-medium italic leading-relaxed">Qualifikationsmatrix und gesetzliche Pflicht-Zertifikate.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">Kurs buchen</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm italic font-bold">
        <table className="w-full text-left">
           <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 italic">
             <tr>
               <th className="px-6 py-4">Mitarbeiter</th>
               <th className="px-6 py-4">Zertifikat</th>
               <th className="px-6 py-4">Status</th>
               <th className="px-6 py-4 text-right">Gültig bis</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {[
               { name: 'Marcus Weber', cert: 'Bediener Hebebühne', status: 'Gültig', date: '2026' },
               { name: 'Sarah Schmidt', cert: 'Brandschutzhelfer', status: 'Abgelaufen', date: '2023' },
             ].map((e, i) => (
               <tr key={i} className="hover:bg-slate-50">
                 <td className="px-6 py-5 text-slate-900">{e.name}</td>
                 <td className="px-6 py-5 text-slate-500 font-medium">{e.cert}</td>
                 <td className="px-6 py-5">
                    <span className={`text-[10px] font-black uppercase ${e.status === 'Gültig' ? 'text-green-600' : 'text-red-600'}`}>• {e.status}</span>
                 </td>
                 <td className="px-6 py-5 text-right text-slate-300 font-mono text-xs">{e.date}</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};
