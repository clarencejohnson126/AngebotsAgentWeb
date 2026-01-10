
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const MarketPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.market}</h1>
        <p className="text-slate-500 font-medium italic">Rohstoffpreise und regionale Marktentwicklung für das Baugewerbe.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         {[
           { name: 'Stahl-Index (Profile)', val: '€ 1.250 / t', trend: 'Fallend', change: '-4.2%' },
           { name: 'Gipskarton (Standard)', val: '€ 4.80 / m²', trend: 'Steigend', change: '+1.5%' },
           { name: 'Diesel (Gewerbe)', val: '€ 1.55 / L', trend: 'Stabil', change: '± 0%' },
         ].map((m, i) => (
           <div key={i} className="bg-white p-8 border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition-all">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">{m.name}</p>
              <p className="text-3xl font-black mb-4 italic">{m.val}</p>
              <div className="flex items-center space-x-2">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.change.includes('+') ? 'bg-red-50 text-red-600' : m.change.includes('-') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                    {m.change}
                 </span>
                 <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">{m.trend}</span>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-12 italic">
         <h2 className="text-2xl font-black mb-6">Regionale Wettbewerbs-Analyse</h2>
         <p className="text-slate-400 mb-8 max-w-lg leading-relaxed font-medium">
            In Ihrem Umkreis (Region Berlin-Brandenburg) wurden in den letzten 30 Tagen 12 Ausschreibungen im Trockenbau vergeben. Durchschnittlicher Zuschlagspreis: € 45,50 / m².
         </p>
         <button className="bg-blue-600 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all">Detaillierten Marktbericht anfordern</button>
      </div>
    </div>
  );
};
