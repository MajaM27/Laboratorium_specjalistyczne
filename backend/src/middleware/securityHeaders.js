// Podstawowe nagłówki bezpieczeństwa dla wszystkich odpowiedzi:
// - nosniff – przeglądarka nie zgaduje typu treści,
// - X-Frame-Options: DENY – strony i odpowiedzi nie mogą być osadzane w ramkach (clickjacking),
// - no-referrer – adres nie wycieka w nagłówku Referer.
export function securityHeaders(_req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
  });
  next();
}

// Odpowiedzi API (JSON) nie mogą ładować ani wykonywać żadnych zasobów
export function apiContentSecurityPolicy(_req, res, next) {
  res.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  next();
}
