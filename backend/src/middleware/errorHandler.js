import { HttpError } from '../utils/httpError.js';
import { translate, translateDetails } from '../utils/i18n.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, `Nie znaleziono: ${req.method} ${req.originalUrl}`));
}

// Wszystkie błędy API zwracane są w formacie: { error: string, details?: object }
// Komunikaty tłumaczone są na język klienta (req.lang); req.lang może nie istnieć,
// jeśli błąd wystąpił przed middleware języka.
export function errorHandler(err, req, res, _next) {
  const lang = req.lang ?? 'pl';
  const send = (status, message, details) =>
    res
      .status(status)
      .json({ error: translate(message, lang), details: translateDetails(details, lang) });

  if (err instanceof HttpError) {
    return send(err.status, err.message, err.details);
  }
  if (err.type === 'entity.parse.failed') {
    return send(400, 'Niepoprawny format JSON w treści żądania.');
  }
  if (err.type === 'entity.too.large') {
    return send(413, 'Treść żądania jest za duża.');
  }
  // Pozostałe błędy klienta zgłaszane przez Express (np. nieobsługiwane kodowanie)
  if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    return send(err.status, 'Niepoprawne żądanie.');
  }
  console.error(err);
  send(500, 'Wewnętrzny błąd serwera.');
}
