'use client'

import Link from 'next/link'

export default function SupportPage() {
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
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 brand-font">Technischer Support</h1>
          <p className="text-slate-500 italic max-w-md">Hilfe und Unterstützung bei technischen Fragen.</p>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Coming Soon</p>
        </div>
      </main>
    </div>
  )
}
