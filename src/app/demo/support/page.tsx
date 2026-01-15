'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

interface Ticket {
  id: string
  subject: string
  status: 'open' | 'pending' | 'resolved'
  created: string
  lastUpdate: string
}

const MOCK_FAQS: FAQ[] = [
  { id: '1', question: 'Wie lade ich ein Leistungsverzeichnis hoch?', answer: 'Gehen Sie zum Posteingang und klicken Sie auf "Dokument hochladen". Sie können PDF, Excel oder Word-Dateien per Drag & Drop ablegen.', category: 'Upload' },
  { id: '2', question: 'Wie erstelle ich einen Nachtrag?', answer: 'Im Projekt unter "Nachtragspotenziale" finden Sie alle vom System identifizierten Abweichungen. Klicken Sie auf "In Angebot übernehmen" um einen Nachtrag zu erstellen.', category: 'Kalkulation' },
  { id: '3', question: 'Kann ich Preise aus GAEB-Dateien importieren?', answer: 'Ja, der AngebotsAgent unterstützt GAEB X83 und X84 Formate. Gehen Sie zur Preisbibliothek und nutzen Sie die Import-Funktion.', category: 'Import' },
  { id: '4', question: 'Wie funktioniert die automatische Mengenermittlung?', answer: 'Nach dem Upload eines Plans analysiert unsere KI automatisch alle Räume und extrahiert die Flächen. Die Ergebnisse finden Sie im Tab "Grundriss".', category: 'KI-Funktionen' },
  { id: '5', question: 'Wie exportiere ich ein Angebot?', answer: 'Im Projekt unter "Angebot erstellen" können Sie das fertige Angebot als PDF oder Excel exportieren. Der Export enthält alle kalkulierten Positionen.', category: 'Export' },
]

const MOCK_TICKETS: Ticket[] = [
  { id: 'TKT-2026-0015', subject: 'OCR-Erkennung bei handschriftlichen Notizen', status: 'pending', created: '2026-01-12', lastUpdate: '2026-01-14' },
  { id: 'TKT-2026-0012', subject: 'DATEV-Export fehlerhaft', status: 'resolved', created: '2026-01-08', lastUpdate: '2026-01-10' },
]

const TRANSLATIONS = {
  de: {
    title: 'Technischer Support',
    subtitle: 'Hilfe und Unterstützung bei technischen Fragen',
    faq: 'Häufige Fragen',
    tickets: 'Meine Tickets',
    contact: 'Kontakt',
    newTicket: 'Neues Ticket',
    searchFaq: 'FAQ durchsuchen...',
    allCategories: 'Alle',
    subject: 'Betreff',
    status: 'Status',
    created: 'Erstellt',
    lastUpdate: 'Letzte Aktualisierung',
    open: 'Offen',
    pending: 'In Bearbeitung',
    resolved: 'Gelöst',
    email: 'E-Mail',
    phone: 'Telefon',
    hours: 'Erreichbarkeit',
    hoursValue: 'Mo-Fr 8:00-18:00 Uhr',
    responseTime: 'Antwortzeit',
    responseTimeValue: '< 4 Stunden',
    documentation: 'Dokumentation',
    docDesc: 'Ausführliche Anleitungen und Tutorials',
    viewDocs: 'Zur Dokumentation',
    video: 'Video-Tutorials',
    videoDesc: 'Schritt-für-Schritt Erklärungen',
    watchVideos: 'Videos ansehen',
  },
  en: {
    title: 'Technical Support',
    subtitle: 'Help and assistance for technical questions',
    faq: 'FAQ',
    tickets: 'My Tickets',
    contact: 'Contact',
    newTicket: 'New Ticket',
    searchFaq: 'Search FAQ...',
    allCategories: 'All',
    subject: 'Subject',
    status: 'Status',
    created: 'Created',
    lastUpdate: 'Last Update',
    open: 'Open',
    pending: 'Pending',
    resolved: 'Resolved',
    email: 'Email',
    phone: 'Phone',
    hours: 'Availability',
    hoursValue: 'Mon-Fri 8:00 AM - 6:00 PM',
    responseTime: 'Response Time',
    responseTimeValue: '< 4 hours',
    documentation: 'Documentation',
    docDesc: 'Detailed guides and tutorials',
    viewDocs: 'View Documentation',
    video: 'Video Tutorials',
    videoDesc: 'Step-by-step explanations',
    watchVideos: 'Watch Videos',
  }
}

export default function SupportPage() {
  const [lang, setLang] = useState<Language>('de')
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'contact'>('faq')
  const [faqSearch, setFaqSearch] = useState('')
  const [faqCategory, setFaqCategory] = useState('all')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const t = TRANSLATIONS[lang]

  const faqCategories = ['all', ...Array.from(new Set(MOCK_FAQS.map(f => f.category)))]

  const filteredFaqs = MOCK_FAQS.filter(faq => {
    if (faqCategory !== 'all' && faq.category !== faqCategory) return false
    if (faqSearch && !faq.question.toLowerCase().includes(faqSearch.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'resolved': return 'bg-emerald-100 text-emerald-700'
    }
  }

  const getStatusText = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return t.open
      case 'pending': return t.pending
      case 'resolved': return t.resolved
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
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Link href="/demo/dashboard" className="text-xs text-blue-600 font-bold hover:underline mb-2 block">← {lang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</Link>
            <h1 className="text-4xl font-black text-slate-900 brand-font italic">{t.title}</h1>
            <p className="text-slate-500 mt-1">{t.subtitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            {[
              { key: 'faq', label: t.faq },
              { key: 'tickets', label: t.tickets },
              { key: 'contact', label: t.contact },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-6 py-3 rounded-lg font-bold text-sm transition-colors ${activeTab === tab.key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              {/* Search & Filter */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    {faqCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFaqCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${faqCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {cat === 'all' ? t.allCategories : cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder={t.searchFaq}
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {filteredFaqs.map(faq => (
                  <div key={faq.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{faq.category}</span>
                        <span className="font-medium text-slate-900">{faq.question}</span>
                      </div>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-4 pt-0">
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div>
              <div className="flex justify-end mb-6">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  <span>{t.newTicket}</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.subject}</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.status}</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.created}</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.lastUpdate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_TICKETS.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-mono text-sm text-blue-600">{ticket.id}</td>
                        <td className="px-4 py-4 font-medium text-slate-900">{ticket.subject}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(ticket.status)}`}>
                            {getStatusText(ticket.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">{ticket.created}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{ticket.lastUpdate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">{t.contact}</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{t.email}</p>
                      <p className="font-medium text-slate-900">support@angebotsagent.de</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{t.phone}</p>
                      <p className="font-medium text-slate-900">+49 89 123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{t.hours}</p>
                      <p className="font-medium text-slate-900">{t.hoursValue}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{t.responseTime}</p>
                      <p className="font-medium text-emerald-600">{t.responseTimeValue}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{t.documentation}</h4>
                      <p className="text-sm text-slate-500">{t.docDesc}</p>
                    </div>
                  </div>
                  <button className="w-full py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                    {t.viewDocs}
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{t.video}</h4>
                      <p className="text-sm text-slate-500">{t.videoDesc}</p>
                    </div>
                  </div>
                  <button className="w-full py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                    {t.watchVideos}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
