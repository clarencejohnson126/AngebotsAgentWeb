
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const CRMPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.crm}</h1>
          <p className="text-slate-500 font-medium italic">Generalunternehmer und Architekten-Netzwerk.</p>
        </div>
        <div className="flex space-x-4">
           <button className="px-4 py-2 border border-slate-200 rounded text-xs font-bold uppercase tracking-widest">CSV Export</button>
           <button className="bg-slate-900 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-widest">Neuer Kontakt</button>
        </div>
      </div>
      
      <div className="grid gap-6">
        {[
          { name: 'HochBau GmbH', rep: 'Herr Müller', score: '98/100', payment: 'Sehr Schnell', volume: '€ 4.2M' },
          { name: 'Architekturbüro Kraft', rep: 'Frau Dr. Kraft', score: '72/100', payment: 'Mittel', volume: '€ 150k' },
          { name: 'City Development SE', rep: 'Hr. Arslan', score: '45/100', payment: 'Langsam', volume: '€ 1.8M' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 p-8 rounded-3xl flex justify-between items-center hover:border-blue-300 transition-colors cursor-pointer group">
             <div className="flex space-x-12 items-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl italic">{c.name[0]}</div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{c.name}</h3>
                   <p className="text-sm text-slate-500 italic">Kontakt: {c.rep} • Gesamtvolumen: <span className="text-slate-900 font-bold">{c.volume}</span></p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest italic">Zahlungsscore</p>
                <p className={`text-2xl font-black ${parseInt(c.score) > 80 ? 'text-green-600' : parseInt(c.score) > 60 ? 'text-orange-500' : 'text-red-500'}`}>{c.score}</p>
                <p className="text-[10px] font-bold text-slate-400">{c.payment}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
