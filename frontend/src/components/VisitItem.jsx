import { Link } from 'react-router-dom';
import { dateParts, isOverdue } from '../utils/format.js';
import Icon from './Icon.jsx';
import PetAvatar from './PetAvatar.jsx';

function StatusBadge({ visit }) {
  if (visit.status === 'done') return <em className="badge badge-done">Zakończona</em>;
  if (isOverdue(visit)) return <em className="badge badge-overdue">Po terminie</em>;
  return <em className="badge badge-planned">Zaplanowana</em>;
}

// Zwarta pozycja wizyty – panel główny
export function VisitRow({ visit, featured = false }) {
  const d = dateParts(visit.visitDateTime);
  return (
    <Link to={`/pets/${visit.petId}`} className={`appointment-row ${featured ? 'featured' : ''}`}>
      <div className="date-box">
        <b>{d.day}</b>
        <small>{d.month}</small>
      </div>
      <PetAvatar pet={{ id: visit.petId, name: visit.petName }} size={36} radius={18} />
      <div className="appointment-copy">
        <b>{visit.purpose}</b>
        <span>
          {visit.petName} · {visit.clinic}
        </span>
      </div>
      <div className="appointment-time">
        <Icon name="clock" size={15} />
        {d.time}
      </div>
    </Link>
  );
}

// Pełna pozycja wizyty z akcjami – lista zaplanowanych wizyt
export function VisitCard({ visit, onComplete, onDelete, busy }) {
  const d = dateParts(visit.visitDateTime);
  return (
    <div className="full-appointment">
      <div className={`date-box ${isOverdue(visit) ? 'overdue' : ''}`}>
        <small>{d.weekday}</small>
        <b>{d.day}</b>
        <span>{d.month}</span>
      </div>
      <PetAvatar pet={{ id: visit.petId, name: visit.petName }} size={46} />
      <div className="full-appointment-copy">
        <h4>{visit.purpose}</h4>
        <p>
          <Link to={`/pets/${visit.petId}`}>{visit.petName}</Link> · {visit.petSpecies}
        </p>
        <span>
          <Icon name="clock" size={14} />
          {d.time}
          <Icon name="pin" size={14} />
          {visit.clinic}
        </span>
      </div>
      <StatusBadge visit={visit} />
      <div className="row-actions">
        {visit.status === 'planned' && onComplete && (
          <button
            className="action-button action-complete"
            onClick={() => onComplete(visit)}
            disabled={busy}
            title="Oznacz jako zakończoną"
          >
            <Icon name="check" size={17} />
            <span>Zakończ</span>
          </button>
        )}
        <Link to={`/visits/${visit.id}/edit`} className="icon-action" title="Edytuj wizytę">
          <Icon name="edit" size={17} />
        </Link>
        <button
          className="icon-action danger"
          onClick={() => onDelete(visit)}
          disabled={busy}
          title="Usuń wizytę"
        >
          <Icon name="trash" size={17} />
        </button>
      </div>
    </div>
  );
}

export { StatusBadge };
