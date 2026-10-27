import { HttpError } from '../utils/httpError.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, `Nie znaleziono: ${req.method} ${req.originalUrl}`));
}

// Wszystkie błędy API zwracane są w formacie: { error: string, details?: object }
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Niepoprawny format JSON w treści żądania.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
}
