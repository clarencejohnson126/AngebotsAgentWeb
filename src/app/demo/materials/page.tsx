'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface Material {
  id: string
  articleNr: string
  name: string
  category: string
  supplier: string
  unit: string
  priceNet: number
  stock: number
  minStock: number
  leadTime: string
}

const MOCK_MATERIALS: Material[] = [
  { id: '1', articleNr: 'GK-12.5', name: 'Gipskartonplatte 12,5mm, 2500x1250mm', category: 'Gipskarton', supplier: 'Knauf', unit: 'm²', priceNet: 4.85, stock: 2400, minStock: 500, leadTime: '2-3 Tage' },
  { id: '2', articleNr: 'GK-15', name: 'Gipskartonplatte 15mm, 2500x1250mm', category: 'Gipskarton', supplier: 'Knauf', unit: 'm²', priceNet: 5.20, stock: 1800, minStock: 400, leadTime: '2-3 Tage' },
  { id: '3', articleNr: 'CW-75', name: 'CW-Profil 75/50, 0.6mm, 4000mm', category: 'Profile', supplier: 'Protektor', unit: 'Stk', priceNet: 3.45, stock: 850, minStock: 200, leadTime: '1-2 Tage' },
  { id: '4', articleNr: 'UW-75', name: 'UW-Profil 75/40, 0.6mm, 4000mm', category: 'Profile', supplier: 'Protektor', unit: 'Stk', priceNet: 2.90, stock: 920, minStock: 200, leadTime: '1-2 Tage' },
  { id: '5', articleNr: 'MW-035', name: 'Mineralwolle WLG 035, 100mm', category: 'Dämmung', supplier: 'Rockwool', unit: 'm²', priceNet: 8.50, stock: 1200, minStock: 300, leadTime: '3-4 Tage' },
  { id: '6', articleNr: 'SB-3.9', name: 'Schnellbauschrauben 3,9x25mm', category: 'Befestigung', supplier: 'Würth', unit: '1000 Stk', priceNet: 18.90, stock: 45, minStock: 20, leadTime: '1 Tag' },
  { id: '7', articleNr: 'FG-BAND', name: 'Fugendeckstreifen 50mm x 90m', category: 'Zubehör', supplier: 'Knauf', unit: 'Rolle', priceNet: 12.50, stock: 85, minStock: 30, leadTime: '2-3 Tage' },
  { id: '8', articleNr: 'SP-UNI', name: 'Uniflott Spachtelmasse 25kg', category: 'Zubehör', supplier: 'Knauf', unit: 'Sack', priceNet: 24.80, stock: 120, minStock: 40, leadTime: '2-3 Tage' },
]

const TRANSLATIONS = {
  de: {
    title: 'Materialien',
    subtitle: 'Materialstammdaten und Lagerbestände verwalten',
    search: 'Artikel oder Lieferant suchen...',
    filter: 'Kategorie',
    all: 'Alle',
    articleNr: 'Art.-Nr.',
    name: 'Bezeichnung',
    supplier: 'Lieferant',
    unit: 'EH',
    price: 'EK (€)',
    stock: 'Bestand',
    minStock: 'Min.',
    leadTime: 'Lieferzeit',
    actions: 'Aktionen',
    order: 'Bestellen',
    edit: 'Bearbeiten',
    lowStock: 'Niedriger Bestand',
    totalValue: 'Lagerwert',
    suppliers: 'Lieferanten',
    items: 'Artikel',
    addMaterial: 'Neues Material',
  },
  en: {
    title: 'Materials',
    subtitle: 'Manage material master data and inventory',
    search: 'Search article or supplier...',
    filter: 'Category',
    all: 'All',
    articleNr: 'Art. No.',
    name: 'Description',
    supplier: 'Supplier',
    unit: 'Unit',
    price: 'Cost (€)',
    stock: 'Stock',
    minStock: 'Min.',
    leadTime: 'Lead Time',
    actions: 'Actions',
    order: 'Order',
    edit: 'Edit',
    lowStock: 'Low Stock',
    totalValue: 'Inventory Value',
    suppliers: 'Suppliers',
    items: 'Items',
    addMaterial: 'New Material',
  }
}

export default function MaterialsPage() {
  const [lang, setLang] = useState<Language>('de')
  const [category, setCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const t = TRANSLATIONS[lang]

  const categories = ['all', ...Array.from(new Set(MOCK_MATERIALS.map(m => m.category)))]

  const filteredMaterials = MOCK_MATERIALS.filter(mat => {
    if (category !== 'all' && mat.category !== category) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return mat.articleNr.toLowerCase().includes(query) ||
             mat.name.toLowerCase().includes(query) ||
             mat.supplier.toLowerCase().includes(query)
    }
    return true
  })

  const lowStockItems = MOCK_MATERIALS.filter(m => m.stock <= m.minStock * 1.2)
  const totalValue = MOCK_MATERIALS.reduce((s, m) => s + (m.priceNet * m.stock), 0)
  const uniqueSuppliers = new Set(MOCK_MATERIALS.map(m => m.supplier)).size

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
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>{t.addMaterial}</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.items}</p>
              <p className="text-3xl font-black text-slate-900">{MOCK_MATERIALS.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalValue}</p>
              <p className="text-2xl font-black text-emerald-600">€ {totalValue.toLocaleString('de-DE', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.lowStock}</p>
              <p className="text-3xl font-black text-amber-600">{lowStockItems.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.suppliers}</p>
              <p className="text-3xl font-black text-blue-600">{uniqueSuppliers}</p>
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

          {/* Materials Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.articleNr}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.name}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.supplier}</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.unit}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.price}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.stock}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.leadTime}</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map(mat => {
                  const isLowStock = mat.stock <= mat.minStock * 1.2
                  return (
                    <tr key={mat.id} className={`hover:bg-slate-50 transition-colors ${isLowStock ? 'bg-amber-50/50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-slate-700">{mat.articleNr}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-900">{mat.name}</p>
                        <p className="text-xs text-slate-400">{mat.category}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{mat.supplier}</td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600">{mat.unit}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">{mat.priceNet.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold ${isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {mat.stock.toLocaleString('de-DE')}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/ {mat.minStock}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{mat.leadTime}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          {isLowStock && (
                            <button className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded hover:bg-amber-600 transition-colors">
                              {t.order}
                            </button>
                          )}
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title={t.edit}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
