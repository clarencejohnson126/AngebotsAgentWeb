
import React, { useState, useEffect } from 'react';
import { Language, LVItem, RiskAnalysis } from '../types';
import { TRANSLATIONS } from '../constants';
import { getMockAnalysis } from '../geminiService';

interface Props {
  lang: Language;
  projectId: string;
}

export const ProjectDetail: React.FC<Props> = ({ lang, projectId }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'lv' | 'risks' | 'offer'>('lv');
  const [items, setItems] = useState<LVItem[]>([]);
  const [risks, setRisks] = useState<RiskAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // In a real scenario, this would load from a database
    const mockData = getMockAnalysis();
    setItems(mockData.items);
    setRisks(mockData.risks);
  }, []);

  const handlePriceUpdate = (id: string, price: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, pricePerUnit: price } : item));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * (item.pricePerUnit || 0)), 0);
  };

  return (
    <div className="flex h-[calc(100vh-140px)]">
      {/* Sidebar Tabs */}
      <div className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-900 truncate">Wohnanlage Sonnenhang</h2>
          <p className="text-xs text-slate-500">Projekt ID: {projectId}</p>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('lv')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'lv' ? 'bg-white shadow-sm text-blue-600 border border-slate-200' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span>{t.quantities}</span>
          </button>
          <button 
            onClick={() => setActiveTab('risks')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'risks' ? 'bg-white shadow-sm text-red-600 border border-slate-200' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{t.risks}</span>
            {risks.length > 0 && <span className="ml-auto bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">{risks.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('offer')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'offer' ? 'bg-white shadow-sm text-green-600 border border-slate-200' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            <span>{t.offer}</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col bg-white overflow-hidden">
        {activeTab === 'lv' && (
          <div className="flex-grow flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Leistungsverzeichnis-Extraktion</h3>
              <div className="flex space-x-3">
                <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded font-bold hover:bg-slate-50">Filter</button>
                <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold hover:bg-blue-700">LV hochladen</button>
              </div>
            </div>
            <div className="overflow-auto flex-grow">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-white border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100">Pos.</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100">Beschreibung</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 w-32">Menge</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 w-20">EH</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 w-32">EP (€)</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">GP (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-500 border-r border-slate-50">{item.pos}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-800 font-medium mb-1">{item.description}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold">{item.sourceRef}</span>
                          <span className="text-blue-500 underline cursor-pointer">Quelle anzeigen</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 border-r border-slate-50 text-right font-semibold">{item.quantity.toLocaleString('de-DE')}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 border-r border-slate-50">{item.unit}</td>
                      <td className="px-4 py-3 border-r border-slate-50">
                        <input 
                          type="number" 
                          value={item.pricePerUnit || ''} 
                          onChange={(e) => handlePriceUpdate(item.id, parseFloat(e.target.value))}
                          placeholder="0,00"
                          className="w-full bg-transparent border-none text-right text-sm font-semibold focus:ring-1 focus:ring-blue-400 rounded p-1 transition-shadow"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 font-bold text-right">
                        {(item.quantity * (item.pricePerUnit || 0)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Summe (Netto)</span>
              <span className="text-xl font-black">{calculateTotal().toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="p-8 overflow-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
              <span className="bg-red-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </span>
              <span>Identifizierte Nachtragspotenziale & Risiken</span>
            </h3>
            <div className="space-y-6">
              {risks.map((risk) => (
                <div key={risk.id} className="bg-white border-l-4 border-red-500 shadow-md rounded-r-xl overflow-hidden border border-slate-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded-full mb-2 inline-block">
                          {risk.type}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900">{risk.description}</h4>
                      </div>
                      <button className="text-xs text-blue-600 font-bold hover:underline">Quellvergleich öffnen</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Begründung</p>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{risk.justification}</p>
                        <p className="text-[10px] mt-2 text-slate-400">Quelle: <span className="font-bold">{risk.sourceRef}</span></p>
                      </div>
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-400 uppercase mb-2 tracking-widest">Vorschlag Rückfrage</p>
                        <p className="text-sm italic text-slate-800 leading-relaxed">"{risk.suggestedQuery}"</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded hover:bg-slate-800 transition-colors">In Angebot übernehmen</button>
                      <button className="border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded hover:bg-slate-50 transition-colors">Ignorieren</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'offer' && (
          <div className="p-8 overflow-auto max-w-4xl mx-auto">
             <h3 className="text-xl font-bold text-slate-900 mb-8">Angebotsgenerierung</h3>
             <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-10 mb-8 space-y-6">
               <div className="flex justify-between">
                 <div className="text-xs font-mono text-slate-400">
                   Müller Bau GmbH<br/>
                   Abt. Kalkulation<br/>
                   Musterstraße 12<br/>
                   80331 München
                 </div>
                 <div className="text-right text-xs text-slate-400">
                   Datum: {new Date().toLocaleDateString('de-DE')}
                 </div>
               </div>
               
               <h1 className="text-2xl font-bold text-slate-900">Angebot: {items.length} Positionen Trockenbau - Wohnanlage Sonnenhang</h1>
               
               <p className="text-sm text-slate-700 leading-relaxed">
                 Sehr geehrte Damen und Herren,<br/><br/>
                 vielen Dank für die Zusendung der Ausschreibungsunterlagen. Gerne unterbreiten wir Ihnen folgendes Angebot basierend auf unserer Analyse des Leistungsverzeichnisses und der Planunterlagen.
               </p>

               <div className="border-y border-slate-100 py-4">
                 <div className="flex justify-between items-center font-bold text-slate-900">
                   <span>Angebotssumme (Netto)</span>
                   <span className="text-xl">{calculateTotal().toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                 </div>
               </div>

               <p className="text-[10px] text-slate-400 italic">
                 Hinweis: In unserer Kalkulation wurden Mengenabweichungen im Gewerk Trockenbau zwischen Plan- und Ausschreibungstext berücksichtigt. Details entnehmen Sie dem beigefügten LV-Export.
               </p>
             </div>

             <div className="flex justify-center space-x-4">
               <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-100 hover:bg-green-700 flex items-center space-x-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 <span>Excel (.xlsx) exportieren</span>
               </button>
               <button className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-slate-100 hover:bg-slate-800 flex items-center space-x-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                 <span>PDF generieren</span>
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
