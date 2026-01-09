
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const SocialPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12 italic">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.social}</h1>
        <p className="text-slate-500 font-medium italic leading-relaxed">Teamevents, Grillabende und interne Bekanntmachungen.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-orange-50 p-10 rounded-3xl border border-orange-100 shadow-xl shadow-orange-50">
           <h3 className="text-2xl font-black text-orange-900 mb-4 italic">Sommerfest 2024</h3>
           <p className="text-sm text-orange-700 font-bold mb-8">Am 15. August laden wir alle Mitarbeiter und Familien ein!</p>
           <button className="bg-orange-900 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest">Zusagen</button>
        </div>
        <div className="bg-slate-900 text-white p-10 rounded-3xl">
           <h3 className="text-2xl font-black mb-4 italic">Mitarbeiter des Monats</h3>
           <div className="w-20 h-20 rounded-full bg-blue-600 mb-6 flex items-center justify-center font-black text-xl italic shadow-inner">MW</div>
           <p className="text-sm font-bold text-slate-400">Marcus Weber für exzellente Bauleitung am TechCampus!</p>
        </div>
      </div>
    </div>
  );
};
