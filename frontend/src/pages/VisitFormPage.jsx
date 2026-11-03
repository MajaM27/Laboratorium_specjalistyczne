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

function validate(form) {
  const errors = {};
  if (!form.petId) errors.petId = 'Wybierz zwierzę.';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(form.visitDateTime))
    errors.visitDateTime = 'Podaj datę i godzinę wizyty.';
  if (!form.clinic.trim()) errors.clinic = 'Pole „Gabinet” jest wymagane.';
  if (!form.purpose.trim()) errors.purpose = 'Pole „Cel wizyty” jest wymagane.';
  return errors;
}

function VisitForm({ visit, pets, defaultPetId }) {
  const { request } = useAuth();
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
    const found = validate(form);
    setErrors(found);
    setError(Object.keys(found).length ? 'Popraw zaznaczone pola formularza.' : '');
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
            <h3>{visit ? 'Edycja wizyty' : 'Nowa wizyta u weterynarza'}</h3>
            <p>Wszystkie pola są wymagane.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <Alert>{error}</Alert>
          <div className="form-grid">
            <Field label="Zwierzę" error={errors.petId}>
              <select
                value={form.petId}
                onChange={update('petId')}
                aria-invalid={Boolean(errors.petId)}
              >
                <option value="">Wybierz zwierzę…</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Data i godzina"
              type="datetime-local"
              value={form.visitDateTime}
              onChange={update('visitDateTime')}
              error={errors.visitDateTime}
            />
            <Field
              label="Gabinet weterynaryjny"
              value={form.clinic}
              maxLength={100}
              placeholder="np. VetCare Lublin"
              onChange={update('clinic')}
              error={errors.clinic}
            />
            <Field label="Status" error={errors.status}>
              <select value={form.status} onChange={update('status')}>
                <option value="planned">Zaplanowana</option>
                <option value="done">Zakończona (historia)</option>
              </select>
            </Field>
            <Field
              as="textarea"
              wide
              label="Cel wizyty"
              value={form.purpose}
              maxLength={200}
              placeholder="np. Szczepienie przeciw wściekliźnie, kontrola okresowa…"
              onChange={update('purpose')}
              error={errors.purpose}
            />
          </div>
          {isPast && form.status === 'planned' && (
            <p className="form-hint">
              Wybrana data jest w przeszłości. Jeśli wizyta już się odbyła, ustaw status
              „Zakończona”.
            </p>
          )}
          <div className="form-buttons">
            <button className="secondary" type="button" onClick={() => navigate(-1)}>
              Anuluj
            </button>
            <button className="primary" type="submit" disabled={busy}>
              <Icon name="check" size={18} /> {busy ? 'Zapisywanie…' : 'Zapisz wizytę'}
            </button>
          </div>
        </form>
      </section>
      <aside className="upload-card">
        <h3>Podsumowanie</h3>
        <p>Sprawdź dane przed zapisaniem.</p>
        <dl className="summary-list">
          <dt>Zwierzę</dt>
          <dd>{pets.find((p) => String(p.id) === form.petId)?.name || '—'}</dd>
          <dt>Termin</dt>
          <dd>{form.visitDateTime ? formatDateTime(form.visitDateTime) : '—'}</dd>
          <dt>Gabinet</dt>
          <dd>{form.clinic || '—'}</dd>
          <dt>Status</dt>
          <dd>{form.status === 'done' ? 'Zakończona' : 'Zaplanowana'}</dd>
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
  usePageMeta(
    id ? 'Edycja wizyty' : 'Nowa wizyta',
    id ? 'Zmień termin lub szczegóły wizyty.' : 'Zaplanuj wizytę u weterynarza.',
  );

  const error = pets.error || visit.error;
  if (error) return <Alert>{error}</Alert>;
  if (!pets.data || (id && !visit.data)) return <Loader />;

  if (pets.data.pets.length === 0)
    return (
      <EmptyState
        title="Najpierw dodaj zwierzę"
        action={
          <Link className="primary" to="/pets/new">
            <Icon name="plus" size={18} /> Dodaj zwierzę
          </Link>
        }
      >
        Wizyta musi być przypisana do jednego z Twoich zwierząt.
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
