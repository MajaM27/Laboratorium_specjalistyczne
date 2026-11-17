import { useState } from 'react';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { formatDate, initials } from '../utils/format.js';
import { useAuth } from '../context/auth.js';
import { useI18n } from '../context/language.js';

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirm: '' };

// Te same reguły co przy rejestracji – ostateczna walidacja w backendzie
function validatePasswords({ currentPassword, newPassword, confirm }, t) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = t('account.errorCurrent');
  if (newPassword.length < 8 || newPassword.length > 72)
    errors.newPassword = t('register.errorPasswordLength');
  else if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword))
    errors.newPassword = t('register.errorPasswordChars');
  else if (newPassword === currentPassword) errors.newPassword = t('account.errorSame');
  if (confirm !== newPassword) errors.confirm = t('register.errorConfirm');
  return errors;
}

function ChangePasswordForm() {
  const { request } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validatePasswords(form, t);
    setErrors(found);
    setError(Object.keys(found).length ? t('common.fixFields') : '');
    setSuccess('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const data = await request('/auth/password', {
        method: 'PUT',
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setForm(EMPTY_PASSWORDS);
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
      setErrors(err.details || {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="form-card account-card">
      <h3>{t('account.passwordTitle')}</h3>
      <p className="account-lead">{t('account.passwordLead')}</p>
      <form onSubmit={handleSubmit} noValidate>
        <Alert>{error}</Alert>
        <Alert type="success">{success}</Alert>
        <div className="form-grid">
          <Field
            wide
            label={t('account.currentPassword')}
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={update('currentPassword')}
            error={errors.currentPassword}
          />
          <Field
            label={t('account.newPassword')}
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={update('newPassword')}
            error={errors.newPassword}
          />
          <Field
            label={t('account.confirmPassword')}
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={update('confirm')}
            error={errors.confirm}
          />
        </div>
        <div className="form-buttons">
          <button className="primary" type="submit" disabled={busy}>
            <Icon name="check" size={18} />{' '}
            {busy ? t('common.saving') : t('account.changePassword')}
          </button>
        </div>
      </form>
    </section>
  );
}

function DeleteAccountForm() {
  const { request, logout } = useAuth();
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) {
      setErrors({ password: t('account.errorCurrent') });
      return;
    }
    if (!window.confirm(t('account.deleteConfirm'))) return;
    setBusy(true);
    setError('');
    setErrors({});
    try {
      await request('/auth/me', { method: 'DELETE', body: { password } });
      logout({ notice: 'deleted' });
    } catch (err) {
      setError(err.message);
      setErrors(err.details || {});
      setBusy(false);
    }
  }

  return (
    <section className="form-card account-card account-danger">
      <h3>{t('account.deleteTitle')}</h3>
      <p className="account-lead">{t('account.deleteLead')}</p>
      <form onSubmit={handleSubmit} noValidate>
        <Alert>{error}</Alert>
        <div className="form-grid">
          <Field
            wide
            label={t('account.deletePassword')}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
        </div>
        <div className="form-buttons">
          <button className="secondary danger" type="submit" disabled={busy}>
            <Icon name="trash" size={18} /> {t('account.deleteButton')}
          </button>
        </div>
      </form>
    </section>
  );
}

// Dane konta, wylogowanie (PU-05), zmiana hasła i usunięcie konta
export default function AccountPage() {
  const { t } = useI18n();
  usePageMeta(t('account.title'), t('account.subtitle'));
  const { user, logout } = useAuth();

  return (
    <div className="account-stack">
      <section className="form-card account-card">
        <div className="settings-avatar">
          <div>{initials(user.email)}</div>
          <span>
            <b>{user.email}</b>
            <small>{t('common.ownerRole')}</small>
          </span>
        </div>
        <dl className="summary-list">
          <dt>{t('account.email')}</dt>
          <dd>{user.email}</dd>
          <dt>{t('account.created')}</dt>
          <dd>{formatDate(user.createdAt?.slice(0, 10))}</dd>
        </dl>
        <div className="form-buttons">
          <button className="secondary danger" onClick={() => logout()}>
            <Icon name="logout" size={18} /> {t('account.logout')}
          </button>
        </div>
      </section>
      <ChangePasswordForm />
      <DeleteAccountForm />
    </div>
  );
}
