import Icon from './Icon.jsx';
import { useI18n } from '../context/language.js';

export function Loader({ text }) {
  const { t } = useI18n();
  return (
    <div className="loader" role="status">
      <span className="spinner" />
      {text ?? t('common.loading')}
    </div>
  );
}

export function EmptyState({ icon = 'paw', title, children, action }) {
  return (
    <div className="empty-state">
      <span>
        <Icon name={icon} size={26} />
      </span>
      <b>{title}</b>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
