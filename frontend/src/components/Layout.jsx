import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth.js';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';
import { initials } from '../utils/format.js';
import { useI18n } from '../context/language.js';

const nav = [
  { to: '/', icon: 'grid', label: 'nav.dashboard', end: true },
  { to: '/pets', icon: 'paw', label: 'nav.pets' },
  { to: '/visits', icon: 'calendar', label: 'nav.visits' },
  { to: '/history', icon: 'file', label: 'nav.history' },
  { to: '/account', icon: 'user', label: 'nav.account' },
];

function Sidebar({ open, close }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  return (
    <>
      {open && (
        <button className="sidebar-scrim" onClick={close} aria-label={t('layout.closeMenu')} />
      )}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <Logo />
        <p className="nav-label">{t('nav.label')}</p>
        <nav>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={close}>
              <Icon name={item.icon} />
              <span>{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-tip">
          <span>
            <Icon name="heart" size={18} />
          </span>
          <b>{t('layout.tipTitle')}</b>
          <p>{t('layout.tipText')}</p>
        </div>
        <div className="profile">
          <div className="avatar">{initials(user?.email)}</div>
          <div className="profile-copy">
            <b title={user?.email}>{user?.email}</b>
            <small>{t('common.ownerRole')}</small>
          </div>
          <button onClick={logout} title={t('layout.logout')} aria-label={t('layout.logout')}>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}

// Szkielet aplikacji po zalogowaniu: menu boczne + nagłówek + treść strony
export default function Layout() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [meta, setMeta] = useState({ title: '', subtitle: '' });
  const location = useLocation();

  // Przewinięcie na górę po zmianie strony
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} close={() => setMenuOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label={t('layout.openMenu')}
          >
            <Icon name="menu" />
          </button>
          <div className="topbar-title">
            <h1>{meta.title}</h1>
            {meta.subtitle && <p>{meta.subtitle}</p>}
          </div>
          <div className="topbar-actions">
            <LanguageSwitch />
            <ThemeToggle />
            <NavLink to="/account" className="top-avatar" title={user?.email}>
              {initials(user?.email)}
            </NavLink>
          </div>
        </header>
        <main className="content">
          <Outlet context={{ setMeta }} />
        </main>
      </div>
    </div>
  );
}
