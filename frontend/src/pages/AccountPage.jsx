import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { initials } from '../utils/format.js';
import { useAuth } from '../context/auth.js';
import { formatDate } from '../utils/format.js';

// Dane konta i wylogowanie (PU-05)
export default function AccountPage() {
  usePageMeta('Moje konto', 'Informacje o Twoim koncie.');
  const { user, logout } = useAuth();

  return (
    <section className="form-card account-card">
      <div className="settings-avatar">
        <div>{initials(user.email)}</div>
        <span>
          <b>{user.email}</b>
          <small>Właściciel zwierząt</small>
        </span>
      </div>
      <dl className="summary-list">
        <dt>Adres e-mail</dt>
        <dd>{user.email}</dd>
        <dt>Konto założone</dt>
        <dd>{formatDate(user.createdAt?.slice(0, 10))}</dd>
      </dl>
      <div className="form-buttons">
        <button className="secondary danger" onClick={logout}>
          <Icon name="logout" size={18} /> Wyloguj się
        </button>
      </div>
    </section>
  );
}
