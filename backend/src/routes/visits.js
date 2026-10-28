import { Router } from 'express';
import { db } from '../db/index.js';
import { HttpError } from '../utils/httpError.js';
import { assertValid, isValidDate, parseVisitInput, VISIT_STATUSES } from '../utils/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Wizyty nie mają kolumny user_id – właściciela sprawdzamy przez JOIN z pets
export const VISIT_SELECT = `
  SELECT v.id, v.pet_id, p.name AS pet_name, p.species AS pet_species, v.visit_datetime,
         v.clinic, v.purpose, v.status, v.created_at, v.updated_at
  FROM visits v JOIN pets p ON p.id = v.pet_id`;

export function toVisit(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    petName: row.pet_name,
    petSpecies: row.pet_species,
    visitDateTime: row.visit_datetime,
    clinic: row.clinic,
    purpose: row.purpose,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Zwraca wizytę tylko, jeśli dotyczy zwierzęcia zalogowanego użytkownika; inaczej 404
function findOwnVisit(userId, rawId) {
  const id = Number(rawId);
  const row = Number.isInteger(id)
    ? db.prepare(`${VISIT_SELECT} WHERE v.id = ? AND p.user_id = ?`).get(id, userId)
    : undefined;
  if (!row) throw new HttpError(404, 'Nie znaleziono wizyty.');
  return row;
}

// Wybrane w formularzu zwierzę musi należeć do użytkownika – inaczej błąd pola petId
function assertOwnPet(userId, petId) {
  const pet = db.prepare('SELECT 1 FROM pets WHERE id = ? AND user_id = ?').get(petId, userId);
  if (!pet) assertValid({ petId: 'Nie znaleziono wybranego zwierzęcia.' });
}

// Odczytuje filtry listy: ?status=planned|done&from=RRRR-MM-DD&to=RRRR-MM-DD&petId=1
function parseFilters(query) {
  const filters = {};
  const errors = {};
  const value = (name) => (typeof query[name] === 'string' ? query[name].trim() : '');

  const status = value('status');
  if (status) {
    if (VISIT_STATUSES.includes(status)) filters.status = status;
    else errors.status = 'Status musi mieć wartość „planned” lub „done”.';
  }
  for (const name of ['from', 'to']) {
    const date = value(name);
    if (!date) continue;
    if (isValidDate(date)) filters[name] = date;
    else errors[name] = 'Podaj poprawną datę (RRRR-MM-DD).';
  }
  if (filters.from && filters.to && filters.from > filters.to) {
    errors.to = 'Data końcowa nie może być wcześniejsza niż początkowa.';
  }
  const petId = value('petId');
  if (petId) {
    const id = Number(petId);
    if (Number.isInteger(id) && id > 0) filters.petId = id;
    else errors.petId = 'Niepoprawny identyfikator zwierzęcia.';
  }

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'Niepoprawne filtry wizyt.', errors);
  }
  return filters;
}

// Lista wizyt z filtrami (F-M-07, F-S-02). Historia (done) – od najnowszej, pozostałe – chronologicznie.
router.get('/', (req, res) => {
  const filters = parseFilters(req.query);
  const conditions = ['p.user_id = ?'];
  const params = [req.user.id];

  if (filters.status) {
    conditions.push('v.status = ?');
    params.push(filters.status);
  }
  // Daty z filtra porównujemy tekstowo z YYYY-MM-DDTHH:MM – zakres obejmuje całe dni
  if (filters.from) {
    conditions.push('v.visit_datetime >= ?');
    params.push(`${filters.from}T00:00`);
  }
  if (filters.to) {
    conditions.push('v.visit_datetime <= ?');
    params.push(`${filters.to}T23:59`);
  }
  if (filters.petId) {
    conditions.push('v.pet_id = ?');
    params.push(filters.petId);
  }

  const order = filters.status === 'done' ? 'DESC' : 'ASC';
  const rows = db
    .prepare(
      `${VISIT_SELECT} WHERE ${conditions.join(' AND ')}
       ORDER BY v.visit_datetime ${order}, v.id ${order}`,
    )
    .all(...params);

  res.json({ visits: rows.map(toVisit), total: rows.length });
});

router.get('/:id', (req, res) => {
  res.json({ visit: toVisit(findOwnVisit(req.user.id, req.params.id)) });
});

router.post('/', (req, res) => {
  const visit = parseVisitInput(req.body);
  assertOwnPet(req.user.id, visit.pet_id);

  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO visits (pet_id, visit_datetime, clinic, purpose, status)
       VALUES (@pet_id, @visit_datetime, @clinic, @purpose, @status)`,
    )
    .run({ ...visit, status: visit.status ?? 'planned' });

  res.status(201).json({ visit: toVisit(findOwnVisit(req.user.id, lastInsertRowid)) });
});

router.put('/:id', (req, res) => {
  const existing = findOwnVisit(req.user.id, req.params.id);
  const visit = parseVisitInput(req.body);
  assertOwnPet(req.user.id, visit.pet_id);

  db.prepare(
    `UPDATE visits
     SET pet_id = @pet_id, visit_datetime = @visit_datetime, clinic = @clinic,
         purpose = @purpose, status = @status, updated_at = datetime('now')
     WHERE id = @id`,
  ).run({ ...visit, status: visit.status ?? existing.status, id: existing.id });

  res.json({ visit: toVisit(findOwnVisit(req.user.id, existing.id)) });
});

// Oznaczenie wizyty jako zakończonej (F-S-03); ponowne wywołanie niczego nie psuje
router.patch('/:id/complete', (req, res) => {
  const existing = findOwnVisit(req.user.id, req.params.id);
  if (existing.status !== 'done') {
    db.prepare(`UPDATE visits SET status = 'done', updated_at = datetime('now') WHERE id = ?`).run(
      existing.id,
    );
  }
  res.json({ visit: toVisit(findOwnVisit(req.user.id, existing.id)) });
});

router.delete('/:id', (req, res) => {
  const existing = findOwnVisit(req.user.id, req.params.id);
  db.prepare('DELETE FROM visits WHERE id = ?').run(existing.id);
  res.status(204).end();
});

export default router;
