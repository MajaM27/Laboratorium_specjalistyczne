import Icon from './Icon.jsx';

export function Loader({ text = 'Wczytywanie…' }) {
  return (
    <div className="loader" role="status">
      <span className="spinner" />
      {text}
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
