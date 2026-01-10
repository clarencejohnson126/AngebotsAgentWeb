
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const KnowledgePage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-6xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">{t.knowledge}</h1>
        <p className="text-slate-500 font-medium">Interne Standards, DIN-Normen und Material-Spezifikationen.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-4">VOB/C - Fachnormen</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">Regelungen für Bauleistungen. Wichtig für die korrekte Abrechnung von Nischen, Laibungen und Kleinmengen.</p>
          <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">12 Dokumente →</span>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-4">Hersteller-Zulassungen</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">Knauf, Rigips, Fermacell. Aktuelle Prüfzeugnisse für Brand- und Schallschutzwände.</p>
          <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">45 Dokumente →</span>
        </div>
      </div>
    </div>
  );
};
