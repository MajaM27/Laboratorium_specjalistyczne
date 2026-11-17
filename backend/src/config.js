import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Brak wymaganej zmiennej środowiskowej: ${name} (sprawdź backend/.env)`);
  }
  return value;
}

function integer(name, fallback, { min, max }) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`Zmienna ${name} musi być liczbą całkowitą z zakresu ${min}–${max}.`);
  }
  return value;
}

// ":memory:" – baza w pamięci (używana w testach), w pozostałych przypadkach ścieżka do pliku
function databasePath() {
  const value = process.env.DATABASE_PATH || './data/petcare.db';
  return value === ':memory:' ? value : path.resolve(backendRoot, value);
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: integer('PORT', 3001, { min: 1, max: 65535 }),
  databasePath: databasePath(),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptRounds: integer('BCRYPT_ROUNDS', 10, { min: 4, max: 15 }),
  // Limit nieudanych prób logowania/rejestracji z jednego adresu IP
  authRateLimitMax: integer('AUTH_RATE_LIMIT_MAX', 10, { min: 1, max: 1_000_000 }),
  authRateLimitWindowMinutes: integer('AUTH_RATE_LIMIT_WINDOW_MINUTES', 15, { min: 1, max: 1440 }),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5180',
};

if (config.env === 'production' && config.jwtSecret.length < 32) {
  throw new Error('W produkcji JWT_SECRET musi mieć co najmniej 32 znaki.');
}
