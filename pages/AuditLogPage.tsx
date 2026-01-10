
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const AuditLogPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const logs = [
    { user: 'S. Schmidt', action: 'LV-Extraktion korrigiert', project: 'Wohnanlage Sonnenhang', time: 'Vor 12 Min.' },
    { user: 'System (AI)', action: 'Nachtragspotenzial identifiziert', project: 'Wohnanlage Sonnenhang', time: 'Vor 45 Min.' },
    { user: 'J. Dörr', action: 'Preis-Bibliothek aktualisiert', project: 'Global', time: 'Heute, 09:12' },
    { user: 'S. Schmidt', action: 'Angebot exportiert (Excel)', project: 'Bürokomplex CityCore', time: 'Gestern, 16:45' },
  ];

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-8 mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-2">{t.audit}</h1>
        <p className="text-slate-500 font-medium">Vollständige Transparenz über alle Kalkulationsschritte.</p>
      </div>

      <div className="space-y-4">
        {logs.map((log, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-lg flex justify-between items-center group hover:border-slate-400 transition-colors">
            <div className="flex space-x-6 items-center">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div>
                <p className="text-sm font-bold text-slate-900">{log.action}</p>
                <p className="text-xs text-slate-400">Durch {log.user} • Projekt: {log.project}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
