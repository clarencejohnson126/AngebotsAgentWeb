'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  target: string
  category: 'project' | 'document' | 'price' | 'invoice' | 'system' | 'user'
  details?: string
}

const MOCK_ENTRIES: AuditEntry[] = [
  { id: '1', timestamp: '2026-01-15 14:32:18', user: 'Johannes Decker', action: 'Preis aktualisiert', target: 'Gipskartonständerwand 100mm', category: 'price', details: '52.80 € → 54.50 €' },
  { id: '2', timestamp: '2026-01-15 14:15:42', user: 'Maria Schmidt', action: 'Dokument hochgeladen', target: 'LV_Sanitär_Entwurf.pdf', category: 'document', details: '2.4 MB' },
  { id: '3', timestamp: '2026-01-15 13:48:05', user: 'Johannes Decker', action: 'Projekt erstellt', target: 'Praxisräume Köln', category: 'project' },
  { id: '4', timestamp: '2026-01-15 11:22:33', user: 'System', action: 'Backup erstellt', target: 'Datenbank', category: 'system', details: 'Automatisches Backup' },
  { id: '5', timestamp: '2026-01-15 10:05:17', user: 'Maria Schmidt', action: 'Rechnung versendet', target: 'RE-2026-0042', category: 'invoice', details: '85.400,00 €' },
  { id: '6', timestamp: '2026-01-14 16:45:29', user: 'Johannes Decker', action: 'Angebot exportiert', target: 'Wohnanlage Sonnenhang', category: 'project', details: 'PDF + Excel' },
  { id: '7', timestamp: '2026-01-14 15:12:08', user: 'Thomas Müller', action: 'Login', target: 'Benutzer-Session', category: 'user', details: 'IP: 192.168.1.105' },
  { id: '8', timestamp: '2026-01-14 14:30:55', user: 'Maria Schmidt', action: 'Material bestellt', target: 'CW-Profile 75/50', category: 'price', details: '500 Stück' },
  { id: '9', timestamp: '2026-01-14 11:20:44', user: 'System', action: 'OCR abgeschlossen', target: 'Grundriss_OG1_OG2.pdf', category: 'document', details: '28 Positionen extrahiert' },
  { id: '10', timestamp: '2026-01-14 09:15:22', user: 'Johannes Decker', action: 'Nachtrag erstellt', target: 'Bürogebäude München', category: 'project', details: 'Mengenabweichung Wandflächen' },
]

const TRANSLATIONS = {
  de: {
    title: 'Audit-Log',
    subtitle: 'Alle Aktivitäten und Änderungen nachverfolgen',
    search: 'Aktivität suchen...',
    filter: 'Kategorie',
    all: 'Alle',
    timestamp: 'Zeitstempel',
    user: 'Benutzer',
    action: 'Aktion',
    target: 'Objekt',
    category: 'Kategorie',
    details: 'Details',
    project: 'Projekt',
    document: 'Dokument',
    price: 'Preis/Material',
    invoice: 'Rechnung',
    system: 'System',
    userCat: 'Benutzer',
    totalEntries: 'Einträge',
    today: 'Heute',
    thisWeek: 'Diese Woche',
    users: 'Aktive Nutzer',
    export: 'Exportieren',
  },
  en: {
    title: 'Audit Log',
    subtitle: 'Track all activities and changes',
    search: 'Search activity...',
    filter: 'Category',
    all: 'All',
    timestamp: 'Timestamp',
    user: 'User',
    action: 'Action',
    target: 'Target',
    category: 'Category',
    details: 'Details',
    project: 'Project',
    document: 'Document',
    price: 'Price/Material',
    invoice: 'Invoice',
    system: 'System',
    userCat: 'User',
    totalEntries: 'Entries',
    today: 'Today',
    thisWeek: 'This Week',
    users: 'Active Users',
    export: 'Export',
  }
}

export default function AuditPage() {
  const [lang, setLang] = useState<Language>('de')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const t = TRANSLATIONS[lang]

  const categories = [
    { key: 'all', label: t.all },
    { key: 'project', label: t.project },
    { key: 'document', label: t.document },
    { key: 'price', label: t.price },
    { key: 'invoice', label: t.invoice },
    { key: 'system', label: t.system },
    { key: 'user', label: t.userCat },
  ]

  const filteredEntries = MOCK_ENTRIES.filter(entry => {
    if (filter !== 'all' && entry.category !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return entry.action.toLowerCase().includes(query) ||
             entry.target.toLowerCase().includes(query) ||
             entry.user.toLowerCase().includes(query)
    }
    return true
  })

  const getCategoryColor = (cat: AuditEntry['category']) => {
    switch (cat) {
      case 'project': return 'bg-blue-100 text-blue-700'
      case 'document': return 'bg-purple-100 text-purple-700'
      case 'price': return 'bg-emerald-100 text-emerald-700'
      case 'invoice': return 'bg-amber-100 text-amber-700'
      case 'system': return 'bg-slate-100 text-slate-600'
      case 'user': return 'bg-rose-100 text-rose-700'
    }
  }

  const getCategoryLabel = (cat: AuditEntry['category']) => {
    switch (cat) {
      case 'project': return t.project
      case 'document': return t.document
      case 'price': return t.price
      case 'invoice': return t.invoice
      case 'system': return t.system
      case 'user': return t.userCat
    }
  }

  const todayCount = MOCK_ENTRIES.filter(e => e.timestamp.includes('2026-01-15')).length
  const uniqueUsers = new Set(MOCK_ENTRIES.filter(e => e.user !== 'System').map(e => e.user)).size

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
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>{t.export}</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalEntries}</p>
              <p className="text-3xl font-black text-slate-900">{MOCK_ENTRIES.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.today}</p>
              <p className="text-3xl font-black text-blue-600">{todayCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.thisWeek}</p>
              <p className="text-3xl font-black text-emerald-600">{MOCK_ENTRIES.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.users}</p>
              <p className="text-3xl font-black text-indigo-600">{uniqueUsers}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.filter}:</span>
              <div className="flex space-x-2">
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setFilter(cat.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === cat.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {cat.label}
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

          {/* Audit Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.timestamp}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.user}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.action}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.target}</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.category}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.details}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{entry.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${entry.user === 'System' ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                        {entry.user}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{entry.action}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{entry.target}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getCategoryColor(entry.category)}`}>
                        {getCategoryLabel(entry.category)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{entry.details || '-'}</td>
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
