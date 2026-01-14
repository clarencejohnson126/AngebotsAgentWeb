'use client'

import Link from 'next/link'

export default function DatenschutzPage() {
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
            Datenschutzerklärung
          </h1>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Datenschutz auf einen Blick</h2>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Allgemeine Hinweise</h3>
              <p className="mb-4">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
                Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Datenerfassung auf dieser Website</h3>
              <p className="mb-4">
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
                Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
              </p>

              <p className="mb-4">
                <strong>Wie erfassen wir Ihre Daten?</strong><br />
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei
                kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website
                durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser,
                Betriebssystem oder Uhrzeit des Seitenaufrufs).
              </p>

              <p className="mb-4">
                <strong>Wofür nutzen wir Ihre Daten?</strong><br />
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
                gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
              </p>

              <p>
                <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong><br />
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
                Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein
                Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
                Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit
                für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen
                die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Verantwortliche Stelle</h2>
              <p className="font-medium">
                Johnson Services<br />
                Clarence Johnson<br />
                George-Washington-Str. 219<br />
                68309 Mannheim<br /><br />
                E-Mail: kontakt@angebotsagent.de
              </p>
              <p className="mt-4">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder
                gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen
                Daten (z.B. Namen, E-Mail-Adressen o.Ä.) entscheidet.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Hosting</h2>
              <p className="mb-4">
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
              </p>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Externes Hosting</h3>
              <p>
                Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser
                Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann
                es sich v.a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten,
                Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über
                eine Website generiert werden, handeln.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Allgemeine Hinweise und Pflichtinformationen</h2>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Datenschutz</h3>
              <p className="mb-4">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
                Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den
                gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Hinweis zur verantwortlichen Stelle</h3>
              <p className="mb-4">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
                Johnson Services<br />
                Clarence Johnson<br />
                George-Washington-Str. 219<br />
                68309 Mannheim<br /><br />
                E-Mail: kontakt@angebotsagent.de
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Speicherdauer</h3>
              <p className="mb-4">
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt
                wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die
                Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen
                oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht,
                sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
                personenbezogenen Daten haben.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
              <p className="mb-4">
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung
                möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die
                Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
                unberührt.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
              <p className="mb-4">
                Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei
                einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen
                Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Recht auf Datenübertragbarkeit</h3>
              <p className="mb-4">
                Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in
                Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten
                in einem gängigen, maschinenlesbaren Format aushändigen zu lassen.
              </p>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Auskunft, Löschung und Berichtigung</h3>
              <p>
                Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf
                unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren
                Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf
                Berichtigung oder Löschung dieser Daten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Datenerfassung auf dieser Website</h2>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Server-Log-Dateien</h3>
              <p className="mb-4">
                Der Provider der Seiten erhebt und speichert automatisch Informationen in
                sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt.
                Dies sind:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>Browsertyp und Browserversion</li>
                <li>verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p>
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
                Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. Plugins und Tools</h2>

              <h3 className="text-lg font-bold text-slate-800 mb-2">Supabase</h3>
              <p>
                Wir nutzen die Dienste von Supabase für Authentifizierung und Datenbankfunktionen.
                Supabase ist ein Open-Source-Dienst, der Backend-as-a-Service-Funktionen bereitstellt.
                Bei der Nutzung unserer Dienste werden Daten auf Servern von Supabase verarbeitet.
                Weitere Informationen finden Sie in der Datenschutzerklärung von Supabase.
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
               <Link href="/impressum" className="hover:text-slate-900 transition-colors">Impressum</Link>
               <Link href="/datenschutz" className="hover:text-slate-900 transition-colors text-blue-600">Datenschutz</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
