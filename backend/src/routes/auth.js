import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { HttpError } from '../utils/httpError.js';
import { assertValid, validateEmail, validatePassword } from '../utils/validation.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { translate } from '../utils/i18n.js';

const router = Router();

// Skrót porównywany, gdy konto nie istnieje – odpowiedź trwa tyle samo, co przy złym haśle
const DUMMY_HASH = bcrypt.hashSync('dummy-password', config.bcryptRounds);

function publicUser(user) {
  return { id: user.id, email: user.email, createdAt: user.created_at };
}

function emailTaken() {
  return new HttpError(409, 'Konto z tym adresem e-mail już istnieje.', {
    email: 'Ten adres e-mail jest już zajęty.',
  });
}

// Sprawdza hasło zalogowanego użytkownika (zmiana hasła, usunięcie konta).
// Złe hasło → 400 z błędem pola, a nie 401 – 401 oznacza wygasłą sesję i wylogowuje we frontendzie.
async function assertCurrentPassword(userId, password, field) {
  if (typeof password !== 'string' || password === '') {
    assertValid({ [field]: 'Hasło jest wymagane.' });
  }
  const { password_hash } = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
  if (!(await bcrypt.compare(password, password_hash))) {
    assertValid({ [field]: 'Nieprawidłowe hasło.' });
  }
}

// PU-01 – rejestracja
// Haszowanie jest asynchroniczne – nie blokuje obsługi innych żądań.
router.post('/register', async (req, res) => {
  const { email, password } = req.body ?? {};
  assertValid({ email: validateEmail(email), password: validatePassword(password) });

  const normalizedEmail = email.trim().toLowerCase();
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalizedEmail)) throw emailTaken();

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  let lastInsertRowid;
  try {
    ({ lastInsertRowid } = db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run(normalizedEmail, passwordHash));
  } catch (err) {
    // Dwie równoczesne rejestracje tego samego adresu – drugą zatrzymuje UNIQUE w bazie
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') throw emailTaken();
    throw err;
  }

  const user = db
    .prepare('SELECT id, email, created_at FROM users WHERE id = ?')
    .get(lastInsertRowid);
  res.status(201).json({
    message: translate('Konto zostało utworzone. Możesz się zalogować.', req.lang),
    user: publicUser(user),
  });
});

// PU-02 – logowanie
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new HttpError(400, 'Podaj adres e-mail i hasło.');
  }

  const user = db
    .prepare('SELECT id, email, password_hash, created_at FROM users WHERE email = ?')
    .get(email.trim().toLowerCase());
  const passwordOk = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

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

// Zmiana hasła: { currentPassword, newPassword }
router.put('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  assertValid({ newPassword: validatePassword(newPassword) });
  await assertCurrentPassword(req.user.id, currentPassword, 'currentPassword');
  if (currentPassword === newPassword) {
    assertValid({ newPassword: 'Nowe hasło musi różnić się od obecnego.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, req.user.id);
  res.json({ message: translate('Hasło zostało zmienione.', req.lang) });
});

// Usunięcie konta razem ze zwierzętami i wizytami (ON DELETE CASCADE): { password }
router.delete('/me', requireAuth, async (req, res) => {
  await assertCurrentPassword(req.user.id, req.body?.password, 'password');
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  res.status(204).end();
});

export default router;
