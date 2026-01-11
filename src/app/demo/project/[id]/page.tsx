'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface LVItem {
  id: string
  pos: string
  description: string
  quantity: number
  unit: string
  sourceRef: string
  pricePerUnit?: number
  status: 'extracted' | 'measured' | 'confirmed'
}

interface RiskAnalysis {
  id: string
  type: 'QuantityMismatch' | 'MissingDetail' | 'Contradiction'
  description: string
  justification: string
  sourceRef: string
  suggestedQuery: string
}

interface Room {
  id: string
  roomNumber: string
  name: string
  category: string
  area: number
  factor: number
  counted: number
  page: number
  sourceText: string
}

// Mock data
const MOCK_ITEMS: LVItem[] = [
  { id: '1', pos: '01.01.0010', description: 'Gipskartonständerwand, d=100mm, doppelt beplankt', quantity: 450.50, unit: 'm²', sourceRef: 'LV S. 14', status: 'extracted' },
  { id: '2', pos: '01.01.0020', description: 'Gipskartonständerwand, d=125mm, doppelt beplankt', quantity: 120.00, unit: 'm²', sourceRef: 'LV S. 16', status: 'extracted' },
  { id: '3', pos: '01.02.0010', description: 'Türzarge Stahl, für Türblatt 875/2125mm', quantity: 12, unit: 'Stk', sourceRef: 'LV S. 18', status: 'extracted' }
]

const MOCK_RISKS: RiskAnalysis[] = [
  {
    id: 'r1',
    type: 'QuantityMismatch',
    description: 'Mengenabweichung Wandflächen',
    justification: 'In Plan Grundriss OG1 sind 480m² Wandfläche gemessen, LV weist nur 450.5m² aus.',
    sourceRef: 'Plan 01-OG, LV S. 14',
    suggestedQuery: 'Wir haben im Plan 01-OG ca. 480m² Wandfläche ermittelt. Können Sie die LV-Menge von 450,5m² bestätigen?'
  }
]

const MOCK_ROOMS: Room[] = [
  { id: '1', roomNumber: 'B.00.2.002', name: 'Lobby', category: 'Circulation', area: 176.99, factor: 1.0, counted: 176.99, page: 0, sourceText: 'NRF: 176.99' },
  { id: '2', roomNumber: 'B.00.1.007', name: 'WC Vorraum', category: 'Circulation', area: 3.17, factor: 1.0, counted: 3.17, page: 0, sourceText: 'NRF: 3.17' },
  { id: '3', roomNumber: 'B.00.1.002', name: 'Flur', category: 'Circulation', area: 21.69, factor: 1.0, counted: 21.69, page: 0, sourceText: 'NRF: 21.69' },
  { id: '10', roomNumber: 'B.00.2.004', name: 'Back Office', category: 'Office', area: 19.11, factor: 1.0, counted: 19.11, page: 0, sourceText: 'NRF: 19.11' },
  { id: '11', roomNumber: 'B.00.1.018', name: 'Nutzungseinheit', category: 'Office', area: 336.57, factor: 1.0, counted: 336.57, page: 0, sourceText: 'NRF: 336.57' },
  { id: '12', roomNumber: 'B.00.1.019', name: 'Nutzungseinheit', category: 'Office', area: 149.90, factor: 1.0, counted: 149.90, page: 0, sourceText: 'NRF: 149.90' },
  { id: '15', roomNumber: 'B.00.1.008', name: 'WC H', category: 'Sanitary', area: 5.70, factor: 1.0, counted: 5.70, page: 0, sourceText: 'NRF: 5.70' },
  { id: '17', roomNumber: 'B.00.3.001', name: 'Lager', category: 'Storage', area: 8.90, factor: 1.0, counted: 8.90, page: 0, sourceText: 'NRF: 8.90' },
  { id: '19', roomNumber: 'B.00.2.009', name: 'Elektro', category: 'Technical', area: 4.32, factor: 1.0, counted: 4.32, page: 0, sourceText: 'NRF: 4.32' },
  { id: '21', roomNumber: 'B.01.1.001', name: 'Büro', category: 'Office', area: 45.22, factor: 1.0, counted: 45.22, page: 1, sourceText: 'NRF: 45.22' },
  { id: '28', roomNumber: 'B.02.1.001', name: 'Büro', category: 'Office', area: 48.75, factor: 1.0, counted: 48.75, page: 2, sourceText: 'NRF: 48.75' },
  { id: '43', roomNumber: 'B.DG.1.001', name: 'Dachraum', category: 'Other', area: 125.50, factor: 0.5, counted: 62.75, page: 4, sourceText: 'NRF: 125.50' },
]

