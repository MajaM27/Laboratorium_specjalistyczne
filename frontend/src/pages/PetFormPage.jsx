import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import PetAvatar from '../components/PetAvatar.jsx';
import { Loader } from '../components/States.jsx';
import { useAuth } from '../context/auth.js';
import { useApiData } from '../hooks/useApiData.js';
import { formatAge, todayISO } from '../utils/format.js';

const SPECIES = ['Pies', 'Kot', 'Królik', 'Chomik', 'Świnka morska', 'Papuga', 'Rybki', 'Żółw'];
const EMPTY = { name: '', species: '', breed: '', birthDate: '', weight: '', notes: '' };

function toForm(pet) {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? '',
    birthDate: pet.birthDate ?? '',
    weight: pet.weight == null ? '' : String(pet.weight),
    notes: pet.notes ?? '',
  };
}

// Walidacja dla wygody – ostateczna i tak odbywa się w backendzie
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Pole „Imię” jest wymagane.';
  if (!form.species.trim()) errors.species = 'Pole „Gatunek” jest wymagane.';
  if (form.birthDate && form.birthDate > todayISO())
    errors.birthDate = 'Data urodzenia nie może być z przyszłości.';
  if (form.weight) {
    const w = Number(form.weight.replace(',', '.'));
    if (!Number.isFinite(w) || w <= 0 || w > 1000)
      errors.weight = 'Waga musi być liczbą większą od 0 (maks. 1000 kg).';
  }
  return errors;
}

function PetForm({ pet }) {
  const { request } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(pet ? toForm(pet) : EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setError(Object.keys(found).length ? 'Popraw zaznaczone pola formularza.' : '');
    if (Object.keys(found).length) return;

    const body = {
      ...form,
      weight: form.weight ? Number(form.weight.replace(',', '.')) : null,
    };
    setBusy(true);
    try {
      const data = await request(pet ? `/pets/${pet.id}` : '/pets', {
        method: pet ? 'PUT' : 'POST',
        body,
      });
      navigate(`/pets/${data.pet.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setErrors(err.details || {});
      setBusy(false);
    }
  }

  const preview = { id: pet?.id ?? 0, name: form.name || '?' };

  return (
    <div className="form-layout">
      <section className="form-card">
        <div className="form-card-head">
          <span>
            <Icon name="paw" />
          </span>
          <div>
            <h3>{pet ? `Edycja profilu: ${pet.name}` : 'Opowiedz nam o swoim zwierzęciu'}</h3>
            <p>Pola oznaczone * są wymagane. Dane możesz zmienić w każdej chwili.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <Alert>{error}</Alert>
          <div className="form-grid">
            <Field
              label="Imię *"
              value={form.name}
              maxLength={50}
              placeholder="np. Rex"
              onChange={update('name')}
              error={errors.name}
              autoFocus={!pet}
            />
            <Field
              label="Gatunek *"
              value={form.species}
              maxLength={50}
              placeholder="np. Pies"
              list="species-list"
              onChange={update('species')}
              error={errors.species}
            />
            <datalist id="species-list">
              {SPECIES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <Field
              label="Rasa"
              value={form.breed}
              maxLength={50}
              placeholder="np. Labrador"
              onChange={update('breed')}
              error={errors.breed}
            />
            <Field
              label="Data urodzenia"
              type="date"
              value={form.birthDate}
              max={todayISO()}
              onChange={update('birthDate')}
              error={errors.birthDate}
            />
            <Field
              label="Waga (kg)"
              inputMode="decimal"
              value={form.weight}
              placeholder="np. 12,5"
              onChange={update('weight')}
              error={errors.weight}
            />
            <Field
              as="textarea"
              wide
              label="Notatki o opiece"
              value={form.notes}
              maxLength={1000}
              placeholder="Alergie, nawyki, ulubione przysmaki…"
              onChange={update('notes')}
              error={errors.notes}
            />
          </div>
          <div className="form-buttons">
            <Link className="secondary" to={pet ? `/pets/${pet.id}` : '/pets'}>
              Anuluj
            </Link>
            <button className="primary" type="submit" disabled={busy}>
              <Icon name="check" size={18} /> {busy ? 'Zapisywanie…' : 'Zapisz profil'}
            </button>
          </div>
        </form>
      </section>
      <aside className="upload-card">
        <h3>Podgląd</h3>
        <p>Tak zwierzę będzie widoczne na listach.</p>
        <div className="preview-tile">
          <PetAvatar pet={preview} size={110} radius={30} />
          <b>{form.name || 'Imię zwierzęcia'}</b>
          <small>
            {[form.species, form.breed, formatAge(form.birthDate)].filter(Boolean).join(' · ') ||
              'gatunek · rasa · wiek'}
          </small>
        </div>
      </aside>
    </div>
  );
}

// Dodawanie i edycja zwierzęcia (F-M-03, F-M-05)
export default function PetFormPage() {
  const { id } = useParams();
  const { data, error } = useApiData(id ? `/pets/${id}` : null);
  usePageMeta(
    id ? 'Edycja zwierzęcia' : 'Nowe zwierzę',
    id ? 'Zaktualizuj dane swojego pupila.' : 'Utwórz profil swojego pupila.',
  );

  if (!id) return <PetForm />;
  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Loader />;
  return <PetForm key={data.pet.id} pet={data.pet} />;
}
