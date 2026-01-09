
import React, { useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { navigateTo } from '../App';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
  children: React.ReactNode;
  showNav?: boolean;
}

export const Layout: React.FC<Props> = ({ lang, setLang, children, showNav = true }) => {
  const t = TRANSLATIONS[lang];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const groups = [
    {
      title: 'Kalkulation',
      items: [
        { href: '#/dashboard', label: t.projects },
        { href: '#/tenders', label: t.tenders },
        { href: '#/calculations', label: t.calculations },
        { href: '#/beispiele', label: t.examples },
      ]
    },
    {
      title: 'Workflow',
      items: [
        { href: '#/inbox', label: t.inbox },
        { href: '#/price-library', label: t.priceLibrary },
        { href: '#/materials', label: t.materials },
        { href: '#/billing', label: t.billing },
      ]
    },
    {
      title: 'Controlling',
      items: [
        { href: '#/analytics', label: t.analytics },
        { href: '#/reporting', label: t.reporting },
        { href: '#/audit', label: t.audit },
        { href: '#/settings', label: t.settings },
      ]
    },
    {
      title: 'Wissen & Recht',
      items: [
        { href: '#/knowledge', label: t.knowledge },
        { href: '#/support', label: t.support },
      ]
    }
  ];

  const rebelzLogo = "https://eoahpwciwttfavzpqfnz.supabase.co/storage/v1/object/sign/unrelated/ChatGPT%20Image%20Dec%2029,%202025,%2002_08_06%20AM.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85YmJlMzI3NC0xODJjLTRmZGUtODk2NC1hMTcxNzVmY2I1NGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1bnJlbGF0ZWQvQ2hhdEdQVCBJbWFnZSBEZWMgMjksIDIwMjUsIDAyXzA4XzA2IEFNLnBuZyIsImlhdCI6MTc2Nzk1NDE1MSwiZXhwIjoxOTU3MTcwMTUxfQ.ZY_xLspOoFMMjMG5ZG22Gwr-CebXCgo_18urp_hA8co";

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <button 
            onClick={(e) => navigateTo('#/', e)} 
            className="text-2xl font-black tracking-tighter text-slate-900 brand-font"
          >
            Angebots<span className="text-blue-700 italic">Agent</span>
          </button>
          {showNav && (
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              <span>Menu</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher current={lang} onChange={setLang} />
          {showNav ? (
            <div className="flex items-center space-x-3">
              <button onClick={(e) => navigateTo('#/support', e)} className="p-2 text-slate-400 hover:text-slate-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </button>
              <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">JD</div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button 
                onClick={(e) => navigateTo('#/beispiele', e)} 
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600"
              >
                Beispiele
              </button>
              <button 
                onClick={(e) => navigateTo('#/dashboard', e)} 
                className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mega Menu Overlay */}
      {isMenuOpen && showNav && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-20 p-12 overflow-y-auto">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            {groups.map((group, i) => (
              <div key={i}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-6 border-b border-blue-50 pb-2">{group.title}</h3>
                <nav className="flex flex-col space-y-4">
                  {group.items.map(item => (
                    <button 
                      key={item.href} 
                      onClick={(e) => { setIsMenuOpen(false); navigateTo(item.href, e); }}
                      className="text-left text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors italic"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12 italic">
          {/* Main Footer Brand and Links (NOW SWAPPED) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="text-left">
              <p className="text-2xl font-black text-slate-900 brand-font mb-1">
                Angebots<span className="text-blue-700">Agent</span>
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Individuelle Bau-KI-Lösungen.
              </p>
            </div>
            {/* SERVICE ATTRIBUTION NOW AT TOP RIGHT */}
            <a 
              href="https://rebelzai.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-end group transition-all"
            >
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-slate-900 transition-colors mb-2">
                 Eine Dienstleistung von Rebelz AI
               </span>
               <img 
                 src={rebelzLogo} 
                 alt="Rebelz AI Logo" 
                 className="h-8 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
               />
            </a>
          </div>
          
          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="opacity-40 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
               {t.footer}
            </div>
            
            {/* LINKS NOW AT BOTTOM RIGHT */}
            <div className="flex flex-wrap gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
               <button type="button" onClick={(e) => navigateTo('#/beispiele', e)} className="hover:text-slate-900 transition-colors">Beispiele</button>
               <button type="button" className="hover:text-slate-900 transition-colors">Impressum</button>
               <button type="button" className="hover:text-slate-900 transition-colors">Datenschutz</button>
               <button type="button" className="hover:text-slate-900 transition-colors">VOB Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
