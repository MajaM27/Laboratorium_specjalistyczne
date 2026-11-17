import Icon from './Icon.jsx';
import { useTheme } from '../hooks/useTheme.js';

// Przycisk przełączania trybu jasnego/ciemnego
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Włącz tryb jasny' : 'Włącz tryb ciemny';
  return (
    <button
      type="button"
      className={className ? `theme-toggle ${className}` : 'theme-toggle'}
      onClick={toggleTheme}
      title={label}
      aria-label={label}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
    </button>
  );
}
