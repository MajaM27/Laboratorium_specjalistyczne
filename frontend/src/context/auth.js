import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// Dostęp do stanu logowania: { user, status, login, logout, request }
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth musi być użyty wewnątrz <AuthProvider>.');
  return value;
}
