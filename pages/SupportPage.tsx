
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const SupportPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2">{t.support}</h1>
        <p className="text-slate-500 font-medium">Wir helfen Ihnen bei technischen Fragen zur Plattform.</p>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-12 text-center shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 italic">Persönlicher Kontakt</h2>
        <p className="text-slate-400 mb-10 max-w-md mx-auto">Sprechen Sie direkt mit unseren Bau-IT Experten. Keine Warteschleife.</p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
           <div className="text-left">
             <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Telefon</p>
             <p className="text-lg font-black">+49 (0) 30 1234-567</p>
           </div>
           <div className="text-left">
             <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">E-Mail</p>
             <p className="text-lg font-black">support@angebotsagent.de</p>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 border border-slate-200 rounded-xl">
           <h3 className="font-bold mb-2">Tutorial: LV-Import</h3>
           <p className="text-sm text-slate-500 mb-4">So optimieren Sie PDF-Dokumente für die KI-gestützte Extraktion.</p>
           <button className="text-blue-600 text-xs font-bold hover:underline">Video ansehen →</button>
        </div>
        <div className="p-6 border border-slate-200 rounded-xl">
           <h3 className="font-bold mb-2">Export-Vorlagen</h3>
           <p className="text-sm text-slate-500 mb-4">Passen Sie das Excel-Design an Ihre Firmenvorgaben an.</p>
           <button className="text-blue-600 text-xs font-bold hover:underline">Dokumentation →</button>
        </div>
      </div>
    </div>
  );
};
