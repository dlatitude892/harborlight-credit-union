import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { languageNames, type Language } from '../i18n/translations';
import { IconGlobe, IconChevronDown } from './icons';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={`lang-switcher${compact ? ' compact' : ''}`} ref={ref}>
      <button type="button" className="lang-switcher-btn" onClick={() => setOpen((o) => !o)} aria-label="Change language">
        <IconGlobe />
        {!compact && <span>{languageNames[language]}</span>}
        <IconChevronDown style={{ width: 13, height: 13 }} />
      </button>
      {open && (
        <div className="lang-switcher-menu">
          {(Object.keys(languageNames) as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              className={lang === language ? 'active' : ''}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
            >
              {languageNames[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
