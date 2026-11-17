import Icon from './Icon.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { useI18n } from '../context/language.js';

// Przycisk przełączania trybu jasnego/ciemnego
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const label = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');
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
