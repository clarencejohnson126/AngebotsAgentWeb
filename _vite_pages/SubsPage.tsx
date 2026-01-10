
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const SubsPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.subs}</h1>
          <p className="text-slate-500 font-medium italic">Verwaltung Ihrer Nachunternehmer und deren Qualifikationen.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">Partner einladen</button>
      </div>
      
      <div className="space-y-6">
        {[
          { name: 'Montage-Service Ali', skill: 'Akustikdecken', status: 'Gültig', cert: 'USt-Bescheinigung' },
          { name: 'Bau-Teams Nord GmbH', skill: 'Trockenbau Großflächen', status: 'Ablaufend', cert: 'Freistellungsbescheinigung' },
        ].map((sub, i) => (
          <div key={i} className="bg-white border border-slate-200 p-8 rounded-2xl flex justify-between items-center group">
             <div>
                <h3 className="text-xl font-bold italic mb-1">{sub.name}</h3>
                <p className="text-xs text-slate-400 tracking-wider uppercase font-black">{sub.skill}</p>
             </div>
             <div className="flex space-x-12 items-center italic">
                <div className="text-right">
                   <p className="text-[10px] uppercase font-bold text-slate-300 mb-1">{sub.cert}</p>
                   <span className={`text-[10px] font-black uppercase ${sub.status === 'Gültig' ? 'text-green-600' : 'text-red-500'}`}>{sub.status}</span>
                </div>
                <button className="bg-slate-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
