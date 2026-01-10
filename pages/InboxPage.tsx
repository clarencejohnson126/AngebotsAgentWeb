
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const InboxPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.inbox}</h1>
          <p className="text-slate-500 font-medium italic leading-relaxed">
            Zentraler Eingang für alle Dokumente. KI-gestützte Sortierung und Vor-Analyse.
          </p>
        </div>
        <div className="relative">
           <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">12</div>
           <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { from: 'Architekturbüro Müller', file: 'Tender_Berlin_V2.pdf', type: 'Ausschreibung', date: 'Vor 15 Min.' },
          { from: 'Baustoff-Union (Email)', file: 'Angebot_Profile_Mai.pdf', type: 'Materialangebot', date: 'Vor 2h' },
          { from: 'Marcus (Site Manager)', file: 'IMG_4021.jpg', type: 'Baufoto', date: 'Heute' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition-all cursor-pointer group">
             <div className="flex space-x-8 items-center italic">
                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                   <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900 underline decoration-slate-200 group-hover:decoration-blue-400">{item.file}</p>
                   <p className="text-xs text-slate-400 font-medium">Von: {item.from} • Typ: {item.type}</p>
                </div>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{item.date}</span>
                <button className="block text-[10px] font-black uppercase text-blue-600 hover:underline mt-2">Jetzt Analysieren</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
