import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

// Przełącznik „Zaplanowane / Historia” + przycisk dodania wizyty
export default function VisitTabs() {
  return (
    <div className="page-actions">
      <nav className="segmented" aria-label="Rodzaj wizyt">
        <NavLink to="/visits">Zaplanowane</NavLink>
        <NavLink to="/history">Historia</NavLink>
      </nav>
      <Link className="primary" to="/visits/new">
        <Icon name="plus" size={18} /> Dodaj wizytę
      </Link>
    </div>
  );
}
