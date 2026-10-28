# 8. Plan i postęp prac

Pracujemy małymi krokami – każdy krok jest sprawdzany i dokumentowany przed przejściem dalej.
Status: ⬜ do zrobienia · 🟨 w trakcie · ✅ zrobione.

| #   | Krok                                                      | Wymagania                  | Status | Data       |
| --- | --------------------------------------------------------- | -------------------------- | ------ | ---------- |
| 0   | Środowisko: monorepo, pakiety, `.env`, ESLint/Prettier    | NF-M-02, NF-S-03           | ✅     | 2026-10-27 |
| 1   | Baza danych: schemat, init, seed                          | NF-M-03, F-M-09            | ✅     | 2026-10-27 |
| 2   | Backend: rejestracja, logowanie, `requireAuth`            | F-M-01, F-M-02, NF-M-04/05 | ✅     | 2026-10-28 |
| 3   | Backend: CRUD zwierząt + wyszukiwanie                     | F-M-03..05, F-S-01         | ✅     | 2026-10-28 |
| 4   | Backend: CRUD wizyt, filtry, „zakończ”, statystyki        | F-M-06..08, F-S-02/03, F-C | ✅     | 2026-10-28 |
| 5   | Frontend: logowanie, rejestracja, layout, chronione trasy | F-M-01, F-M-02             | ⬜     |            |
| 6   | Frontend: zwierzęta (lista, formularz, szczegóły)         | F-M-03..05, F-S-01/04      | ⬜     |            |
| 7   | Frontend: wizyty i panel główny                           | F-M-06..08, F-S-02/03, F-C | ⬜     |            |
| 8   | Wygląd: responsywność, komunikaty błędów, (ciemny motyw)  | NF-M-01, NF-S-01/02        | ⬜     |            |
| 9   | Dokumentacja końcowa: diagram UCD (draw.io/PNG), zrzuty   | –                          | 🟨     |            |

## Dziennik zmian

### 2026-10-27 – Krok 0 i 1: środowisko i baza

- Monorepo z npm workspaces (`backend/`, `frontend/`), skrypt `npm run dev` uruchamia obie części.
- Backend: Express 5, konfiguracja z `.env`, obsługa błędów, endpoint `GET /api/health`.
- Baza: tabele `users`, `pets`, `visits`, skrypty `db:init`, `db:seed`, `db:reset`.
- Frontend: Vite + React + React Router, proxy `/api`, klient `apiRequest`, strona startowa
  sprawdzająca połączenie z API.
- Narzędzia: ESLint, Prettier, EditorConfig, rekomendowane rozszerzenia VS Code.
- Dokumentacja: `KONTEKST.md` (kontekst aplikacji) i `docs/01…08`.
- Uwagi techniczne: `better-sqlite3` przypięty do wersji 12.x (13.x powoduje segfault na Node 22.12);
  frontend działa na porcie **5180** (5173 bywa zajęty przez inne lokalne projekty).

### 2026-10-28 – Krok 2: autoryzacja w backendzie

- Endpointy `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- Hasła haszowane bcrypt; walidacja e-maila i siły hasła (min. 8 znaków, litera + cyfra).
- E-mail zapisywany małymi literami – logowanie nie zależy od wielkości liter.
- Middleware `requireAuth` (JWT w nagłówku `Authorization`) – gotowy dla modułów zwierząt i wizyt.
- Ten sam komunikat dla złego hasła i nieistniejącego konta (nie zdradzamy, kto ma konto).
- Przetestowane ręcznie 12 scenariuszy (poprawne i błędne dane, zajęty e-mail, zły/brak tokenu).
- Wymagania F-M-01/02 – backend gotowy, frontend w kroku 5.

### 2026-10-28 – Krok 3: zwierzęta w backendzie

- Endpointy `GET/POST /api/pets`, `GET/PUT/DELETE /api/pets/:id`, wyszukiwanie `?search=`.
- Każde zapytanie filtrowane po `user_id` – cudze zwierzę zwraca 404 (izolacja danych, NF-M-05).
- Walidacja pól (wymagane imię i gatunek, poprawna data urodzenia nie z przyszłości, waga > 0).
- Lista zwraca liczbę wizyt i najbliższą zaplanowaną wizytę każdego zwierzęcia (pod F-S-04, F-C-02).
- Usunięcie zwierzęcia kasuje jego wizyty (sprawdzone w bazie).
- Przetestowane 19 scenariuszy, w tym próby odczytu/edycji/usunięcia cudzego zwierzęcia.

### 2026-10-28 – Krok 4: wizyty i statystyki w backendzie

- Endpointy `GET/POST /api/visits`, `GET/PUT/DELETE /api/visits/:id`,
  `PATCH /api/visits/:id/complete` oraz `GET /api/stats`.
- Filtry listy wizyt: `status` (zaplanowane/historia), zakres dat `from`–`to`, `petId`.
- Właściciel wizyty sprawdzany przez JOIN z `pets` – cudza wizyta zwraca 404, a wybranie
  cudzego zwierzęcia w formularzu – błąd pola `petId` (400).
- Walidacja: wymagane zwierzę, data i godzina (`RRRR-MM-DDTGG:MM`, istniejąca), gabinet, cel.
- Edycja bez pola `status` nie zmienia statusu – zakończona wizyta nie wraca przypadkiem do
  zaplanowanych; „zakończ” można wywołać wielokrotnie.
- `GET /api/stats`: liczba zwierząt, liczba wizyt zaplanowanych i odbytych, najbliższa wizyta.
- Przetestowane 32 scenariusze, w tym filtry, sortowanie i próby dostępu do cudzych wizyt.
