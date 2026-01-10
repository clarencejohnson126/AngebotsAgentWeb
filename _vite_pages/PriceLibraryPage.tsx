
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  lang: Language;
}

export const PriceLibraryPage: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [prices, setPrices] = useState([
    { id: '1', name: 'Gipskartonwand einfach beplankt', unit: 'm²', price: 32.50 },
    { id: '2', name: 'Gipskartonwand doppelt beplankt', unit: 'm²', price: 48.00 },
    { id: '3', name: 'Zementestrich CT-C25-F4', unit: 'm²', price: 18.90 },
    { id: '4', name: 'Trittschalldämmung EPS 20mm', unit: 'm²', price: 4.20 },
    { id: '5', name: 'Stahlzarge Standard 875mm', unit: 'Stk', price: 115.00 },
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t.priceLibrary}</h1>
        <p className="text-slate-500 text-sm italic">Hinterlegen Sie Ihre Standardpreise für eine schnellere Angebotserstellung.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <input 
            type="text" 
            placeholder="Leistung suchen..." 
            className="text-sm border border-slate-200 rounded px-3 py-1.5 w-64 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-blue-700">Position hinzufügen</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              <th className="px-6 py-3">{t.position}</th>
              <th className="px-6 py-3 w-24">{t.unit}</th>
              <th className="px-6 py-3 w-32 text-right">{t.unitPrice} (€)</th>
              <th className="px-6 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {prices.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{p.unit}</td>
                <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right">
                  {p.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-300 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
