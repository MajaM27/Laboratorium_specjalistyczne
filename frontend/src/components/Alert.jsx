import Icon from './Icon.jsx';

// Komunikat dla użytkownika: type = 'error' | 'success'
export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon name={type === 'error' ? 'close' : 'check'} size={16} />
      <span>{children}</span>
    </div>
  );
}
