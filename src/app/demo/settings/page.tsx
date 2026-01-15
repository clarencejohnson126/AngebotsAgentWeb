'use client'

import Link from 'next/link'

export default function SettingsPage() {
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
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 brand-font">Einstellungen</h1>
          <p className="text-slate-500 italic max-w-md">Systemeinstellungen und Präferenzen konfigurieren.</p>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Coming Soon</p>
        </div>
      </main>
    </div>
  )
}
