import { useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'petcare-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

// Motyw interfejsu (NF-C-01): jasny/ciemny. Źródłem prawdy jest atrybut data-theme na <html>
// (ustawiany najpierw przez skrypt w index.html), więc wszystkie przełączniki widzą ten sam stan.
const listeners = new Set();

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);

  useEffect(() => {
    // Dopóki użytkownik nie wybrał motywu ręcznie, podążamy za ustawieniem systemu
    const query = window.matchMedia?.(DARK_QUERY);
    function onSystemChange() {
      if (!readStored()) applyTheme(systemTheme());
    }
    // Zmiana motywu w innej karcie przeglądarki
    function onStorage(event) {
      if (event.key === STORAGE_KEY) applyTheme(readStored() ?? systemTheme());
    }
    query?.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorage);
    return () => {
      query?.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // brak dostępu do localStorage (np. tryb prywatny) – motyw działa do odświeżenia strony
    }
    applyTheme(next);
  }

  return { theme, toggleTheme };
}
