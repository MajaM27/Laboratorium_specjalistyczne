import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { EmptyState, Loader } from '../components/States.jsx';
import { useAuth } from '../context/auth.js';
import { useApiData } from '../hooks/useApiData.js';
import { formatDateTime, nowISO } from '../utils/format.js';
import { useI18n } from '../context/language.js';

function validate(form, t) {
  const errors = {};
  if (!form.petId) errors.petId = t('visitForm.errorPet');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(form.visitDateTime))
    errors.visitDateTime = t('visitForm.errorDateTime');
  if (!form.clinic.trim()) errors.clinic = t('visitForm.errorClinic');
  if (!form.purpose.trim()) errors.purpose = t('visitForm.errorPurpose');
  return errors;
}

function VisitForm({ visit, pets, defaultPetId }) {
  const { request } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState(
    visit
      ? {
          petId: String(visit.petId),
          visitDateTime: visit.visitDateTime,
          clinic: visit.clinic,
          purpose: visit.purpose,
          status: visit.status,
        }
      : { petId: defaultPetId, visitDateTime: '', clinic: '', purpose: '', status: 'planned' },
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const isPast = form.visitDateTime && form.visitDateTime < nowISO();

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form, t);
    setErrors(found);
    setError(Object.keys(found).length ? t('common.fixFields') : '');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await request(visit ? `/visits/${visit.id}` : '/visits', {
        method: visit ? 'PUT' : 'POST',
        body: { ...form, petId: Number(form.petId) },
      });
      navigate(form.status === 'done' ? '/history' : '/visits', { replace: true });
    } catch (err) {
      setError(err.message);
      setErrors(err.details || {});
      setBusy(false);
    }
  }

  return (
    <div className="form-layout">
      <section className="form-card">
        <div className="form-card-head">
          <span>
            <Icon name="calendar" />
          </span>
          <div>
            <h3>{visit ? t('visitForm.headEdit') : t('visitForm.headNew')}</h3>
            <p>{t('visitForm.lead')}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <Alert>{error}</Alert>
          <div className="form-grid">
            <Field label={t('visitForm.pet')} error={errors.petId}>
              <select
                value={form.petId}
                onChange={update('petId')}
                aria-invalid={Boolean(errors.petId)}
              >
                <option value="">{t('visitForm.choosePet')}</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t('visitForm.dateTime')}
              type="datetime-local"
              value={form.visitDateTime}
              onChange={update('visitDateTime')}
              error={errors.visitDateTime}
            />
            <Field
              label={t('visitForm.clinic')}
              value={form.clinic}
              maxLength={100}
              placeholder={t('visitForm.clinicPlaceholder')}
              onChange={update('clinic')}
              error={errors.clinic}
            />
            <Field label={t('visitForm.status')} error={errors.status}>
              <select value={form.status} onChange={update('status')}>
                <option value="planned">{t('visitForm.statusPlanned')}</option>
                <option value="done">{t('visitForm.statusDone')}</option>
              </select>
            </Field>
            <Field
              as="textarea"
              wide
              label={t('visitForm.purpose')}
              value={form.purpose}
              maxLength={200}
              placeholder={t('visitForm.purposePlaceholder')}
              onChange={update('purpose')}
              error={errors.purpose}
            />
          </div>
          {isPast && form.status === 'planned' && (
            <p className="form-hint">{t('visitForm.pastHint')}</p>
          )}
          <div className="form-buttons">
            <button className="secondary" type="button" onClick={() => navigate(-1)}>
              {t('common.cancel')}
            </button>
            <button className="primary" type="submit" disabled={busy}>
              <Icon name="check" size={18} /> {busy ? t('common.saving') : t('visitForm.submit')}
            </button>
          </div>
        </form>
      </section>
      <aside className="upload-card">
        <h3>{t('visitForm.summary')}</h3>
        <p>{t('visitForm.summaryText')}</p>
        <dl className="summary-list">
          <dt>{t('visitForm.pet')}</dt>
          <dd>{pets.find((p) => String(p.id) === form.petId)?.name || '—'}</dd>
          <dt>{t('visitForm.summaryDate')}</dt>
          <dd>{form.visitDateTime ? formatDateTime(form.visitDateTime) : '—'}</dd>
          <dt>{t('visitForm.summaryClinic')}</dt>
          <dd>{form.clinic || '—'}</dd>
          <dt>{t('visitForm.status')}</dt>
          <dd>{form.status === 'done' ? t('visits.statusDone') : t('visits.statusPlanned')}</dd>
        </dl>
      </aside>
    </div>
  );
}

// Dodawanie i edycja wizyty (F-M-06, F-M-08)
export default function VisitFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const pets = useApiData('/pets');
  const visit = useApiData(id ? `/visits/${id}` : null);
  const { t } = useI18n();
  usePageMeta(
    id ? t('visitForm.titleEdit') : t('visitForm.titleNew'),
    id ? t('visitForm.subtitleEdit') : t('visitForm.subtitleNew'),
  );

  const error = pets.error || visit.error;
  if (error) return <Alert>{error}</Alert>;
  if (!pets.data || (id && !visit.data)) return <Loader />;

  if (pets.data.pets.length === 0)
    return (
      <EmptyState
        title={t('visitForm.noPets')}
        action={
          <Link className="primary" to="/pets/new">
            <Icon name="plus" size={18} /> {t('pets.add')}
          </Link>
        }
      >
        {t('visitForm.noPetsText')}
      </EmptyState>
    );

  return (
    <VisitForm
      key={id || 'new'}
      visit={visit.data?.visit}
      pets={pets.data.pets}
      defaultPetId={searchParams.get('petId') || ''}
    />
  );
}
