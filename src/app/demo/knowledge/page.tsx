'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface KnowledgeItem {
  id: string
  title: string
  category: 'VOB/B' | 'VOB/C' | 'DIN' | 'Richtlinie' | 'Muster'
  reference: string
  description: string
  lastUpdated: string
}

const MOCK_ITEMS: KnowledgeItem[] = [
  { id: '1', title: 'Allgemeine Vertragsbedingungen für die Ausführung von Bauleistungen', category: 'VOB/B', reference: '§ 1-18', description: 'Vollständiger Text der VOB/B mit allen Paragraphen und Erläuterungen', lastUpdated: '2025-12-01' },
  { id: '2', title: 'Allgemeine Technische Vertragsbedingungen - Trockenbauarbeiten', category: 'VOB/C', reference: 'ATV DIN 18340', description: 'Technische Spezifikationen für Trockenbauarbeiten nach DIN 18340', lastUpdated: '2025-11-15' },
  { id: '3', title: 'Gipskartonplatten - Anforderungen', category: 'DIN', reference: 'DIN EN 520', description: 'Europäische Norm für Gipskartonplatten inkl. Definitionen und Prüfverfahren', lastUpdated: '2025-10-20' },
  { id: '4', title: 'Nachtragskalkulation nach VOB/B', category: 'Richtlinie', reference: '§ 2 Abs. 5, 6', description: 'Anleitungen zur korrekten Berechnung von Nachträgen bei geänderten Leistungen', lastUpdated: '2025-12-10' },
  { id: '5', title: 'Bedenkenanmeldung - Musterformular', category: 'Muster', reference: 'VOB/B § 4 Abs. 3', description: 'Vorlagen für die schriftliche Anmeldung von Bedenken gegen vorgesehene Art der Ausführung', lastUpdated: '2025-09-05' },
  { id: '6', title: 'Abnahmeprotokoll - Musterformular', category: 'Muster', reference: 'VOB/B § 12', description: 'Standardformular für die Dokumentation der förmlichen Abnahme', lastUpdated: '2025-08-22' },
  { id: '7', title: 'Brandschutz im Trockenbau', category: 'DIN', reference: 'DIN 4102', description: 'Brandverhalten von Baustoffen und Bauteilen - Klassifizierungen F30-F90', lastUpdated: '2025-11-30' },
  { id: '8', title: 'Schallschutz im Hochbau', category: 'DIN', reference: 'DIN 4109', description: 'Mindestanforderungen an den Schallschutz und Nachweisverfahren', lastUpdated: '2025-10-15' },
]

const TRANSLATIONS = {
  de: {
    title: 'Wissen',
    subtitle: 'VOB/B Archiv und Regelwerke nachschlagen',
    search: 'Suchen...',
    filter: 'Kategorie',
    all: 'Alle',
    reference: 'Referenz',
    description: 'Beschreibung',
    category: 'Kategorie',
    updated: 'Aktualisiert',
    actions: 'Aktionen',
    view: 'Anzeigen',
    download: 'Download',
    totalItems: 'Dokumente',
    vobItems: 'VOB',
    dinItems: 'DIN',
    templates: 'Vorlagen',
    quickLinks: 'Schnellzugriff',
    recentUpdates: 'Kürzlich aktualisiert',
  },
  en: {
    title: 'Knowledge',
    subtitle: 'Browse VOB/B archive and regulations',
    search: 'Search...',
    filter: 'Category',
    all: 'All',
    reference: 'Reference',
    description: 'Description',
    category: 'Category',
    updated: 'Updated',
    actions: 'Actions',
    view: 'View',
    download: 'Download',
    totalItems: 'Documents',
    vobItems: 'VOB',
    dinItems: 'DIN',
    templates: 'Templates',
    quickLinks: 'Quick Links',
    recentUpdates: 'Recently Updated',
  }
}

export default function KnowledgePage() {
  const [lang, setLang] = useState<Language>('de')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)
  const t = TRANSLATIONS[lang]

  const categories = ['all', 'VOB/B', 'VOB/C', 'DIN', 'Richtlinie', 'Muster']

  const filteredItems = MOCK_ITEMS.filter(item => {
    if (filter !== 'all' && item.category !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return item.title.toLowerCase().includes(query) ||
             item.reference.toLowerCase().includes(query) ||
             item.description.toLowerCase().includes(query)
    }
    return true
  })

  const getCategoryColor = (cat: KnowledgeItem['category']) => {
    switch (cat) {
      case 'VOB/B': return 'bg-blue-100 text-blue-700'
      case 'VOB/C': return 'bg-indigo-100 text-indigo-700'
      case 'DIN': return 'bg-emerald-100 text-emerald-700'
      case 'Richtlinie': return 'bg-amber-100 text-amber-700'
      case 'Muster': return 'bg-purple-100 text-purple-700'
    }
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
          <div className="mb-8">
            <Link href="/demo/dashboard" className="text-xs text-blue-600 font-bold hover:underline mb-2 block">← {lang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</Link>
            <h1 className="text-4xl font-black text-slate-900 brand-font italic">{t.title}</h1>
            <p className="text-slate-500 mt-1">{t.subtitle}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalItems}</p>
              <p className="text-3xl font-black text-slate-900">{MOCK_ITEMS.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.vobItems}</p>
              <p className="text-3xl font-black text-blue-600">{MOCK_ITEMS.filter(i => i.category.includes('VOB')).length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.dinItems}</p>
              <p className="text-3xl font-black text-emerald-600">{MOCK_ITEMS.filter(i => i.category === 'DIN').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.templates}</p>
              <p className="text-3xl font-black text-purple-600">{MOCK_ITEMS.filter(i => i.category === 'Muster').length}</p>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-grow">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.filter}:</span>
                  <div className="flex space-x-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {cat === 'all' ? t.all : cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
              </div>

              {/* Knowledge Items */}
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-colors cursor-pointer ${selectedItem?.id === item.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <span className="text-xs font-mono text-slate-500">{item.reference}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title={t.view}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title={t.download}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">{t.quickLinks}</h3>
                <div className="space-y-2">
                  {['VOB/B Gesamttext', 'Nachtrag § 2 Abs. 5', 'Abnahme § 12', 'Mängel § 13'].map((link, idx) => (
                    <button key={idx} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      {link}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">{t.recentUpdates}</h3>
                <div className="space-y-3">
                  {MOCK_ITEMS.slice(0, 3).map(item => (
                    <div key={item.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.lastUpdated}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
