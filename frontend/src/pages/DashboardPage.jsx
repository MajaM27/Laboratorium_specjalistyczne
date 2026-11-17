import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import PetAvatar from '../components/PetAvatar.jsx';
import { EmptyState, Loader } from '../components/States.jsx';
import { VisitRow } from '../components/VisitItem.jsx';
import { useAuth } from '../context/auth.js';
import { useApiData } from '../hooks/useApiData.js';
import { formatAge, formatDateTime, formatLongToday } from '../utils/format.js';
import { useI18n } from '../context/language.js';

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

// Panel główny: statystyki (F-C-01, F-C-02), zwierzęta i najbliższe wizyty
export default function DashboardPage() {
  const { t } = useI18n();
  usePageMeta(t('dashboard.title'), t('dashboard.subtitle'));
  const { user } = useAuth();
  const stats = useApiData('/stats');
  const pets = useApiData('/pets');
  const visits = useApiData('/visits?status=planned');

  const today = formatLongToday();
  const s = stats.data;
  const error = stats.error || pets.error || visits.error;

  return (
    <>
      <div className="welcome-card">
        <div>
          <span className="date-pill">{today.toUpperCase()}</span>
          <h2>{t('dashboard.greeting', { name: user.email.split('@')[0] })}</h2>
          <p>
            {s
              ? t('dashboard.summary', { count: s.plannedVisitCount })
              : t('dashboard.summaryLoading')}
          </p>
          <div className="welcome-actions">
            <Link className="primary" to="/pets/new">
              <Icon name="plus" size={18} /> {t('dashboard.addPet')}
            </Link>
            <Link className="secondary" to="/visits/new">
              <Icon name="calendar" size={18} /> {t('dashboard.planVisit')}
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
          label={t('dashboard.statPets')}
          value={s ? s.petCount : '–'}
          note={t('dashboard.statPetsNote')}
        />
        <Stat
          icon="calendar"
          color="sand"
          label={t('dashboard.statPlanned')}
          value={s ? s.plannedVisitCount : '–'}
          note={
            s?.overdueVisitCount
              ? t('dashboard.statOverdue', { count: s.overdueVisitCount })
              : s?.nextVisit
                ? t('dashboard.statNext', { date: formatDateTime(s.nextVisit.visitDateTime) })
                : t('dashboard.statNone')
          }
        />
        <Stat
          icon="check"
          color="blue"
          label={t('dashboard.statDone')}
          value={s ? s.doneVisitCount : '–'}
          note={t('dashboard.statDoneNote')}
        />
      </div>

      <div className="dashboard-grid">
        <section className="section-card">
          <SectionHead title={t('dashboard.myPets')} action={t('dashboard.seeAll')} to="/pets" />
          {!pets.data ? (
            !pets.error && <Loader />
          ) : pets.data.pets.length === 0 ? (
            <EmptyState
              title={t('dashboard.noPets')}
              action={
                <Link className="primary" to="/pets/new">
                  <Icon name="plus" size={18} /> {t('dashboard.addFirstPet')}
                </Link>
              }
            >
              {t('dashboard.noPetsText')}
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
          <SectionHead
            title={t('dashboard.upcoming')}
            action={t('dashboard.allVisits')}
            to="/visits"
          />
          {!visits.data ? (
            !visits.error && <Loader />
          ) : visits.data.visits.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={t('dashboard.noVisits')}
              action={
                <Link className="secondary" to="/visits/new">
                  <Icon name="plus" size={18} /> {t('dashboard.planVisit')}
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
