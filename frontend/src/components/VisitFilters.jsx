// Filtry listy wizyt: zwierzę i zakres dat (F-S-02)
export default function VisitFilters({ pets, filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const active = filters.petId || filters.from || filters.to;
  return (
    <div className="filters">
      <label>
        <span>Zwierzę</span>
        <select value={filters.petId} onChange={set('petId')}>
          <option value="">Wszystkie zwierzęta</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Od dnia</span>
        <input
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={set('from')}
        />
      </label>
      <label>
        <span>Do dnia</span>
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
          Wyczyść filtry
        </button>
      )}
    </div>
  );
}
