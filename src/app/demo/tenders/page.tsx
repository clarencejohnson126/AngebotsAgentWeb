'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface Tender {
  id: string
  title: string
  client: string
  location: string
  deadline: string
  budget: string
  category: string
  status: 'open' | 'closing' | 'closed'
  matchScore: number
  trades: string[]
}

const MOCK_TENDERS: Tender[] = [
  { id: '1', title: 'Neubau Bürokomplex Frankfurt', client: 'Immobilien AG', location: 'Frankfurt', deadline: '2026-02-15', budget: '2.4 Mio €', category: 'Neubau', status: 'open', matchScore: 94, trades: ['Trockenbau', 'Malerarbeiten'] },
  { id: '2', title: 'Sanierung Mehrfamilienhaus', client: 'WohnBau GmbH', location: 'München', deadline: '2026-01-28', budget: '850.000 €', category: 'Sanierung', status: 'closing', matchScore: 87, trades: ['Trockenbau', 'Dämmung'] },
  { id: '3', title: 'Erweiterung Schulkomplex', client: 'Stadt Stuttgart', location: 'Stuttgart', deadline: '2026-03-01', budget: '1.8 Mio €', category: 'Neubau', status: 'open', matchScore: 82, trades: ['Trockenbau', 'Akustik'] },
  { id: '4', title: 'Hotelumbau Innenstadt', client: 'Hospitality Group', location: 'Berlin', deadline: '2026-02-20', budget: '3.2 Mio €', category: 'Umbau', status: 'open', matchScore: 78, trades: ['Trockenbau', 'Brandschutz'] },
  { id: '5', title: 'Lagerhalle Logistikzentrum', client: 'Logistik Plus', location: 'Hamburg', deadline: '2026-01-20', budget: '1.1 Mio €', category: 'Neubau', status: 'closed', matchScore: 71, trades: ['Trockenbau'] },
  { id: '6', title: 'Praxisräume Ärztehaus', client: 'Medizin Immobilien', location: 'Köln', deadline: '2026-02-28', budget: '420.000 €', category: 'Umbau', status: 'open', matchScore: 89, trades: ['Trockenbau', 'Brandschutz', 'Akustik'] },
]

const TRANSLATIONS = {
  de: {
    title: 'Ausschreibungs-Pool',
    subtitle: 'Aktuelle Ausschreibungen durchsuchen und analysieren',
    filter: 'Filter',
    all: 'Alle',
    search: 'Projekt, Ort oder Auftraggeber suchen...',
    project: 'Projekt',
    client: 'Auftraggeber',
    location: 'Ort',
    deadline: 'Frist',
    budget: 'Budget',
    status: 'Status',
    match: 'Match',
    actions: 'Aktionen',
    open: 'Offen',
    closing: 'Bald endend',
    closed: 'Geschlossen',
    analyze: 'Analysieren',
    save: 'Speichern',
    newTenders: 'Neue Ausschreibungen',
    highMatch: 'Hohe Übereinstimmung',
    closingSoon: 'Bald endend',
    totalValue: 'Gesamtvolumen',
  },
  en: {
    title: 'Tender Pool',
    subtitle: 'Browse and analyze current tenders',
    filter: 'Filter',
    all: 'All',
    search: 'Search project, location or client...',
    project: 'Project',
    client: 'Client',
    location: 'Location',
    deadline: 'Deadline',
    budget: 'Budget',
    status: 'Status',
    match: 'Match',
    actions: 'Actions',
    open: 'Open',
    closing: 'Closing Soon',
    closed: 'Closed',
    analyze: 'Analyze',
    save: 'Save',
    newTenders: 'New Tenders',
    highMatch: 'High Match',
    closingSoon: 'Closing Soon',
    totalValue: 'Total Value',
  }
}

export default function TendersPage() {
  const [lang, setLang] = useState<Language>('de')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const t = TRANSLATIONS[lang]

  const filteredTenders = MOCK_TENDERS.filter(tender => {
    if (filter !== 'all' && tender.status !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return tender.title.toLowerCase().includes(query) ||
             tender.client.toLowerCase().includes(query) ||
             tender.location.toLowerCase().includes(query)
    }
    return true
  })

  const getStatusColor = (status: Tender['status']) => {
    switch (status) {
      case 'open': return 'bg-emerald-100 text-emerald-700'
      case 'closing': return 'bg-amber-100 text-amber-700'
      case 'closed': return 'bg-slate-100 text-slate-500'
    }
  }

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600'
    if (score >= 70) return 'text-amber-600'
    return 'text-slate-500'
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.newTenders}</p>
              <p className="text-3xl font-black text-slate-900">{MOCK_TENDERS.filter(t => t.status === 'open').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.highMatch}</p>
              <p className="text-3xl font-black text-emerald-600">{MOCK_TENDERS.filter(t => t.matchScore >= 85).length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.closingSoon}</p>
              <p className="text-3xl font-black text-amber-600">{MOCK_TENDERS.filter(t => t.status === 'closing').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalValue}</p>
              <p className="text-2xl font-black text-blue-600">9.77 Mio €</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.filter}:</span>
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: t.all },
                  { key: 'open', label: t.open },
                  { key: 'closing', label: t.closing },
                  { key: 'closed', label: t.closed }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {f.label}
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
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
            </div>
          </div>

          {/* Tenders Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.project}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.client}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.location}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.deadline}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.budget}</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.match}</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.status}</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenders.map(tender => (
                  <tr key={tender.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{tender.title}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tender.trades.map(trade => (
                            <span key={trade} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{trade}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{tender.client}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{tender.location}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{tender.deadline}</td>
                    <td className="px-4 py-4 text-sm text-right font-bold text-slate-900">{tender.budget}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-lg font-black ${getMatchColor(tender.matchScore)}`}>{tender.matchScore}%</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(tender.status)}`}>
                        {tender.status === 'open' ? t.open : tender.status === 'closing' ? t.closing : t.closed}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors">
                          {t.analyze}
                        </button>
                        <button className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 transition-colors">
                          {t.save}
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
