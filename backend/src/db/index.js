import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { config } from '../config.js';
import { migrate } from './migrations.js';

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');

const inMemory = config.databasePath === ':memory:';
if (!inMemory) fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new Database(config.databasePath);
if (!inMemory) db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Wbudowane LIKE / lower() / COLLATE NOCASE w SQLite rozróżniają wielkość liter tylko dla ASCII
// („łat” nie znalazłoby „Łatka”). Funkcja pl_lower zamienia litery na małe zgodnie z językiem polskim.
db.function('pl_lower', { deterministic: true }, (value) =>
  typeof value === 'string' ? value.toLocaleLowerCase('pl') : value,
);

// Tworzy tabele, jeśli jeszcze nie istnieją, i stosuje brakujące migracje
// (bezpieczne przy każdym starcie)
export function applySchema() {
  db.exec(fs.readFileSync(schemaPath, 'utf8'));
  migrate(db);
}
