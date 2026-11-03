import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

// Wspólny układ ekranów logowania i rejestracji
export default function AuthLayout({ eyebrow, title, lead, children }) {
  return (
    <div className="auth-shell">
      <section className="auth-panel">
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
            <Icon name="heart" size={15} /> Opieka bez stresu
          </span>
          <h2>
            Więcej radosnych chwil.
            <br />
            Mniej do zapamiętania.
          </h2>
          <p>Zwierzęta, wizyty u weterynarza i ich historia – wszystko w jednym miejscu.</p>
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
              <b>Wszystko pod kontrolą!</b>
              <small>Najbliższa wizyta zapisana w kalendarzu</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
