import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client.js';
import Alert from '../components/Alert.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { useI18n } from '../context/language.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Walidacja po stronie klienta – te same reguły co w backendzie
function validate({ email, password, confirm }, t) {
  const errors = {};
  if (!EMAIL_RE.test(email.trim())) errors.email = t('register.errorEmail');
  if (password.length < 8 || password.length > 72)
    errors.password = t('register.errorPasswordLength');
  else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password))
    errors.password = t('register.errorPasswordChars');
  if (confirm !== password) errors.confirm = t('register.errorConfirm');
  return errors;
}

// PU-01: rejestracja – po sukcesie przejście do logowania z komunikatem
export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = `${t('register.pageTitle')} · PetCare`;
  }, [t]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form, t);
    setErrors(found);
    setError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { email: form.email.trim(), password: form.password },
      });
      navigate('/login', { state: { message: data.message, email: data.user.email } });
    } catch (err) {
      setError(err.message);
      setErrors(err.details || {});
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      eyebrow={t('register.eyebrow')}
      title={t('register.title')}
      lead={t('register.lead')}
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Alert>{error}</Alert>
        <Field
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          autoFocus
        />
        <Field
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('register.passwordPlaceholder')}
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />
        <Field
          label={t('register.confirm')}
          type="password"
          autoComplete="new-password"
          placeholder={t('register.confirmPlaceholder')}
          value={form.confirm}
          onChange={update('confirm')}
          error={errors.confirm}
        />
        <button className="primary auth-button" type="submit" disabled={busy}>
          {busy ? t('register.submitting') : t('register.submit')} <Icon name="arrow" size={18} />
        </button>
      </form>
      <p className="auth-switch">
        {t('register.haveAccount')} <Link to="/login">{t('register.login')}</Link>
      </p>
    </AuthLayout>
  );
}
