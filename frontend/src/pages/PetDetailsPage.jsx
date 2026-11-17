import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import PetAvatar from '../components/PetAvatar.jsx';
import { EmptyState, Loader } from '../components/States.jsx';
import { StatusBadge } from '../components/VisitItem.jsx';
import { useAuth } from '../context/auth.js';
import { useApiData } from '../hooks/useApiData.js';
import { formatAge, formatDate, formatDateTime, formatWeight } from '../utils/format.js';
import { useI18n } from '../context/language.js';

function DetailFact({ label, value, icon }) {
  return (
    <div className="detail-fact">
      <span>
        <Icon name={icon} />
      </span>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

function Timeline({ visits, onComplete, busy }) {
  const { t } = useI18n();
  return visits.map((v) => (
    <div className={`timeline ${v.status}`} key={v.id}>
      <i />
      <div>
        <b>{v.purpose}</b>
        <span>
          {formatDateTime(v.visitDateTime)} · {v.clinic}
        </span>
      </div>
      <div className="timeline-actions">
        <StatusBadge visit={v} />
        {v.status === 'planned' && (
          <button
            className="icon-action"
            onClick={() => onComplete(v)}
            disabled={busy}
            title={t('visits.markDone')}
          >
            <Icon name="check" size={16} />
          </button>
        )}
        <Link className="icon-action" to={`/visits/${v.id}/edit`} title={t('visits.edit')}>
          <Icon name="edit" size={16} />
        </Link>
      </div>
    </div>
  ));
}

// Szczegóły zwierzęcia i jego wizyty (F-S-04, F-C-03)
export default function PetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useAuth();
  const { t } = useI18n();
  const pet = useApiData(`/pets/${id}`);
  const visits = useApiData(`/visits?petId=${id}`);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const p = pet.data?.pet;
  usePageMeta(p ? p.name : t('petDetails.fallbackTitle'), t('petDetails.subtitle'));

  async function handleDelete() {
    const ok = window.confirm(t('pets.confirmDelete', { name: p.name, count: p.visitCount }));
    if (!ok) return;
    setBusy(true);
    try {
      await request(`/pets/${p.id}`, { method: 'DELETE' });
      navigate('/pets', { replace: true });
    } catch (err) {
      setActionError(err.message);
      setBusy(false);
    }
  }

  async function handleComplete(visit) {
    setBusy(true);
    setActionError('');
    try {
      await request(`/visits/${visit.id}/complete`, { method: 'PATCH' });
      visits.reload();
      pet.reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (pet.error)
    return (
      <>
        <Link className="back-button" to="/pets">
          <Icon name="back" size={15} /> {t('petDetails.back')}
        </Link>
        <Alert>{pet.error}</Alert>
      </>
    );
  if (!p) return <Loader />;

  const list = visits.data?.visits ?? [];
  const planned = list.filter((v) => v.status === 'planned');
  const done = list.filter((v) => v.status === 'done').reverse();
  const age = formatAge(p.birthDate);

  return (
    <>
      <Link className="back-button" to="/pets">
        <Icon name="back" size={15} /> {t('petDetails.back')}
      </Link>
      <Alert>{actionError || visits.error}</Alert>
      <section className="pet-hero">
        <PetAvatar pet={p} size={150} radius={22} className="pet-hero-photo" />
        <div className="pet-hero-copy">
          <span className="status-pill">
            <i />
            {p.nextVisit
              ? t('petDetails.nextVisit', { date: formatDateTime(p.nextVisit) })
              : t('petDetails.noPlanned')}
          </span>
          <h2>{p.name}</h2>
          <p>{[p.species, p.breed, age].filter(Boolean).join(' · ')}</p>
          <div className="hero-actions">
            <Link className="primary" to={`/visits/new?petId=${p.id}`}>
              <Icon name="calendar" size={17} /> {t('visits.plan')}
            </Link>
            <Link className="secondary" to={`/pets/${p.id}/edit`}>
              <Icon name="edit" size={17} /> {t('common.edit')}
            </Link>
            <button className="secondary danger" onClick={handleDelete} disabled={busy}>
              <Icon name="trash" size={17} /> {t('common.delete')}
            </button>
          </div>
        </div>
      </section>

      <div className="detail-facts">
        <DetailFact label={t('petDetails.species')} value={p.species} icon="paw" />
        <DetailFact label={t('petDetails.breed')} value={p.breed || '—'} icon="heart" />
        <DetailFact label={t('pets.birthDate')} value={formatDate(p.birthDate)} icon="calendar" />
        <DetailFact label={t('pets.weight')} value={formatWeight(p.weight)} icon="scale" />
      </div>

      <div className="detail-columns">
        <section className="section-card">
          <div className="section-head">
            <h3>{t('petDetails.notes')}</h3>
            <Link to={`/pets/${p.id}/edit`}>
              {t('common.edit')} <Icon name="edit" size={14} />
            </Link>
          </div>
          {p.notes ? (
            <p className="notes">{p.notes}</p>
          ) : (
            <p className="notes muted">{t('petDetails.noNotes')}</p>
          )}
        </section>
        <section className="section-card">
          <div className="section-head">
            <h3>{t('petDetails.visits', { count: p.visitCount })}</h3>
            <Link to={`/visits/new?petId=${p.id}`}>
              {t('common.add')} <Icon name="plus" size={14} />
            </Link>
          </div>
          {!visits.data ? (
            !visits.error && <Loader />
          ) : list.length === 0 ? (
            <EmptyState icon="calendar" title={t('petDetails.noVisits')}>
              {t('petDetails.noVisitsText')}
            </EmptyState>
          ) : (
            <>
              {planned.length > 0 && <p className="timeline-label">{t('petDetails.planned')}</p>}
              <Timeline visits={planned} onComplete={handleComplete} busy={busy} />
              {done.length > 0 && <p className="timeline-label">{t('petDetails.history')}</p>}
              <Timeline visits={done} onComplete={handleComplete} busy={busy} />
            </>
          )}
        </section>
      </div>
    </>
  );
}
