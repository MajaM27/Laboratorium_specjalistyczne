import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { AuthContext } from './auth.js';

const TOKEN_KEY = 'petcare_token';

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

// Przechowuje token JWT i dane zalogowanego użytkownika
export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  // 'checking' – weryfikujemy zapisany token, 'ready' – wiadomo, czy ktoś jest zalogowany
  const [status, setStatus] = useState(() => (readToken() ? 'checking' : 'ready'));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setStatus('ready');
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

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setStatus('ready');
    return data.user;
  }, []);

  // Żądanie z tokenem; wygasły token (401) wylogowuje użytkownika
  const request = useCallback(
    async (path, options = {}) => {
      try {
        return await apiRequest(path, { ...options, token });
      } catch (err) {
        if (err.status === 401) logout();
        throw err;
      }
    },
    [token, logout],
  );

  const value = useMemo(
    () => ({ user, status, login, logout, request }),
    [user, status, login, logout, request],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
