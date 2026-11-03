import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/auth.js';

// Pobiera dane z API (z tokenem). `path = null` wstrzymuje pobieranie.
// Podczas przeładowania zostawia poprzednie dane, żeby widok nie „mrugał”.
export function useApiData(path) {
  const { request } = useAuth();
  const [version, setVersion] = useState(0);
  const key = path ? `${path}#${version}` : null;
  const [state, setState] = useState({ key: null, data: null, error: '' });

  useEffect(() => {
    if (!key) return;
    let active = true;
    request(path)
      .then((data) => active && setState({ key, data, error: '' }))
      .catch((err) => active && setState({ key, data: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [key, path, request]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: state.data,
    error: state.error,
    loading: Boolean(key) && state.key !== key,
    reload,
  };
}
