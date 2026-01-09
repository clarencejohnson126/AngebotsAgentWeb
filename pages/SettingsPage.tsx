
import React, { useState } from 'react';
import { Language, Gewerk } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  lang: Language;
}

export const SettingsPage: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [profile, setProfile] = useState({
    companyName: 'Musterbau Trockenbau GmbH',
    gewerk: Gewerk.Trockenbau,
    margin: 15,
    email: 'kalkulation@musterbau.de',
    address: 'Handwerkerstraße 4, 12345 Berlin'
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">{t.settings}</h1>

      <div className="space-y-8">
        {/* Company Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">{t.companyProfile}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Firmenname</label>
                <input 
                  type="text" 
                  value={profile.companyName}
                  onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                  className="w-full text-sm border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gewerk</label>
                <select 
                  value={profile.gewerk}
                  onChange={(e) => setProfile({...profile, gewerk: e.target.value as Gewerk})}
                  className="w-full text-sm border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                >
                  {Object.values(Gewerk).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">E-Mail für Angebote</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="w-full text-sm border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Anschrift</label>
              <textarea 
                rows={2}
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                className="w-full text-sm border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Calculation Logic */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">{t.calculationLogic}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">{t.standardMargin}</p>
                <p className="text-xs text-slate-500">Dieser Aufschlag wird standardmäßig auf alle EK-Preise angewendet.</p>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  value={profile.margin}
                  onChange={(e) => setProfile({...profile, margin: parseInt(e.target.value)})}
                  className="w-20 text-sm font-bold border border-slate-200 rounded p-2 text-right focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-900">Abbrechen</button>
          <button className="bg-slate-900 text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
