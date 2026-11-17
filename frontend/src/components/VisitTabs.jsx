import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useI18n } from '../context/language.js';

// Przełącznik „Zaplanowane / Historia” + przycisk dodania wizyty
export default function VisitTabs() {
  const { t } = useI18n();
  return (
    <div className="page-actions">
      <nav className="segmented" aria-label={t('visits.tabsLabel')}>
        <NavLink to="/visits">{t('visits.tabPlanned')}</NavLink>
        <NavLink to="/history">{t('visits.tabHistory')}</NavLink>
      </nav>
      <Link className="primary" to="/visits/new">
        <Icon name="plus" size={18} /> {t('visits.add')}
      </Link>
    </div>
  );
}
