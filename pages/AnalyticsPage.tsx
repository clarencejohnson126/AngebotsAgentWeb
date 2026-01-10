
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const AnalyticsPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="p-12 max-w-7xl mx-auto space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">{t.analytics}</h1>
        <p className="text-slate-500 font-medium">Betriebswirtschaftliche Auswertung Ihrer Kalkulationsprojekte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Angebotsvolumen (mtl.)', val: '€ 1.240.000', trend: '+12%', color: 'text-blue-600' },
          { label: 'Durchschn. Marge', val: '14,8%', trend: '-0.5%', color: 'text-slate-900' },
          { label: 'Erfolgsquote', val: '22%', trend: '+4%', color: 'text-green-600' },
          { label: 'Identifizierte Nachträge', val: '€ 85.200', trend: 'Stabil', color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">{stat.trend} vs. Vormonat</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold">Margen-Verlauf pro Projekt</h2>
          <div className="flex space-x-2">
            <button className="text-xs font-bold border border-slate-200 px-3 py-1 rounded">Export CSV</button>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between p-10 space-x-4">
          {[40, 70, 45, 90, 65, 80, 50, 85, 95, 75, 60, 82].map((h, i) => (
            <div key={i} className="flex-grow bg-slate-100 rounded-t relative group">
              <div 
                className="absolute bottom-0 w-full bg-blue-600 transition-all group-hover:bg-blue-800" 
                style={{ height: `${h}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
