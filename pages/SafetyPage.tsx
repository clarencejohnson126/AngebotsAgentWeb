
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const SafetyPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.safety}</h1>
          <p className="text-slate-500 font-medium italic leading-relaxed max-w-lg">
            Verwalten Sie Sicherheitsunterweisungen, Gefährdungsbeurteilungen und PSA-Ausgaben.
          </p>
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100">Neuer Vorfall</button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
           <h3 className="text-lg font-bold mb-6 italic">Nächste Unterweisungen</h3>
           <div className="space-y-4">
              {[
                { user: 'Marcus Weber', type: 'Höhenarbeit', date: 'Morgen', status: 'Fällig' },
                { user: 'Sarah Schmidt', type: 'Staubschutz', date: '12. Juni', status: 'Geplant' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold">{s.user}</p>
                    <p className="text-xs text-slate-500">{s.type}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-red-500">{s.status}</span>
                </div>
              ))}
           </div>
        </div>
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
           <h3 className="text-lg font-bold mb-6 italic">Zertifikate & Nachweise</h3>
           <p className="text-sm text-slate-400 mb-4">Übersicht über Freistellungsbescheinigungen und Soka-Bau Nachweise.</p>
           <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all">
             PDF hochladen
           </button>
        </div>
      </div>
    </div>
  );
};
