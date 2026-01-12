'use client'

import { useState } from 'react'

type Language = 'de' | 'en'

interface LanguageSwitcherProps {
  current: Language
  onChange: (lang: Language) => void
}

export function LanguageSwitcher({ current, onChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center space-x-1 bg-slate-100 rounded-full p-1">
      <button
        onClick={() => onChange('de')}
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          current === 'de'
            ? 'bg-slate-900 text-white'
            : 'text-slate-400 hover:text-slate-900'
        }`}
      >
        DE
      </button>
      <button
        onClick={() => onChange('en')}
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          current === 'en'
            ? 'bg-slate-900 text-white'
            : 'text-slate-400 hover:text-slate-900'
        }`}
      >
        EN
      </button>
    </div>
  )
}
