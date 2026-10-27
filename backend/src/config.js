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

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  databasePath: path.resolve(backendRoot, process.env.DATABASE_PATH ?? './data/petcare.db'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5180',
};
