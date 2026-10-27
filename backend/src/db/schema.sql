-- PetCare – schemat bazy danych SQLite
-- Relacje: users 1─* pets 1─* visits

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  species    TEXT    NOT NULL,
  breed      TEXT,
  birth_date TEXT,                         -- format YYYY-MM-DD
  weight     REAL CHECK (weight IS NULL OR weight > 0), -- kg
  notes      TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visits (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id         INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  visit_datetime TEXT    NOT NULL,         -- format YYYY-MM-DDTHH:MM
  clinic         TEXT    NOT NULL,
  purpose        TEXT    NOT NULL,
  status         TEXT    NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'done')),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pets_user_id     ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_pet_id    ON visits(pet_id);
CREATE INDEX IF NOT EXISTS idx_visits_datetime  ON visits(visit_datetime);
