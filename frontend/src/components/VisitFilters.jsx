import { useI18n } from '../context/language.js';

// Filtry listy wizyt: zwierzę i zakres dat (F-S-02)
export default function VisitFilters({ pets, filters, onChange }) {
  const { t } = useI18n();
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const active = filters.petId || filters.from || filters.to;
  return (
    <div className="filters">
      <label>
        <span>{t('filters.pet')}</span>
        <select value={filters.petId} onChange={set('petId')}>
          <option value="">{t('filters.allPets')}</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t('filters.from')}</span>
        <input
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={set('from')}
        />
      </label>
      <label>
        <span>{t('filters.to')}</span>
        <input
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={set('to')}
        />
      </label>
      {active && (
        <button
          type="button"
          className="text-link filters-clear"
          onClick={() => onChange({ petId: '', from: '', to: '' })}
        >
          {t('filters.clear')}
        </button>
      )}
    </div>
  );
}
