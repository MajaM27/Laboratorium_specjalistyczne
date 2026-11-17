import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';
import { useI18n } from '../context/language.js';

// Wspólny układ ekranów logowania i rejestracji
export default function AuthLayout({ eyebrow, title, lead, children }) {
  const { t } = useI18n();
  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-tools">
          <LanguageSwitch />
          <ThemeToggle />
        </div>
        <div className="auth-inner">
          <Logo />
          <div className="auth-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{lead}</p>
          </div>
          {children}
        </div>
      </section>
      <section className="auth-visual" aria-hidden="true">
        <div className="auth-orb orb-one" />
        <div className="auth-orb orb-two" />
        <div className="visual-copy">
          <span className="mini-badge">
            <Icon name="heart" size={15} /> {t('auth.badge')}
          </span>
          <h2>
            {t('auth.visualTitle1')}
            <br />
            {t('auth.visualTitle2')}
          </h2>
          <p>{t('auth.visualText')}</p>
        </div>
        <div className="pet-collage">
          <div className="main-photo">
            <Icon name="paw" size={110} />
          </div>
          <div className="small-photo">
            <Icon name="heart" size={64} />
          </div>
          <div className="floating-note">
            <span>
              <Icon name="check" size={15} />
            </span>
            <div>
              <b>{t('auth.noteTitle')}</b>
              <small>{t('auth.noteText')}</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
