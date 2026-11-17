import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { initials } from '../utils/format.js';
import { useAuth } from '../context/auth.js';
import { formatDate } from '../utils/format.js';
import { useI18n } from '../context/language.js';

// Dane konta i wylogowanie (PU-05)
export default function AccountPage() {
  const { t } = useI18n();
  usePageMeta(t('account.title'), t('account.subtitle'));
  const { user, logout } = useAuth();

  return (
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
        <button className="secondary danger" onClick={logout}>
          <Icon name="logout" size={18} /> {t('account.logout')}
        </button>
      </div>
    </section>
  );
}
