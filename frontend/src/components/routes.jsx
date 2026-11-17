import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth.js';
import { Loader } from './States.jsx';
import { useI18n } from '../context/language.js';

// Trasy tylko dla zalogowanych – pozostali trafiają na ekran logowania
export function ProtectedRoute() {
  const { user, status } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  if (status === 'checking') return <Loader text={t('common.checkingSession')} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Logowanie i rejestracja – zalogowany użytkownik wraca do panelu
export function PublicOnlyRoute() {
  const { user, status } = useAuth();
  const { t } = useI18n();
  if (status === 'checking') return <Loader text={t('common.checkingSession')} />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
