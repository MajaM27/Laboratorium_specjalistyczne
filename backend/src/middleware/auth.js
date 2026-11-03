import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { HttpError } from '../utils/httpError.js';

export function signToken(user) {
  return jwt.sign({ sub: String(user.id) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

// Wymaga nagłówka "Authorization: Bearer <token>". Ustawia req.user = { id, email }.
export function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Zaloguj się, aby kontynuować.'));
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return next(new HttpError(401, 'Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.'));
  }

  // Konto mogło zostać usunięte po wydaniu tokenu
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(Number(payload.sub));
  if (!user) {
    return next(new HttpError(401, 'Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.'));
  }

  req.user = user;
  next();
}