const TRANSLATIONS = {
  de: {
    quantities: 'Massenermittlung',
    risks: 'Nachtragspotenziale',
    offer: 'Angebot erstellen',
    examples: 'Beispiele',
  },
  en: {
    quantities: 'Quantity Takeoff',
    risks: 'Change Potential',
    offer: 'Generate Offer',
    examples: 'Examples',
  }
}

export default function DemoProjectDetail({ params }: { params: { id: string } }) {
  const [lang, setLang] = useState<Language>('de')
  const [activeTab, setActiveTab] = useState<'lv' | 'risks' | 'offer' | 'grundriss'>('lv')
  const [items, setItems] = useState<LVItem[]>(MOCK_ITEMS)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(MOCK_ROOMS[0])
  const [roomFilter, setRoomFilter] = useState<string>('All Categories')
  const [sortField, setSortField] = useState<keyof Room | null>('roomNumber')
  const [sortAsc, setSortAsc] = useState(true)

  const t = TRANSLATIONS[lang]

  // Calculate totals for Grundriss
  const totalArea = MOCK_ROOMS.reduce((sum, r) => sum + r.area, 0)
  const totalCounted = MOCK_ROOMS.reduce((sum, r) => sum + r.counted, 0)

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(MOCK_ROOMS.map(r => r.category)))
    return ['All Categories', ...cats]
  }, [])

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    let rooms = [...MOCK_ROOMS]
    if (roomFilter !== 'All Categories') {
      rooms = rooms.filter(r => r.category === roomFilter)
    }
    if (sortField) {
      rooms.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortAsc ? aVal - bVal : bVal - aVal
        }
        return 0
      })
    }
    return rooms
  }, [roomFilter, sortField, sortAsc])

  const handleSort = (field: keyof Room) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const getSortIndicator = (field: keyof Room) => {
    if (sortField !== field) return ''
    return sortAsc ? ' ↑' : ' ↓'
  }

  const handlePriceUpdate = (id: string, price: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, pricePerUnit: price } : item))
  }

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * (item.pricePerUnit || 0)), 0)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 brand-font">
            Angebots<span className="text-blue-700 italic">Agent</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setLang('de')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'de' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              DE
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
          </div>
          <Link href="/demo/support" className="p-2 text-slate-400 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </Link>
          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">JD</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200 bg-white">
            <Link href="/demo/dashboard" className="text-xs text-blue-600 font-bold hover:underline mb-2 block">← Zurück</Link>
            <h2 className="font-bold text-slate-900 truncate">Wohnanlage Sonnenhang</h2>
            <p className="text-xs text-slate-500">Projekt ID: {params.id}</p>
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
              {MOCK_RISKS.length > 0 && <span className="ml-auto bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">{MOCK_RISKS.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('offer')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'offer' ? 'bg-white shadow-sm text-green-600 border border-slate-200' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              <span>{t.offer}</span>
            </button>
            <button
              onClick={() => setActiveTab('grundriss')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'grundriss' ? 'bg-white shadow-sm text-emerald-600 border border-slate-200' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              <span>{lang === 'de' ? 'Grundriss' : 'Floor Plan'}</span>
              <span className="ml-auto bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full">{MOCK_ROOMS.length}</span>
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
                {MOCK_RISKS.map((risk) => (
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
                          <p className="text-sm italic text-slate-800 leading-relaxed">&quot;{risk.suggestedQuery}&quot;</p>
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

          {activeTab === 'grundriss' && (
            <div className="flex-grow flex flex-col bg-slate-950 text-white">
              {/* Progress Steps Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm">✓</div>
                  <span className="text-sm font-bold text-slate-300 uppercase">{lang === 'de' ? 'Upload' : 'Upload'}</span>
                  <div className="w-8 h-0.5 bg-emerald-600" />
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm">✓</div>
                  <span className="text-sm font-bold text-slate-300 uppercase">{lang === 'de' ? 'Verarbeitung' : 'Processing'}</span>
                  <div className="w-8 h-0.5 bg-emerald-600" />
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-slate-900 font-black text-sm">✓</div>
                  <span className="text-sm font-bold text-emerald-400 uppercase">{lang === 'de' ? 'Ergebnisse' : 'Results'}</span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="p-6 grid grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{lang === 'de' ? 'Räume' : 'Rooms'}</p>
                  <p className="text-3xl font-black">{MOCK_ROOMS.length}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{lang === 'de' ? 'Gesamtfläche' : 'Total Area'}</p>
                  <p className="text-3xl font-black">{totalArea.toLocaleString('de-DE')}<span className="text-lg">m²</span></p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{lang === 'de' ? 'Anrechenbar' : 'Counted Area'}</p>
                  <p className="text-3xl font-black text-emerald-400">{totalCounted.toLocaleString('de-DE')}<span className="text-lg">m²</span></p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{lang === 'de' ? 'Baustil' : 'Blueprint Style'}</p>
                  <p className="text-sm font-bold">Bürogebäude (LeiQ)</p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="flex-grow flex overflow-hidden">
                {/* Left: Filter and Table */}
                <div className="flex-grow flex flex-col p-6 overflow-hidden">
                  {/* Filter */}
                  <div className="mb-4 flex items-center space-x-4">
                    <span className="text-slate-400 text-sm uppercase tracking-widest">{lang === 'de' ? 'Filter:' : 'Filter:'}</span>
                    <select
                      value={roomFilter}
                      onChange={(e) => setRoomFilter(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white font-bold text-sm"
                    >
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <span className="text-slate-500 text-sm ml-auto">{filteredRooms.length} {lang === 'de' ? 'Räume' : 'rooms'}</span>
                  </div>

                  {/* Table */}
                  <div className="flex-grow bg-slate-900 rounded-lg border border-slate-700 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                        <tr>
                          <th onClick={() => handleSort('roomNumber')} className="px-4 py-3 text-left text-slate-300 font-bold uppercase text-xs tracking-widest cursor-pointer hover:text-emerald-400">
                            Room{getSortIndicator('roomNumber')}
                          </th>
                          <th onClick={() => handleSort('name')} className="px-4 py-3 text-left text-slate-300 font-bold uppercase text-xs tracking-widest cursor-pointer hover:text-emerald-400">
                            Name{getSortIndicator('name')}
                          </th>
                          <th onClick={() => handleSort('category')} className="px-4 py-3 text-left text-slate-300 font-bold uppercase text-xs tracking-widest cursor-pointer hover:text-emerald-400">
                            Category{getSortIndicator('category')}
                          </th>
                          <th onClick={() => handleSort('area')} className="px-4 py-3 text-right text-slate-300 font-bold uppercase text-xs tracking-widest cursor-pointer hover:text-emerald-400">
                            Area{getSortIndicator('area')}
                          </th>
                          <th onClick={() => handleSort('factor')} className="px-4 py-3 text-right text-slate-300 font-bold uppercase text-xs tracking-widest cursor-pointer hover:text-emerald-400">
                            Factor{getSortIndicator('factor')}
                          </th>
                          <th onClick={() => handleSort('counted')} className="px-4 py-3 text-right text-slate-300 font-bold uppercase text-xs tracking-widest cursor-pointer hover:text-emerald-400">
                            Counted{getSortIndicator('counted')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRooms.map((room) => (
                          <tr
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className={`border-b border-slate-700 cursor-pointer transition-colors ${
                              selectedRoom?.id === room.id ? 'bg-emerald-500/10 hover:bg-emerald-500/20' : 'hover:bg-slate-800/50'
                            }`}
                          >
                            <td className="px-4 py-3 font-bold text-emerald-400">{room.roomNumber}</td>
                            <td className="px-4 py-3">{room.name}</td>
                            <td className="px-4 py-3 text-slate-400">{room.category}</td>
                            <td className="px-4 py-3 text-right text-slate-300">{room.area.toLocaleString('de-DE', { maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-right text-slate-300">{(room.factor * 100).toFixed(0)}%</td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-bold">{room.counted.toLocaleString('de-DE', { maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Audit Trail */}
                {selectedRoom && (
                  <div className="w-72 bg-slate-800 border-l border-slate-700 p-6 overflow-auto">
                    <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-6">Audit Trail</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{lang === 'de' ? 'Raumnummer' : 'Room Number'}</p>
                        <p className="text-lg font-bold text-emerald-400">{selectedRoom.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{lang === 'de' ? 'Raumname' : 'Room Name'}</p>
                        <p className="font-bold">{selectedRoom.name}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{lang === 'de' ? 'Kategorie' : 'Category'}</p>
                        <p className="font-bold">{selectedRoom.category}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{lang === 'de' ? 'Fläche' : 'Area'}</p>
                        <p className="text-2xl font-black">{selectedRoom.area.toLocaleString('de-DE', { maximumFractionDigits: 2 })} m²</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{lang === 'de' ? 'Extraktionsmuster' : 'Extraction Pattern'}</p>
                        <p className="font-mono text-sm bg-slate-900 p-3 rounded text-emerald-400">{selectedRoom.sourceText}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{lang === 'de' ? 'Seite' : 'Page'}</p>
                        <p className="font-bold">{selectedRoom.page}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
