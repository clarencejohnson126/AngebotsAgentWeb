
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const TenderFeedPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const items = [
    { title: 'Neubau Grundschule "Am Park"', location: 'Berlin', volume: '€ 450k', date: 'Vor 2h', match: '95%' },
    { title: 'Sanierung Altstadtquartier', location: 'Potsdam', volume: '€ 1.2M', date: 'Vor 5h', match: '82%' },
    { title: 'Büroerweiterung TechCampus', location: 'Leipzig', volume: '€ 300k', date: 'Heute', match: '90%' },
  ];

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.tenders}</h1>
          <p className="text-slate-500 font-medium">Neue Ausschreibungen passend zu Ihrem Profil.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-xs uppercase tracking-widest">Filter anpassen</button>
      </div>
      <div className="grid gap-6">
        {items.map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl flex justify-between items-center hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex space-x-6 items-center">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs uppercase tracking-tighter">Match {item.match}</div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.location} • Erwartetes Volumen: <span className="font-bold text-slate-900">{item.volume}</span></p>
               </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-black text-slate-300 uppercase mb-2">{item.date}</span>
              <button className="text-blue-600 font-bold hover:underline text-sm italic">Unterlagen prüfen →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
