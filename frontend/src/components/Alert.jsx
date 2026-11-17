import Icon from './Icon.jsx';

const ICONS = { error: 'close', success: 'check', warning: 'clock' };

// Komunikat dla użytkownika: type = 'error' | 'success' | 'warning'
export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon name={ICONS[type]} size={16} />
      <span>{children}</span>
    </div>
  );
}
