import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { HttpError } from '../utils/httpError.js';

// Akceptujemy tylko ten algorytm – token podpisany inaczej (np. "none") zostanie odrzucony
const JWT_ALGORITHM = 'HS256';

// `ver` = users.token_version w chwili wydania tokenu; zmiana hasła zwiększa wersję,
// więc wszystkie wcześniej wydane tokeny (np. na innych urządzeniach) przestają działać
export function signToken(user) {
  return jwt.sign({ sub: String(user.id), ver: user.token_version }, config.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: config.jwtExpiresIn,
  });
}

// Wymaga nagłówka "Authorization: Bearer <token>". Ustawia req.user = { id, email, token_version }.
export function requireAuth(req, _res, next) {
  const [scheme, token, ...rest] = (req.headers.authorization ?? '').trim().split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
    return next(new HttpError(401, 'Zaloguj się, aby kontynuować.'));
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: [JWT_ALGORITHM] });
  } catch {
    return next(new HttpError(401, 'Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.'));
  }

  // Konto mogło zostać usunięte po wydaniu tokenu, a hasło – zmienione
  const user = db
    .prepare('SELECT id, email, token_version FROM users WHERE id = ?')
    .get(Number(payload.sub));
  if (!user || (payload.ver ?? 0) !== user.token_version) {
    return next(new HttpError(401, 'Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.'));
  }

  req.user = user;
  next();
}
