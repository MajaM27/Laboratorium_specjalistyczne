import { useEffect, useState } from 'react';

// Wartość aktualizowana dopiero po chwili bez zmian (np. wyszukiwarka)
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
