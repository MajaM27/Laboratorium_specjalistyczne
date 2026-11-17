import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { AuthContext } from './auth.js';

const TOKEN_KEY = 'petcare_token';

// Dostęp do localStorage może rzucić wyjątek (np. zablokowane dane witryny) – wtedy
// sesja działa tylko do odświeżenia strony.
function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // brak dostępu do localStorage – token zostaje tylko w pamięci
  }
}

// Przechowuje token JWT i dane zalogowanego użytkownika
export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  // 'checking' – weryfikujemy zapisany token, 'ready' – wiadomo, czy ktoś jest zalogowany
  const [status, setStatus] = useState(() => (readToken() ? 'checking' : 'ready'));
  // Powód ostatniego wylogowania pokazywany na ekranie logowania: 'expired' | 'deleted' | null
  const [notice, setNotice] = useState(null);

  const logout = useCallback(({ notice: reason = null } = {}) => {
    writeToken(null);
    setToken(null);
    setUser(null);
    setStatus('ready');
    setNotice(reason);
  }, []);

  // Po odświeżeniu strony sprawdzamy, czy zapisany token jest wciąż ważny
  useEffect(() => {
    if (!token || user) return;
    let active = true;
    apiRequest('/auth/me', { token })
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        setStatus('ready');
      })
      .catch(() => active && logout());
    return () => {
      active = false;
    };
  }, [token, user, logout]);

  // Logowanie lub wylogowanie w innej karcie przeglądarki
  useEffect(() => {
    function onStorage(event) {
      if (event.key !== TOKEN_KEY && event.key !== null) return;
      const stored = readToken();
      if (stored === token) return;
      if (!stored) {
        logout();
        return;
      }
      // Inne konto lub nowy token – ponownie weryfikujemy go przez /auth/me
      setToken(stored);
      setUser(null);
      setStatus('checking');
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [token, logout]);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    writeToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setStatus('ready');
    setNotice(null);
    return data.user;
  }, []);

  // Nowy token dla tej samej sesji (np. po zmianie hasła, która unieważnia stare tokeny).
  // Zapis w localStorage przekazuje go też innym kartom (zdarzenie storage).
  const replaceToken = useCallback((nextToken) => {
    writeToken(nextToken);
    setToken(nextToken);
  }, []);

  // Żądanie z tokenem; wygasły token (401) wylogowuje użytkownika z komunikatem o końcu sesji.
  // Po ponownym zalogowaniu użytkownik wraca na tę samą stronę (patrz ProtectedRoute).
  const request = useCallback(
    async (path, options = {}) => {
      try {
        return await apiRequest(path, { ...options, token });
      } catch (err) {
        if (err.status === 401 && token) logout({ notice: 'expired' });
        throw err;
      }
    },
    [token, logout],
  );

  const value = useMemo(
    () => ({ user, status, notice, login, logout, request, replaceToken }),
    [user, status, notice, login, logout, request, replaceToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
