import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { config } from '../config.js';

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');

const inMemory = config.databasePath === ':memory:';
if (!inMemory) fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new Database(config.databasePath);
if (!inMemory) db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Tworzy tabele, jeśli jeszcze nie istnieją (bezpieczne przy każdym starcie)
export function applySchema() {
  db.exec(fs.readFileSync(schemaPath, 'utf8'));
}
