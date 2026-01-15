'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface PriceItem {
  id: string
  position: string
  description: string
  unit: string
  priceNet: number
  category: string
  lastUpdated: string
  source: string
}

const MOCK_PRICES: PriceItem[] = [
  { id: '1', position: '01.01.0010', description: 'Gipskartonständerwand, d=100mm, doppelt beplankt, inkl. UW/CW-Profilen', unit: 'm²', priceNet: 52.80, category: 'Trockenbau', lastUpdated: '2026-01-10', source: 'Kalkulation' },
  { id: '2', position: '01.01.0020', description: 'Gipskartonständerwand, d=125mm, doppelt beplankt, Schallschutz', unit: 'm²', priceNet: 68.50, category: 'Trockenbau', lastUpdated: '2026-01-10', source: 'Kalkulation' },
  { id: '3', position: '01.02.0010', description: 'Türzarge Stahl, für Türblatt 875/2125mm', unit: 'Stk', priceNet: 285.00, category: 'Türen', lastUpdated: '2026-01-08', source: 'Lieferant' },
  { id: '4', position: '01.02.0020', description: 'Türblatt Vollspan, 875/2125mm, weiß grundiert', unit: 'Stk', priceNet: 145.00, category: 'Türen', lastUpdated: '2026-01-08', source: 'Lieferant' },
  { id: '5', position: '02.01.0010', description: 'Mineralwolle Dämmung, WLG 035, d=100mm', unit: 'm²', priceNet: 18.90, category: 'Dämmung', lastUpdated: '2026-01-05', source: 'Lieferant' },
  { id: '6', position: '02.01.0020', description: 'Dampfsperre PE-Folie, sd>100m', unit: 'm²', priceNet: 3.20, category: 'Dämmung', lastUpdated: '2026-01-05', source: 'Kalkulation' },
  { id: '7', position: '03.01.0010', description: 'Akustikdecke, Rastermaß 625x625mm, inkl. Unterkonstruktion', unit: 'm²', priceNet: 78.50, category: 'Akustik', lastUpdated: '2025-12-20', source: 'Kalkulation' },
  { id: '8', position: '04.01.0010', description: 'Brandschutzplatte F90, d=25mm', unit: 'm²', priceNet: 42.00, category: 'Brandschutz', lastUpdated: '2025-12-15', source: 'Lieferant' },
]

const TRANSLATIONS = {
  de: {
    title: 'Preisbibliothek',
    subtitle: 'Einheitspreise pflegen und verwalten',
    search: 'Position oder Beschreibung suchen...',
    filter: 'Kategorie',
    all: 'Alle',
    position: 'Position',
    description: 'Beschreibung',
    unit: 'EH',
    price: 'EP (€)',
    category: 'Kategorie',
    updated: 'Aktualisiert',
    source: 'Quelle',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    addNew: 'Neuer Preis',
    totalItems: 'Positionen',
    avgPrice: 'Ø Preis',
    categories: 'Kategorien',
    lastUpdate: 'Letzte Aktualisierung',
    import: 'Import',
    export: 'Export',
  },
  en: {
    title: 'Price Library',
    subtitle: 'Manage and maintain unit prices',
    search: 'Search position or description...',
    filter: 'Category',
    all: 'All',
    position: 'Position',
    description: 'Description',
    unit: 'Unit',
    price: 'UP (€)',
    category: 'Category',
    updated: 'Updated',
    source: 'Source',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    addNew: 'New Price',
    totalItems: 'Items',
    avgPrice: 'Avg. Price',
    categories: 'Categories',
    lastUpdate: 'Last Update',
    import: 'Import',
    export: 'Export',
  }
}

export default function PriceLibraryPage() {
  const [lang, setLang] = useState<Language>('de')
  const [category, setCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [prices, setPrices] = useState<PriceItem[]>(MOCK_PRICES)
  const t = TRANSLATIONS[lang]

  const categories = ['all', ...Array.from(new Set(MOCK_PRICES.map(p => p.category)))]

  const filteredPrices = prices.filter(price => {
    if (category !== 'all' && price.category !== category) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return price.position.toLowerCase().includes(query) ||
             price.description.toLowerCase().includes(query)
    }
    return true
  })

  const handlePriceUpdate = (id: string, newPrice: number) => {
    setPrices(prev => prev.map(p => p.id === id ? { ...p, priceNet: newPrice, lastUpdated: new Date().toISOString().split('T')[0] } : p))
    setEditingId(null)
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
          <div className="flex items-center space-x-1 bg-slate-100 rounded-full p-1">
            <button onClick={() => setLang('de')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'de' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>DE</button>
            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>EN</button>
          </div>
          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">JD</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <Link href="/demo/dashboard" className="text-xs text-blue-600 font-bold hover:underline mb-2 block">← {lang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</Link>
              <h1 className="text-4xl font-black text-slate-900 brand-font italic">{t.title}</h1>
              <p className="text-slate-500 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span>{t.import}</span>
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>{t.export}</span>
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                <span>{t.addNew}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalItems}</p>
              <p className="text-3xl font-black text-slate-900">{prices.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.avgPrice}</p>
              <p className="text-3xl font-black text-emerald-600">€ {(prices.reduce((s, p) => s + p.priceNet, 0) / prices.length).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.categories}</p>
              <p className="text-3xl font-black text-blue-600">{categories.length - 1}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.lastUpdate}</p>
              <p className="text-xl font-black text-slate-600">2026-01-10</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.filter}:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? t.all : cat}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
            </div>
          </div>

          {/* Price Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-28">{t.position}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.description}</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest w-16">{t.unit}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest w-28">{t.price}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-24">{t.category}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-28">{t.updated}</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest w-24">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrices.map(price => (
                  <tr key={price.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-slate-500">{price.position}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-900">{price.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{price.source}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">{price.unit}</td>
                    <td className="px-4 py-3 text-right">
                      {editingId === price.id ? (
                        <input
                          type="number"
                          defaultValue={price.priceNet}
                          onBlur={(e) => handlePriceUpdate(price.id, parseFloat(e.target.value))}
                          onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate(price.id, parseFloat((e.target as HTMLInputElement).value))}
                          className="w-24 text-right text-sm font-bold border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-sm font-bold text-slate-900 cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingId(price.id)}
                        >
                          {price.priceNet.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{price.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{price.lastUpdated}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title={t.edit}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title={t.delete}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
