import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { en, Messages } from './en';
import { pl } from './pl';

export type Language = 'en' | 'pl';

const LANGUAGE_STORAGE_KEY = 'skill-matrix.language';
const dictionaries: Record<Language, Messages> = { en, pl };

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'pl';
}

// A stored choice wins; otherwise Polish browsers get Polish and everyone else English.
function resolveInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) {
      return stored;
    }
  } catch {
    // storage unavailable; fall through to the browser rule
  }
  const browserLanguage = typeof navigator !== 'undefined' ? navigator.language : '';
  return browserLanguage?.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Messages;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(resolveInitialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode); the choice still applies to this session
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = dictionaries[language].common.documentTitle;
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
