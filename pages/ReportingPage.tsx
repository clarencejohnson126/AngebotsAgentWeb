
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const ReportingPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.reporting}</h1>
        <p className="text-slate-500 font-medium">Generieren Sie Daten für Controlling und Compliance.</p>
      </div>
      <div className="grid gap-6">
        {[
          { title: 'Projekt-Margen-Bericht', desc: 'Detaillierte Auswertung aller kalkulierten Projekte im Zeitraum.', format: 'PDF, XLSX' },
          { title: 'Nachtrags-Logbuch', desc: 'Zusammenfassung aller identifizierten Potenziale für die Geschäftsführung.', format: 'PDF' },
          { title: 'Lieferanten-Preis-Historie', desc: 'Preisentwicklung wichtiger SKUs über die letzten 12 Monate.', format: 'CSV' },
        ].map((report, i) => (
          <div key={i} className="bg-white border border-slate-200 p-8 rounded-3xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
             <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{report.title}</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed max-w-md">{report.desc}</p>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Formate: {report.format}</span>
             </div>
             <button className="bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};
