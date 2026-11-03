import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { HttpError } from '../utils/httpError.js';
import { assertValid, validateEmail, validatePassword } from '../utils/validation.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

// Skrót porównywany, gdy konto nie istnieje – odpowiedź trwa tyle samo, co przy złym haśle
const DUMMY_HASH = bcrypt.hashSync('dummy-password', config.bcryptRounds);

function publicUser(user) {
  return { id: user.id, email: user.email, createdAt: user.created_at };
}

// PU-01 – rejestracja
router.post('/register', (req, res) => {
  const { email, password } = req.body ?? {};
  assertValid({ email: validateEmail(email), password: validatePassword(password) });

  const normalizedEmail = email.trim().toLowerCase();
  const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalizedEmail);
  if (exists) {
    throw new HttpError(409, 'Konto z tym adresem e-mail już istnieje.', {
      email: 'Ten adres e-mail jest już zajęty.',
    });
  }

  const passwordHash = bcrypt.hashSync(password, config.bcryptRounds);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(normalizedEmail, passwordHash);

  const user = db
    .prepare('SELECT id, email, created_at FROM users WHERE id = ?')
    .get(lastInsertRowid);
  res
    .status(201)
    .json({ message: 'Konto zostało utworzone. Możesz się zalogować.', user: publicUser(user) });
});

// PU-02 – logowanie
router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new HttpError(400, 'Podaj adres e-mail i hasło.');
  }

  const user = db
    .prepare('SELECT id, email, password_hash, created_at FROM users WHERE email = ?')
    .get(email.trim().toLowerCase());
  const passwordOk = bcrypt.compareSync(password, user?.password_hash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    throw new HttpError(401, 'Nieprawidłowy adres e-mail lub hasło.');
  }

  res.json({ token: signToken(user), user: publicUser(user) });
});

// Dane zalogowanego użytkownika (frontend sprawdza nim ważność tokenu)
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: publicUser(user) });
});

export default router;
