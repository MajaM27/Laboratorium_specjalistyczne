import { messages } from './messages.js';

// Wybór języka interfejsu (NF-C-02): polski (domyślny) lub angielski.
// Bieżący język trzymamy też poza Reactem – korzystają z niego formatowanie dat i klient API.
export const LANGUAGES = ['pl', 'en'];
const STORAGE_KEY = 'petcare-lang';
const LOCALES = { pl: 'pl-PL', en: 'en-GB' };

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

let current = readStored() ?? 'pl';

export function getLanguage() {
  return current;
}

export function getLocale(lang = current) {
  return LOCALES[lang];
}

export function setLanguage(lang) {
  if (!LANGUAGES.includes(lang)) return;
  current = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // brak dostępu do localStorage – wybór działa do odświeżenia strony
  }
}

// Tłumaczenie klucza. Wartość w słowniku to tekst z miejscami {param} albo funkcja (np. liczba mnoga).
export function translate(key, params = {}, lang = current) {
  const value = messages[lang]?.[key] ?? messages.pl[key];
  if (value === undefined) return key;
  if (typeof value === 'function') return value(params);
  return value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '');
}

document.documentElement.lang = current;
