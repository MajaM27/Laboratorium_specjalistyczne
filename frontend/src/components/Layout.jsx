import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth.js';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import { initials } from '../utils/format.js';

const nav = [
  { to: '/', icon: 'grid', label: 'Panel główny', end: true },
  { to: '/pets', icon: 'paw', label: 'Moje zwierzęta' },
  { to: '/visits', icon: 'calendar', label: 'Zaplanowane wizyty' },
  { to: '/history', icon: 'file', label: 'Historia wizyt' },
  { to: '/account', icon: 'user', label: 'Moje konto' },
];

function Sidebar({ open, close }) {
  const { user, logout } = useAuth();
  return (
    <>
      {open && <button className="sidebar-scrim" onClick={close} aria-label="Zamknij menu" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <Logo />
        <p className="nav-label">MENU</p>
        <nav>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={close}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-tip">
          <span>
            <Icon name="heart" size={18} />
          </span>
          <b>Porada</b>
          <p>Regularne wizyty kontrolne pomagają zwierzętom żyć dłużej i szczęśliwiej.</p>
        </div>
        <div className="profile">
          <div className="avatar">{initials(user?.email)}</div>
          <div className="profile-copy">
            <b title={user?.email}>{user?.email}</b>
            <small>Właściciel zwierząt</small>
          </div>
          <button onClick={logout} title="Wyloguj się" aria-label="Wyloguj się">
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
            aria-label="Otwórz menu"
          >
            <Icon name="menu" />
          </button>
          <div className="topbar-title">
            <h1>{meta.title}</h1>
            {meta.subtitle && <p>{meta.subtitle}</p>}
          </div>
          <NavLink to="/account" className="top-avatar" title={user?.email}>
            {initials(user?.email)}
          </NavLink>
        </header>
        <main className="content">
          <Outlet context={{ setMeta }} />
        </main>
      </div>
    </div>
  );
}
