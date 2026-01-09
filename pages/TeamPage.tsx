
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

export const TeamPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const members = [
    { name: 'Johannes Dörr', role: 'Inhaber / Administrator', status: 'Aktiv', email: 'j.doerr@musterbau.de' },
    { name: 'Sarah Schmidt', role: 'Kalkulatorin', status: 'Aktiv', email: 's.schmidt@musterbau.de' },
    { name: 'Marcus Weber', role: 'Bauleiter', status: 'Abwesend', email: 'm.weber@musterbau.de' },
  ];

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{t.team}</h1>
          <p className="text-slate-500 font-medium">Verwalten Sie Berechtigungen und Zugänge Ihrer Mitarbeiter.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-200">Mitglied einladen</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.team}</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.status}</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-5">
                  <div className="text-sm font-bold text-slate-900">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.email}</div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">{m.role}</span>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[10px] font-bold uppercase ${m.status === 'Aktiv' ? 'text-green-600' : 'text-orange-500'}`}>• {m.status}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-xs font-bold text-blue-600 hover:underline">Bearbeiten</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
