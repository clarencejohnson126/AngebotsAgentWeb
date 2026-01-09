
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const FleetPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black text-slate-900 mb-2 brand-font italic">{t.fleet}</h1>
      <p className="text-slate-500 font-medium mb-12 border-b border-slate-200 pb-8">Inventarisierung von Maschinen, Werkzeugen und Fahrzeugen.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: 'Putzmaschine PFT G4', id: 'EQ-402', loc: 'Baustelle Sonnenhang', status: 'In Betrieb' },
          { name: 'VW Transporter T6', id: 'B-MA 1234', loc: 'Lager Berlin', status: 'Verfügbar' },
          { name: 'Fahrbares Gerüst 12m', id: 'SCAF-99', loc: 'Klinikum Nord', status: 'In Betrieb' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-slate-100 flex items-center justify-center font-black text-slate-300">FOTO</div>
            <div className="p-6">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{item.id}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-4 italic">{item.name}</h3>
              <div className="flex justify-between text-xs font-medium text-slate-500 border-t border-slate-50 pt-4">
                 <span>{item.loc}</span>
                 <span className="text-green-600">{item.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
