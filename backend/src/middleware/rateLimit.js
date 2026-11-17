import { HttpError } from '../utils/httpError.js';

// Ochrona przed zgadywaniem haseł: limit NIEUDANYCH prób (odpowiedź 4xx) z jednego adresu IP
// w oknie czasowym. Udane logowania nie są liczone, więc zwykły użytkownik nie zostanie zablokowany.
// Licznik trzymamy w pamięci procesu – wystarcza przy jednej instancji serwera.
export function failedAttemptsLimiter({ max, windowMs, now = Date.now }) {
  const attempts = new Map(); // ip -> { count, resetAt }

  function removeExpired(time) {
    for (const [key, entry] of attempts) if (entry.resetAt <= time) attempts.delete(key);
  }

  return function limitFailedAttempts(req, res, next) {
    const key = req.ip ?? 'unknown';
    const time = now();
    if (attempts.size > 10_000) removeExpired(time);

    const entry = attempts.get(key);
    if (entry && entry.resetAt > time && entry.count >= max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - time) / 1000)));
      return next(
        new HttpError(429, 'Zbyt wiele nieudanych prób. Spróbuj ponownie za kilka minut.'),
      );
    }

    res.on('finish', () => {
      if (res.statusCode < 400 || res.statusCode === 429) return;
      const current = attempts.get(key);
      const finishedAt = now();
      if (current && current.resetAt > finishedAt) current.count += 1;
      else attempts.set(key, { count: 1, resetAt: finishedAt + windowMs });
    });
    next();
  };
}
