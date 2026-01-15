'use client'

import Link from 'next/link'

export default function PriceLibraryPage() {
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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 brand-font">Preisbibliothek</h1>
          <p className="text-slate-500 italic max-w-md">Einheitspreise pflegen und verwalten.</p>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Coming Soon</p>
        </div>
      </main>
    </div>
  )
}
