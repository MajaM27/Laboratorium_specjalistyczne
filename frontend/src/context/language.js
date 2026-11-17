import { createContext, useContext } from 'react';

export const LanguageContext = createContext(null);

// Dostęp do języka interfejsu: { lang, setLang, t }
export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useI18n musi być użyty wewnątrz <LanguageProvider>.');
  return value;
}
