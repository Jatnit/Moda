import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { Locale, messages } from './messages';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  const saved = localStorage.getItem('moda_locale');
  if (saved === 'vi' || saved === 'en') return saved;
  return 'vi';
}

export function I18nProvider(props: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem('moda_locale', next);
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => messages[locale][key] ?? key
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return ctx;
}
