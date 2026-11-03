import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { petColors } from '../utils/petColors.js';
import { EmptyState, Loader } from '../components/States.jsx';
import { useAuth } from '../context/auth.js';
import { useApiData } from '../hooks/useApiData.js';
import { useDebounced } from '../hooks/useDebounced.js';
import { formatAge, formatDate, formatDateTime, formatWeight } from '../utils/format.js';

function PetCard({ pet, onDelete, busy }) {
  const [bg, fg] = petColors(pet.id);
  return (
    <article className="pet-card">
      <div className="pet-card-image" style={{ background: bg, color: fg }}>
        <span className="pet-card-initial">{pet.name.charAt(0).toUpperCase()}</span>
        <span className="pet-card-species">{pet.species}</span>
        <div className="card-tools">
          <Link to={`/pets/${pet.id}/edit`} title="Edytuj" aria-label={`Edytuj ${pet.name}`}>
            <Icon name="edit" size={17} />
          </Link>
          <button
            onClick={() => onDelete(pet)}
            disabled={busy}
            title="Usuń"
            aria-label={`Usuń ${pet.name}`}
          >
            <Icon name="trash" size={17} />
          </button>
        </div>
      </div>
      <div className="pet-card-body">
        <h3>{pet.name}</h3>
        <p>
          {[pet.breed || 'Rasa nieznana', formatAge(pet.birthDate)].filter(Boolean).join(' · ')}
        </p>
        <div className="pet-facts">
          <span>
            <small>Data urodzenia</small>
            <b>{formatDate(pet.birthDate)}</b>
          </span>
          <span>
            <small>Waga</small>
            <b>{formatWeight(pet.weight)}</b>
          </span>
          <span className="pet-facts-wide">
            <small>Najbliższa wizyta</small>
            <b>{pet.nextVisit ? formatDateTime(pet.nextVisit) : 'brak zaplanowanych'}</b>
          </span>
        </div>
        <Link className="outline-button" to={`/pets/${pet.id}`}>
          Szczegóły <Icon name="arrow" size={16} />
        </Link>
      </div>
    </article>
  );
}

// Lista zwierząt z wyszukiwaniem po imieniu (F-M-04, F-S-01)
export default function PetsPage() {
  usePageMeta('Moje zwierzęta', 'Wszyscy Twoi podopieczni w jednym miejscu.');
  const { request } = useAuth();
  const [search, setSearch] = useState('');
  const query = useDebounced(search.trim());
  const { data, error, reload } = useApiData(
    `/pets${query ? `?search=${encodeURIComponent(query)}` : ''}`,
  );
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  async function handleDelete(pet) {
    const ok = window.confirm(
      `Usunąć zwierzę „${pet.name}”? Zostaną usunięte także wszystkie jego wizyty (${pet.visitCount}).`,
    );
    if (!ok) return;
    setBusy(true);
    setActionError('');
    try {
      await request(`/pets/${pet.id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-actions">
        <label className="search-box">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Szukaj po imieniu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Szukaj zwierzęcia po imieniu"
          />
        </label>
        <Link className="primary" to="/pets/new">
          <Icon name="plus" size={18} /> Dodaj zwierzę
        </Link>
      </div>

      <Alert>{error || actionError}</Alert>

      {!data ? (
        !error && <Loader />
      ) : data.pets.length === 0 ? (
        query ? (
          <EmptyState icon="search" title="Brak wyników">
            Nie znaleziono zwierzęcia o imieniu zawierającym „{query}”.
          </EmptyState>
        ) : (
          <EmptyState
            title="Nie masz jeszcze żadnych zwierząt"
            action={
              <Link className="primary" to="/pets/new">
                <Icon name="plus" size={18} /> Dodaj pierwsze zwierzę
              </Link>
            }
          >
            Dodaj profil swojego pupila, aby planować wizyty i prowadzić jego historię.
          </EmptyState>
        )
      ) : (
        <div className="pet-grid">
          {data.pets.map((p) => (
            <PetCard key={p.id} pet={p} onDelete={handleDelete} busy={busy} />
          ))}
          {!query && (
            <Link className="add-pet-card" to="/pets/new">
              <span>
                <Icon name="plus" size={28} />
              </span>
              <b>Dodaj kolejne zwierzę</b>
              <small>Utwórz profil dla swojego pupila</small>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
