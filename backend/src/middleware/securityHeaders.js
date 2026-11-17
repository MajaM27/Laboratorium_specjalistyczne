// Podstawowe nagłówki bezpieczeństwa dla odpowiedzi API (JSON):
// - nosniff – przeglądarka nie zgaduje typu treści,
// - DENY / frame-ancestors – odpowiedzi API nie mogą być osadzane w ramkach,
// - CSP default-src 'none' – odpowiedź API nie może ładować ani wykonywać żadnych zasobów,
// - no-referrer – adres nie wycieka w nagłówku Referer.
export function securityHeaders(_req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Referrer-Policy': 'no-referrer',
  });
  next();
}
