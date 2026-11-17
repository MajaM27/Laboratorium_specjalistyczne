import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/auth.js';
import { useI18n } from '../context/language.js';

// PU-02: logowanie
export default function LoginPage() {
  const { login, notice } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = `${t('login.pageTitle')} · PetCare`;
  }, [t]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError(t('login.missing'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout eyebrow={t('login.eyebrow')} title={t('login.title')} lead={t('login.lead')}>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Alert type="success">
          {location.state?.message || (notice === 'deleted' && t('account.deleted'))}
        </Alert>
        <Alert type="warning">{notice === 'expired' && t('login.sessionExpired')}</Alert>
        <Alert>{error}</Alert>
        <Field
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          value={form.email}
          onChange={update('email')}
          autoFocus
        />
        <Field
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          placeholder={t('login.passwordPlaceholder')}
          value={form.password}
          onChange={update('password')}
        />
        <button className="primary auth-button" type="submit" disabled={busy}>
          {busy ? t('login.submitting') : t('login.submit')} <Icon name="arrow" size={18} />
        </button>
      </form>
      <p className="auth-switch">
        {t('login.noAccount')} <Link to="/register">{t('login.register')}</Link>
      </p>
    </AuthLayout>
  );
}
