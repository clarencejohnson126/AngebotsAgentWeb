
import React from 'react';
import { Language } from '../types';

export const DatenschutzPage: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <div className="py-20 px-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black brand-font uppercase mb-12 text-slate-900">
          {lang === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
        </h1>

        <div className="space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? '1. Verantwortlicher' : '1. Data Controller'}
            </h2>
            <p className="leading-relaxed">
              Rebelz AI<br />
              George-Washington-Str. 219<br />
              69309 Mannheim<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? '2. Erhebung und Speicherung personenbezogener Daten' : '2. Collection and Storage of Personal Data'}
            </h2>
            <p className="leading-relaxed">
              [wird noch ergänzt]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? '3. Verwendung von Cookies' : '3. Use of Cookies'}
            </h2>
            <p className="leading-relaxed">
              [wird noch ergänzt]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? '4. Ihre Rechte' : '4. Your Rights'}
            </h2>
            <p className="leading-relaxed">
              [wird noch ergänzt]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? '5. Kontakt' : '5. Contact'}
            </h2>
            <p className="leading-relaxed">
              {lang === 'de'
                ? 'Bei Fragen zum Datenschutz können Sie uns unter folgender Adresse erreichen:'
                : 'For questions about data protection, you can reach us at:'
              }<br /><br />
              E-Mail: [wird noch ergänzt]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
