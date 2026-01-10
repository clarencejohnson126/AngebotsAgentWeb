
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const LegalPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.legal}</h1>
      <p className="text-slate-500 font-medium italic mb-12 border-b border-slate-200 pb-8">KI-Prüfung von Bauverträgen auf VOB-Konformität und Haftungsfallen.</p>
      
      <div className="bg-slate-900 text-white p-12 rounded-[2rem] italic shadow-2xl">
         <h2 className="text-2xl font-black mb-8 underline decoration-blue-500">Kritische Vertragsklauseln</h2>
         <div className="space-y-6">
            {[
              { risk: 'Unzulässige Fristenverlängerung', clause: '§ 4 Abs. 2', impact: 'Hohes Risiko' },
              { risk: 'Pauschalierung von Nachträgen', clause: 'Sondervereinbarung C', impact: 'Achtung' },
            ].map((l, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-slate-800 rounded-2xl border border-slate-700 group hover:border-blue-500 transition-colors cursor-pointer">
                 <div>
                    <p className="text-lg font-bold mb-1">{l.risk}</p>
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">{l.clause}</p>
                 </div>
                 <span className={`text-[10px] font-black uppercase ${l.impact === 'Hohes Risiko' ? 'text-red-500' : 'text-orange-400'}`}>{l.impact}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
