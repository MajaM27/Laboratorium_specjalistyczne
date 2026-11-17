import { useCallback, useMemo, useState } from 'react';
import { getLanguage, setLanguage, translate } from '../i18n/i18n.js';
import { LanguageContext } from './language.js';

// Przechowuje wybrany język; zmiana języka odświeża cały interfejs
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getLanguage);

  const changeLanguage = useCallback((next) => {
    setLanguage(next);
    setLang(getLanguage());
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang: changeLanguage,
      t: (key, params) => translate(key, params, lang),
    }),
    [lang, changeLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
