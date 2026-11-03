import { Router } from 'express';
import { db } from '../db/index.js';
import { HttpError } from '../utils/httpError.js';
import { parsePetInput } from '../utils/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const PET_COLUMNS = `
  p.id, p.name, p.species, p.breed, p.birth_date, p.weight, p.notes, p.created_at, p.updated_at,
  (SELECT COUNT(*) FROM visits v WHERE v.pet_id = p.id) AS visit_count,
  (SELECT MIN(v.visit_datetime) FROM visits v
    WHERE v.pet_id = p.id AND v.status = 'planned') AS next_visit`;

function toPet(row) {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    birthDate: row.birth_date,
    weight: row.weight,
    notes: row.notes,
    visitCount: row.visit_count,
    nextVisit: row.next_visit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Zwraca zwierzę tylko, jeśli należy do zalogowanego użytkownika; cudze lub nieistniejące → 404
function findOwnPet(userId, rawId) {
  const id = Number(rawId);
  const row = Number.isInteger(id)
    ? db
        .prepare(`SELECT ${PET_COLUMNS} FROM pets p WHERE p.id = ? AND p.user_id = ?`)
        .get(id, userId)
    : undefined;
  if (!row) throw new HttpError(404, 'Nie znaleziono zwierzęcia.');
  return row;
}

// Lista zwierząt użytkownika, opcjonalnie wyszukiwanie po imieniu: GET /api/pets?search=re
router.get('/', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  // Znaki % i _ w wyszukiwanej frazie traktujemy dosłownie
  const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;

  const rows = db
    .prepare(
      `SELECT ${PET_COLUMNS} FROM pets p
       WHERE p.user_id = ? AND p.name LIKE ? ESCAPE '\\'
       ORDER BY p.name COLLATE NOCASE`,
    )
    .all(req.user.id, pattern);

  res.json({ pets: rows.map(toPet), total: rows.length });
});

router.get('/:id', (req, res) => {
  res.json({ pet: toPet(findOwnPet(req.user.id, req.params.id)) });
});

router.post('/', (req, res) => {
  const pet = parsePetInput(req.body);
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO pets (user_id, name, species, breed, birth_date, weight, notes)
       VALUES (@user_id, @name, @species, @breed, @birth_date, @weight, @notes)`,
    )
    .run({ ...pet, user_id: req.user.id });

  res.status(201).json({ pet: toPet(findOwnPet(req.user.id, lastInsertRowid)) });
});

router.put('/:id', (req, res) => {
  const existing = findOwnPet(req.user.id, req.params.id);
  const pet = parsePetInput(req.body);

  db.prepare(
    `UPDATE pets
     SET name = @name, species = @species, breed = @breed, birth_date = @birth_date,
         weight = @weight, notes = @notes, updated_at = datetime('now')
     WHERE id = @id`,
  ).run({ ...pet, id: existing.id });

  res.json({ pet: toPet(findOwnPet(req.user.id, existing.id)) });
});

// Usuwa zwierzę razem z jego wizytami (ON DELETE CASCADE)
router.delete('/:id', (req, res) => {
  const existing = findOwnPet(req.user.id, req.params.id);
  db.prepare('DELETE FROM pets WHERE id = ?').run(existing.id);
  res.status(204).end();
});

export default router;
