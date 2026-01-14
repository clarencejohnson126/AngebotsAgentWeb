'use client'

import Link from 'next/link'

export default function ImpressumPage() {
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
          <Link
            href="/beispiele"
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
          >
            Beispiele
          </Link>
          <Link
            href="/login"
            className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-12 brand-font">
            Impressum
          </h1>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Angaben gemäß § 5 TMG</h2>
              <p className="font-medium">
                Johnson Services<br />
                Clarence Johnson<br />
                George-Washington-Str. 219<br />
                68309 Mannheim
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Kontakt</h2>
              <p className="font-medium">
                E-Mail: info@angebots-agent.de
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Umsatzsteuer-ID</h2>
              <p className="font-medium">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE452125652
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Zuständiges Finanzamt</h2>
              <p className="font-medium">
                Finanzamt Mannheim-Neckarstadt
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hinweis gemäß § 19 UStG</h2>
              <p className="font-medium">
                Aufgrund der Kleinunternehmerregelung gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Produkt</h2>
              <p className="font-medium">
                AngebotsAgent ist ein Produkt von Johnson Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Haftungsausschluss</h2>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Haftung für Inhalte</h3>
              <p className="mb-4">
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
                Tätigkeit hinweisen.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Haftung für Links</h3>
              <p className="mb-4">
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
                Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
                mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
                Verlinkung nicht erkennbar.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Urheberrecht</h3>
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite
                sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12 italic">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="text-left">
              <p className="text-2xl font-black text-slate-900 brand-font mb-1">
                Angebots<span className="text-blue-700">Agent</span>
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Individuelle Bau-KI-Lösungen.
              </p>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="opacity-40 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
               © 2026 AngebotsAgent.
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
               <Link href="/beispiele" className="hover:text-slate-900 transition-colors">Beispiele</Link>
               <Link href="/impressum" className="hover:text-slate-900 transition-colors text-blue-600">Impressum</Link>
               <Link href="/datenschutz" className="hover:text-slate-900 transition-colors">Datenschutz</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
