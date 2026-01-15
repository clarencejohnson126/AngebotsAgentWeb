'use client'

import Link from 'next/link'

export default function ReportingPage() {
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
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 brand-font">Reporting</h1>
          <p className="text-slate-500 italic max-w-md">Berichte erstellen und exportieren.</p>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Coming Soon</p>
        </div>
      </main>
    </div>
  )
}
