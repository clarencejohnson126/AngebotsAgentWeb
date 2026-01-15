'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface Invoice {
  id: string
  invoiceNr: string
  project: string
  client: string
  date: string
  dueDate: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  type: 'Abschlag' | 'Schlussrechnung' | 'Nachtrag'
}

const MOCK_INVOICES: Invoice[] = [
  { id: '1', invoiceNr: 'RE-2026-0042', project: 'Wohnanlage Sonnenhang', client: 'Sonnenhang GmbH', date: '2026-01-10', dueDate: '2026-02-10', amount: 85400.00, status: 'sent', type: 'Abschlag' },
  { id: '2', invoiceNr: 'RE-2026-0041', project: 'Bürogebäude München', client: 'Immobilien AG', date: '2026-01-05', dueDate: '2026-02-05', amount: 124800.00, status: 'paid', type: 'Abschlag' },
  { id: '3', invoiceNr: 'RE-2026-0040', project: 'Schulkomplex Stuttgart', client: 'Stadt Stuttgart', date: '2025-12-20', dueDate: '2026-01-20', amount: 67200.00, status: 'overdue', type: 'Abschlag' },
  { id: '4', invoiceNr: 'RE-2026-0039', project: 'Hotelumbau Berlin', client: 'Hospitality Group', date: '2025-12-15', dueDate: '2026-01-15', amount: 198500.00, status: 'paid', type: 'Schlussrechnung' },
  { id: '5', invoiceNr: 'RE-2026-0038', project: 'Wohnanlage Sonnenhang', client: 'Sonnenhang GmbH', date: '2025-12-10', dueDate: '2026-01-10', amount: 42300.00, status: 'paid', type: 'Nachtrag' },
  { id: '6', invoiceNr: 'DRAFT-001', project: 'Praxisräume Köln', client: 'Medizin Immobilien', date: '-', dueDate: '-', amount: 31500.00, status: 'draft', type: 'Abschlag' },
]

const TRANSLATIONS = {
  de: {
    title: 'Abrechnung',
    subtitle: 'Rechnungen erstellen und Zahlungen verwalten',
    search: 'Rechnung oder Projekt suchen...',
    filter: 'Status',
    all: 'Alle',
    invoiceNr: 'Rechnungs-Nr.',
    project: 'Projekt',
    client: 'Kunde',
    date: 'Datum',
    dueDate: 'Fällig',
    amount: 'Betrag',
    status: 'Status',
    type: 'Art',
    actions: 'Aktionen',
    draft: 'Entwurf',
    sent: 'Versendet',
    paid: 'Bezahlt',
    overdue: 'Überfällig',
    view: 'Anzeigen',
    send: 'Versenden',
    remind: 'Mahnen',
    newInvoice: 'Neue Rechnung',
    totalOpen: 'Offene Posten',
    totalPaid: 'Bezahlt (Monat)',
    totalOverdue: 'Überfällig',
    invoiceCount: 'Rechnungen',
  },
  en: {
    title: 'Billing',
    subtitle: 'Create invoices and manage payments',
    search: 'Search invoice or project...',
    filter: 'Status',
    all: 'All',
    invoiceNr: 'Invoice No.',
    project: 'Project',
    client: 'Client',
    date: 'Date',
    dueDate: 'Due',
    amount: 'Amount',
    status: 'Status',
    type: 'Type',
    actions: 'Actions',
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    view: 'View',
    send: 'Send',
    remind: 'Remind',
    newInvoice: 'New Invoice',
    totalOpen: 'Open Items',
    totalPaid: 'Paid (Month)',
    totalOverdue: 'Overdue',
    invoiceCount: 'Invoices',
  }
}

export default function BillingPage() {
  const [lang, setLang] = useState<Language>('de')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const t = TRANSLATIONS[lang]

  const filteredInvoices = MOCK_INVOICES.filter(inv => {
    if (filter !== 'all' && inv.status !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return inv.invoiceNr.toLowerCase().includes(query) ||
             inv.project.toLowerCase().includes(query) ||
             inv.client.toLowerCase().includes(query)
    }
    return true
  })

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-600'
      case 'sent': return 'bg-blue-100 text-blue-700'
      case 'paid': return 'bg-emerald-100 text-emerald-700'
      case 'overdue': return 'bg-red-100 text-red-700'
    }
  }

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return t.draft
      case 'sent': return t.sent
      case 'paid': return t.paid
      case 'overdue': return t.overdue
    }
  }

  const openAmount = MOCK_INVOICES.filter(i => i.status === 'sent').reduce((s, i) => s + i.amount, 0)
  const paidAmount = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const overdueAmount = MOCK_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

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
              <span>{t.newInvoice}</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalOpen}</p>
              <p className="text-2xl font-black text-blue-600">€ {openAmount.toLocaleString('de-DE', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalPaid}</p>
              <p className="text-2xl font-black text-emerald-600">€ {paidAmount.toLocaleString('de-DE', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalOverdue}</p>
              <p className="text-2xl font-black text-red-600">€ {overdueAmount.toLocaleString('de-DE', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.invoiceCount}</p>
              <p className="text-3xl font-black text-slate-900">{MOCK_INVOICES.length}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.filter}:</span>
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: t.all },
                  { key: 'draft', label: t.draft },
                  { key: 'sent', label: t.sent },
                  { key: 'paid', label: t.paid },
                  { key: 'overdue', label: t.overdue }
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
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.invoiceNr}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.project}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.client}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.type}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.date}</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.dueDate}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.amount}</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.status}</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className={`hover:bg-slate-50 transition-colors ${inv.status === 'overdue' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-slate-700">{inv.invoiceNr}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{inv.project}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{inv.client}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{inv.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{inv.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">€ {inv.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(inv.status)}`}>
                        {getStatusText(inv.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title={t.view}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        {inv.status === 'draft' && (
                          <button className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700" title={t.send}>
                            {t.send}
                          </button>
                        )}
                        {inv.status === 'overdue' && (
                          <button className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700" title={t.remind}>
                            {t.remind}
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
