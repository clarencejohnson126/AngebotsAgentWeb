
import React from 'react';
import { Language } from '../types';

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<Props> = ({ current, onChange }) => {
  return (
    <div className="flex items-center space-x-2 border rounded p-1 bg-white">
      <button
        onClick={() => onChange('de')}
        className={`px-3 py-1 text-xs font-semibold rounded ${current === 'de' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
      >
        DE
      </button>
      <button
        onClick={() => onChange('en')}
        className={`px-3 py-1 text-xs font-semibold rounded ${current === 'en' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
      >
        EN
      </button>
    </div>
  );
};
