
import React from 'react';
import { Language } from '../types';

export const ImpressumPage: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <div className="py-20 px-6 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black brand-font uppercase mb-12 text-slate-900">
          {lang === 'de' ? 'Impressum' : 'Legal Notice'}
        </h1>

        <div className="space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}
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
              {lang === 'de' ? 'Kontakt' : 'Contact'}
            </h2>
            <p className="leading-relaxed">
              E-Mail: [wird noch ergänzt]<br />
              Telefon: [wird noch ergänzt]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? 'Zuständiges Finanzamt' : 'Tax Office'}
            </h2>
            <p className="leading-relaxed">
              Finanzamt Mannheim-Neckarstadt
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? 'Umsatzsteuer-ID' : 'VAT ID'}
            </h2>
            <p className="leading-relaxed">
              [wird noch ergänzt]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {lang === 'de' ? 'Verantwortlich für den Inhalt' : 'Responsible for Content'}
            </h2>
            <p className="leading-relaxed">
              [wird noch ergänzt]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
