'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface Report {
  id: string
  name: string
  type: 'Projektbericht' | 'Monatsbericht' | 'Jahresbericht' | 'Kostenbericht'
  project?: string
  period: string
  createdAt: string
  status: 'ready' | 'generating' | 'scheduled'
  format: 'PDF' | 'Excel' | 'PDF + Excel'
}

const MOCK_REPORTS: Report[] = [
  { id: '1', name: 'Monatsbericht Januar 2026', type: 'Monatsbericht', period: 'Januar 2026', createdAt: '2026-01-15', status: 'ready', format: 'PDF + Excel' },
  { id: '2', name: 'Projektabschluss Hotelumbau Berlin', type: 'Projektbericht', project: 'Hotelumbau Berlin', period: 'Q4 2025', createdAt: '2026-01-10', status: 'ready', format: 'PDF' },
  { id: '3', name: 'Kostenbericht Wohnanlage Sonnenhang', type: 'Kostenbericht', project: 'Wohnanlage Sonnenhang', period: 'Laufend', createdAt: '2026-01-08', status: 'ready', format: 'Excel' },
  { id: '4', name: 'Jahresbericht 2025', type: 'Jahresbericht', period: '2025', createdAt: '2026-01-02', status: 'ready', format: 'PDF + Excel' },
  { id: '5', name: 'Wochenbericht KW 3', type: 'Monatsbericht', period: 'KW 3/2026', createdAt: '-', status: 'scheduled', format: 'PDF' },
  { id: '6', name: 'Projektfortschritt Bürogebäude München', type: 'Projektbericht', project: 'Bürogebäude München', period: 'Q1 2026', createdAt: '-', status: 'generating', format: 'PDF' },
]

const TRANSLATIONS = {
  de: {
    title: 'Reporting',
    subtitle: 'Berichte erstellen, planen und exportieren',
    search: 'Bericht suchen...',
    filter: 'Typ',
    all: 'Alle',
    name: 'Berichtsname',
    type: 'Typ',
    project: 'Projekt',
    period: 'Zeitraum',
    created: 'Erstellt',
    format: 'Format',
    status: 'Status',
    actions: 'Aktionen',
    ready: 'Bereit',
    generating: 'Wird erstellt',
    scheduled: 'Geplant',
    download: 'Download',
    view: 'Anzeigen',
    newReport: 'Neuer Bericht',
    totalReports: 'Berichte',
    thisMonth: 'Diesen Monat',
    scheduled_count: 'Geplant',
    projectReports: 'Projekt',
  },
  en: {
    title: 'Reporting',
    subtitle: 'Create, schedule and export reports',
    search: 'Search report...',
    filter: 'Type',
    all: 'All',
    name: 'Report Name',
    type: 'Type',
    project: 'Project',
    period: 'Period',
    created: 'Created',
    format: 'Format',
    status: 'Status',
    actions: 'Actions',
    ready: 'Ready',
    generating: 'Generating',
    scheduled: 'Scheduled',
    download: 'Download',
    view: 'View',
    newReport: 'New Report',
    totalReports: 'Reports',
    thisMonth: 'This Month',
    scheduled_count: 'Scheduled',
    projectReports: 'Project',
  }
}

export default function ReportingPage() {
  const [lang, setLang] = useState<Language>('de')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const t = TRANSLATIONS[lang]

  const types = ['all', 'Projektbericht', 'Monatsbericht', 'Jahresbericht', 'Kostenbericht']

  const filteredReports = MOCK_REPORTS.filter(report => {
    if (filter !== 'all' && report.type !== filter) return false
    if (searchQuery && !report.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'ready': return 'bg-emerald-100 text-emerald-700'
      case 'generating': return 'bg-blue-100 text-blue-700'
      case 'scheduled': return 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'ready': return t.ready
      case 'generating': return t.generating
      case 'scheduled': return t.scheduled
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <Link href="/demo/dashboard" className="text-xs text-blue-600 font-bold hover:underline mb-2 block">← {lang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</Link>
              <h1 className="text-4xl font-black text-slate-900 brand-font italic">{t.title}</h1>
              <p className="text-slate-500 mt-1">{t.subtitle}</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>{t.newReport}</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalReports}</p>
              <p className="text-3xl font-black text-slate-900">{MOCK_REPORTS.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.thisMonth}</p>
              <p className="text-3xl font-black text-emerald-600">{MOCK_REPORTS.filter(r => r.createdAt.includes('2026-01')).length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.scheduled_count}</p>
              <p className="text-3xl font-black text-blue-600">{MOCK_REPORTS.filter(r => r.status === 'scheduled').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.projectReports}</p>
              <p className="text-3xl font-black text-indigo-600">{MOCK_REPORTS.filter(r => r.type === 'Projektbericht').length}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.filter}:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type === 'all' ? t.all : type}</option>
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
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              />
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.name}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.type}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.period}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.format}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.created}</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.status}</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{report.name}</p>
                      {report.project && <p className="text-xs text-slate-400 mt-0.5">{report.project}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-medium">{report.type}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{report.period}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{report.format}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{report.createdAt}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {report.status === 'ready' && (
                          <>
                            <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition-colors flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              <span>{t.download}</span>
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title={t.view}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                          </>
                        )}
                        {report.status === 'generating' && (
                          <span className="text-xs text-blue-600 font-medium">Verarbeitung...</span>
                        )}
                        {report.status === 'scheduled' && (
                          <button className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50">
                            {lang === 'de' ? 'Bearbeiten' : 'Edit'}
                          </button>
                        )}
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
