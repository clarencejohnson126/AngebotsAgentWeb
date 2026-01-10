
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const AICustomPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.aiCustom}</h1>
        <p className="text-slate-500 font-medium italic leading-relaxed">
          Kalibrieren Sie die KI auf Ihre spezifischen Leistungsbeschreibungen und historischen Kalkulationsdaten.
        </p>
      </div>

      <div className="space-y-6">
         <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-black mb-6 italic">Fachbegriffs-Glossar</h2>
            <div className="grid md:grid-cols-2 gap-4">
               {['Akustiksegel-Montage', 'F30-Brandschutz', 'Null-Schwelle-Estrich'].map((word, i) => (
                 <div key={i} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-sm font-bold">{word}</span>
                    <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Gelernt</span>
                 </div>
               ))}
            </div>
            <button className="mt-8 text-blue-400 text-xs font-black uppercase tracking-widest hover:underline">+ Neuen Begriff hinzufügen</button>
         </div>

         <div className="bg-white border border-slate-200 p-10 rounded-3xl">
            <h2 className="text-xl font-bold mb-4 italic">Historischer Daten-Upload</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
               Laden Sie abgeschlossene Projekte hoch (LV + Schlussrechnung). Die KI lernt daraus, wo typischerweise Nachträge entstehen, um diese in Zukunft früher zu finden.
            </p>
            <div className="border-2 border-dashed border-slate-100 p-20 text-center rounded-2xl group hover:border-blue-400 transition-all cursor-pointer">
               <p className="text-slate-300 font-black italic group-hover:text-blue-600 transition-colors">Drag & Drop Archiv-ZIP (z.B. GAEB XML)</p>
            </div>
         </div>
      </div>
    </div>
  );
};
