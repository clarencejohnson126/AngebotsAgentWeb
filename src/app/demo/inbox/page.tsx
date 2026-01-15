'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface Document {
  id: string
  name: string
  type: 'LV' | 'Plan' | 'Vertrag' | 'Sonstige'
  uploadDate: string
  status: 'processing' | 'completed' | 'error'
  extractedItems: number
  size: string
  project?: string
}

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'LV_Trockenbau_Sonnenhang.pdf', type: 'LV', uploadDate: '2026-01-14', status: 'completed', extractedItems: 47, size: '2.4 MB', project: 'Wohnanlage Sonnenhang' },
  { id: '2', name: 'Grundriss_OG1_OG2.pdf', type: 'Plan', uploadDate: '2026-01-14', status: 'completed', extractedItems: 28, size: '8.1 MB', project: 'Wohnanlage Sonnenhang' },
  { id: '3', name: 'Ausschreibung_Bürogebäude_München.pdf', type: 'LV', uploadDate: '2026-01-13', status: 'completed', extractedItems: 156, size: '4.7 MB', project: 'Bürogebäude München' },
  { id: '4', name: 'Bauvertrag_Entwurf.pdf', type: 'Vertrag', uploadDate: '2026-01-12', status: 'completed', extractedItems: 12, size: '1.2 MB' },
  { id: '5', name: 'Detailplan_Sanitär.dwg', type: 'Plan', uploadDate: '2026-01-12', status: 'processing', extractedItems: 0, size: '15.3 MB', project: 'Bürogebäude München' },
  { id: '6', name: 'LV_Elektro_Rohbau.xlsx', type: 'LV', uploadDate: '2026-01-11', status: 'error', extractedItems: 0, size: '890 KB' },
]

const TRANSLATIONS = {
  de: {
    title: 'Posteingang',
    subtitle: 'Belege, Pläne und Dokumente hochladen und verarbeiten',
    upload: 'Dokument hochladen',
    documents: 'Dokumente',
    filter: 'Filter',
    all: 'Alle',
    search: 'Suchen...',
    name: 'Dateiname',
    type: 'Typ',
    date: 'Hochgeladen',
    status: 'Status',
    items: 'Extrahiert',
    project: 'Projekt',
    actions: 'Aktionen',
    processing: 'Verarbeitung...',
    completed: 'Abgeschlossen',
    error: 'Fehler',
    view: 'Anzeigen',
    delete: 'Löschen',
    dropzone: 'Dateien hier ablegen oder klicken zum Hochladen',
    formats: 'PDF, DWG, DXF, Excel, Word',
  },
  en: {
    title: 'Inbox',
    subtitle: 'Upload and process documents, plans and receipts',
    upload: 'Upload Document',
    documents: 'Documents',
    filter: 'Filter',
    all: 'All',
    search: 'Search...',
    name: 'Filename',
    type: 'Type',
    date: 'Uploaded',
    status: 'Status',
    items: 'Extracted',
    project: 'Project',
    actions: 'Actions',
    processing: 'Processing...',
    completed: 'Completed',
    error: 'Error',
    view: 'View',
    delete: 'Delete',
    dropzone: 'Drop files here or click to upload',
    formats: 'PDF, DWG, DXF, Excel, Word',
  }
}

export default function InboxPage() {
  const [lang, setLang] = useState<Language>('de')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const t = TRANSLATIONS[lang]

  const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
    if (filter !== 'all' && doc.type !== filter) return false
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700'
      case 'processing': return 'bg-amber-100 text-amber-700'
      case 'error': return 'bg-red-100 text-red-700'
    }
  }

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'completed': return t.completed
      case 'processing': return t.processing
      case 'error': return t.error
    }
  }

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'LV': return 'bg-blue-100 text-blue-700'
      case 'Plan': return 'bg-purple-100 text-purple-700'
      case 'Vertrag': return 'bg-slate-100 text-slate-700'
      default: return 'bg-gray-100 text-gray-700'
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
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span>{t.upload}</span>
            </button>
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{t.upload}</h2>
                  <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-50">
                  <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="text-slate-600 font-medium mb-2">{t.dropzone}</p>
                  <p className="text-slate-400 text-sm">{t.formats}</p>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900">
                    {lang === 'de' ? 'Abbrechen' : 'Cancel'}
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                    {lang === 'de' ? 'Hochladen' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.filter}:</span>
              <div className="flex space-x-2">
                {['all', 'LV', 'Plan', 'Vertrag'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {f === 'all' ? t.all : f}
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
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.name}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.type}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.project}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.status}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.items}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.date}</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                          <p className="text-xs text-slate-400">{doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(doc.type)}`}>{doc.type}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{doc.project || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(doc.status)}`}>
                        {getStatusText(doc.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {doc.status === 'completed' && (
                        <span className="text-sm font-bold text-emerald-600">{doc.extractedItems}</span>
                      )}
                      {doc.status === 'processing' && (
                        <span className="text-sm text-amber-600">...</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{doc.uploadDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title={t.view}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors" title={t.delete}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats Footer */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'de' ? 'Gesamt' : 'Total'}</p>
              <p className="text-2xl font-black text-slate-900">{MOCK_DOCUMENTS.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'de' ? 'Verarbeitet' : 'Processed'}</p>
              <p className="text-2xl font-black text-emerald-600">{MOCK_DOCUMENTS.filter(d => d.status === 'completed').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'de' ? 'In Bearbeitung' : 'Processing'}</p>
              <p className="text-2xl font-black text-amber-600">{MOCK_DOCUMENTS.filter(d => d.status === 'processing').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'de' ? 'Extrahierte Positionen' : 'Extracted Items'}</p>
              <p className="text-2xl font-black text-blue-600">{MOCK_DOCUMENTS.reduce((sum, d) => sum + d.extractedItems, 0)}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
