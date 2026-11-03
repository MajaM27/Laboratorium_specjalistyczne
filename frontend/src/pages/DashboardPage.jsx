import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import PetAvatar from '../components/PetAvatar.jsx';
import { EmptyState, Loader } from '../components/States.jsx';
import { VisitRow } from '../components/VisitItem.jsx';
import { useAuth } from '../context/auth.js';
import { useApiData } from '../hooks/useApiData.js';
import { formatAge, formatDateTime } from '../utils/format.js';

function Stat({ icon, value, label, note, color }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${color}`}>
        <Icon name={icon} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      <div className="tiny-chart" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </article>
  );
}

function SectionHead({ title, action, to }) {
  return (
    <div className="section-head">
      <h3>{title}</h3>
      <Link to={to}>
        {action} <Icon name="arrow" size={15} />
      </Link>
    </div>
  );
}

function visitsSummary(count) {
  if (count === 0) return 'Nie masz zaplanowanych wizyt.';
  if (count === 1) return 'Masz zaplanowaną jedną wizytę.';
  const few = count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14);
  return `Masz ${count} ${few ? 'zaplanowane wizyty' : 'zaplanowanych wizyt'}.`;
}

// Panel główny: statystyki (F-C-01, F-C-02), zwierzęta i najbliższe wizyty
export default function DashboardPage() {
  usePageMeta('Panel główny', 'Szybki przegląd opieki nad Twoimi zwierzętami.');
  const { user } = useAuth();
  const stats = useApiData('/stats');
  const pets = useApiData('/pets');
  const visits = useApiData('/visits?status=planned');

  const today = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const s = stats.data;
  const error = stats.error || pets.error || visits.error;

  return (
    <>
      <div className="welcome-card">
        <div>
          <span className="date-pill">{today.toUpperCase()}</span>
          <h2>Dzień dobry, {user.email.split('@')[0]}!</h2>
          <p>{s ? visitsSummary(s.plannedVisitCount) : 'Wczytywanie podsumowania…'}</p>
          <div className="welcome-actions">
            <Link className="primary" to="/pets/new">
              <Icon name="plus" size={18} /> Dodaj zwierzę
            </Link>
            <Link className="secondary" to="/visits/new">
              <Icon name="calendar" size={18} /> Zaplanuj wizytę
            </Link>
          </div>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="sun" />
          <Icon name="paw" size={82} />
          <span className="leaf leaf-a" />
          <span className="leaf leaf-b" />
        </div>
      </div>

      <Alert>{error}</Alert>

      <div className="stats-grid">
        <Stat
          icon="paw"
          color="green"
          label="Twoje zwierzęta"
          value={s ? s.petCount : '–'}
          note="przypisane do konta"
        />
        <Stat
          icon="calendar"
          color="sand"
          label="Zaplanowane wizyty"
          value={s ? s.plannedVisitCount : '–'}
          note={s?.nextVisit ? `najbliższa: ${formatDateTime(s.nextVisit.visitDateTime)}` : 'brak'}
        />
        <Stat
          icon="check"
          color="blue"
          label="Odbyte wizyty"
          value={s ? s.doneVisitCount : '–'}
          note="w historii"
        />
      </div>

      <div className="dashboard-grid">
        <section className="section-card">
          <SectionHead title="Moje zwierzęta" action="Zobacz wszystkie" to="/pets" />
          {!pets.data ? (
            <Loader />
          ) : pets.data.pets.length === 0 ? (
            <EmptyState
              title="Brak zwierząt"
              action={
                <Link className="primary" to="/pets/new">
                  <Icon name="plus" size={18} /> Dodaj pierwsze zwierzę
                </Link>
              }
            >
              Dodaj swojego pupila, aby planować jego wizyty.
            </EmptyState>
          ) : (
            <div className="pet-strip">
              {pets.data.pets.slice(0, 4).map((p) => (
                <Link className="pet-mini" key={p.id} to={`/pets/${p.id}`}>
                  <PetAvatar pet={p} />
                  <span>
                    <b>{p.name}</b>
                    <small>
                      {[p.species, p.breed, formatAge(p.birthDate)].filter(Boolean).join(' · ')}
                    </small>
                  </span>
                  <Icon name="arrow" size={18} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="section-card">
          <SectionHead title="Najbliższe wizyty" action="Wszystkie wizyty" to="/visits" />
          {!visits.data ? (
            <Loader />
          ) : visits.data.visits.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="Brak zaplanowanych wizyt"
              action={
                <Link className="secondary" to="/visits/new">
                  <Icon name="plus" size={18} /> Zaplanuj wizytę
                </Link>
              }
            />
          ) : (
            <div className="appointment-list">
              {visits.data.visits.slice(0, 3).map((v, i) => (
                <VisitRow visit={v} key={v.id} featured={i === 0} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
