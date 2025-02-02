import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2 } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'jp', name: '日本語' }
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-[#0A1A2F]/50 transition-all">
        <Globe2 className="w-5 h-5" />
        <span>{languages.find(lang => lang.code === i18n.language)?.name || 'English'}</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 py-2 bg-[#0A1A2F] rounded-lg shadow-xl border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`w-full px-4 py-2 text-left hover:bg-[#00FFC2]/10 transition-all ${
              i18n.language === lang.code ? 'text-[#00FFC2]' : 'text-white'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}