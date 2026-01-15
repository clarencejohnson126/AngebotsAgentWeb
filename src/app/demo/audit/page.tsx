'use client'

import Link from 'next/link'

export default function AuditPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 brand-font">
          Angebots<span className="text-blue-700 italic">Agent</span>
        </Link>
        <Link href="/demo/dashboard" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">
          ← Zurück
        </Link>
      </header>
      <main className="flex-grow flex items-center justify-center p-12">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 brand-font">Audit-Log</h1>
          <p className="text-slate-500 italic max-w-md">Alle Aktivitäten und Änderungen nachverfolgen.</p>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Coming Soon</p>
        </div>
      </main>
    </div>
  )
}
