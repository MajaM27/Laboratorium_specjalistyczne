# 8. Plan i postęp prac

Pracujemy małymi krokami – każdy krok jest sprawdzany i dokumentowany przed przejściem dalej.
Status: ⬜ do zrobienia · 🟨 w trakcie · ✅ zrobione.

| #   | Krok                                                      | Wymagania                    | Status | Data       |
| --- | --------------------------------------------------------- | ---------------------------- | ------ | ---------- |
| 0   | Środowisko: monorepo, pakiety, `.env`, ESLint/Prettier    | NF-M-02, NF-S-03             | ✅     | 2026-10-27 |
| 1   | Baza danych: schemat, init, seed                          | NF-M-03, F-M-09              | ✅     | 2026-10-27 |
| 2   | Backend: rejestracja, logowanie, `requireAuth`            | F-M-01, F-M-02, NF-M-04/05   | ✅     | 2026-10-28 |
| 3   | Backend: CRUD zwierząt + wyszukiwanie                     | F-M-03..05, F-S-01           | ✅     | 2026-10-28 |
| 4   | Backend: CRUD wizyt, filtry, „zakończ”, statystyki        | F-M-06..08, F-S-02/03, F-C   | ✅     | 2026-10-28 |
| 5   | Frontend: logowanie, rejestracja, layout, chronione trasy | F-M-01, F-M-02               | ✅     | 2026-11-03 |
| 6   | Frontend: zwierzęta (lista, formularz, szczegóły)         | F-M-03..05, F-S-01/04        | ✅     | 2026-11-03 |
| 7   | Frontend: wizyty i panel główny                           | F-M-06..08, F-S-02/03, F-C   | ✅     | 2026-11-03 |
| 8   | Wygląd: responsywność, komunikaty błędów, ciemny motyw    | NF-M-01, NF-S-01/02, NF-C-01 | 🟨     | 2026-11-17 |
| 9   | Dokumentacja końcowa: diagram UCD (draw.io/PNG), zrzuty   | –                            | 🟨     |            |

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

### 2026-11-03 – Kroki 5–7 (+ część 8): frontend na podstawie projektu graficznego

- Przeniesiono wygląd z projektu Figma Make „PetCare Veterinary Dashboard” (React + Tailwind)
  do naszego frontendu: zwykły CSS, JavaScript, React Router, polski interfejs.
- Ekrany: logowanie, rejestracja, panel główny, lista/formularz/szczegóły zwierzęcia,
  zaplanowane wizyty, historia wizyt, formularz wizyty, konto.
- Wszystkie dane pochodzą z API (zamiast przykładowych danych z projektu); zdjęcia zastąpione
  kolorowymi kafelkami z inicjałem, pominięte elementy spoza wymagań (lekarz, mapa, powiadomienia).
- `AuthProvider`: token JWT w `localStorage`, sprawdzanie sesji przez `GET /auth/me`, trasy
  chronione, automatyczne wylogowanie po `401`.
- Walidacja formularzy po stronie klienta + wyświetlanie błędów pól z backendu.
- Responsywność: menu wysuwane poniżej 800 px, układ jednokolumnowy poniżej 580 px.
- Sprawdzone w przeglądarce na koncie demo (panel, listy, szczegóły, filtry, walidacja, widok mobilny).
- Zostaje w kroku 8: ewentualny ciemny motyw (NF-C-01), test w innych przeglądarkach.

### 2026-11-10 – Dopracowanie i testy automatyczne backendu

- Dodano testy automatyczne API (`npm test`, wbudowany `node:test`, baza SQLite w pamięci):
  36 testów – autoryzacja, zwierzęta, wizyty, filtry, statystyki, izolacja danych, błędy.
- JWT: weryfikacja tylko algorytmu HS256 (token bez podpisu `alg: none` jest odrzucany),
  schemat `Bearer` bez rozróżniania wielkości liter.
- Obsługa błędów: za duża treść żądania zwraca `413` (wcześniej `500`), inne błędy klienta
  z Express – właściwy kod 4xx zamiast `500`.
- Walidacja: `weight` i `petId` muszą być liczbą lub tekstem (odrzucane `true`, tablice, obiekty).
- Konfiguracja: sprawdzanie `PORT` i `BCRYPT_ROUNDS`, wymagany długi `JWT_SECRET` w produkcji,
  obsługa `DATABASE_PATH=:memory:`.
- Serwer: wyłączony nagłówek `X-Powered-By`, czytelny komunikat przy zajętym porcie,
  łagodne zamknięcie (Ctrl+C) z zamknięciem bazy.
- Zmiany API zgodne wstecz – frontend nie wymaga zmian.

### 2026-11-17 – Krok 8: ciemny motyw (NF-C-01)

- Kolory zapisane na sztywno w `index.css` (~150 miejsc) zastąpione zmiennymi CSS
  (np. `--surface`, `--tint`, `--line-strong`, `--link`); wygląd jasny bez zmian.
- Ciemna paleta w `:root[data-theme='dark']`, także dla kafelków zwierząt (`--pet-N-bg/fg`)
  i gradientów; `color-scheme: dark` dla pól formularzy i pasków przewijania.
- Domyślnie motyw zgodny z ustawieniem systemu; przycisk słońce/księżyc w nagłówku oraz na
  ekranach logowania i rejestracji, wybór zapamiętywany w `localStorage` (`petcare-theme`).
- Sprawdzone w przeglądarce: logowanie, panel, lista i szczegóły zwierząt, wizyty, formularz wizyty.
- Zostaje w kroku 8: test w innych przeglądarkach (NF-M-07).

### 2026-11-17 – Języki polski i angielski (NF-C-02)

- Frontend: wszystkie teksty interfejsu przeniesione do słowników `i18n/messages.js` (PL i EN),
  hook `useI18n()` z funkcją `t()`, przełącznik PL/EN w nagłówku oraz na ekranach logowania
  i rejestracji; wybór zapamiętywany w `localStorage` (`petcare-lang`), domyślnie polski.
- Daty, wiek zwierzęcia (odmiana: rok/lata/lat – year/years) i waga formatowane wg języka.
- Backend: nagłówek `Accept-Language` wybiera język komunikatów błędów (domyślnie polski –
  API zgodne wstecz); słownik w `utils/i18n.js`, 4 nowe testy (razem 40).
- Sprawdzone w przeglądarce: panel, wizyty, szczegóły zwierzęcia w obu językach; błędy walidacji
  z API po angielsku.
- Ograniczenie: format pól daty (`dd.mm.rrrr`) zależy od języka przeglądarki, nie aplikacji.

### 2026-11-17 – Poprawki po przeglądzie kodu

Bezpieczeństwo:

- Limit nieudanych prób logowania, rejestracji, zmiany hasła i usunięcia konta (10 / 15 min
  z jednego IP → `429` z `Retry-After`), nagłówki bezpieczeństwa, asynchroniczny bcrypt,
  obsługa równoczesnej rejestracji tego samego e-maila (409 zamiast 500).
- Opis kompromisu „token w `localStorage`” w [04-architektura.md](04-architektura.md).

Błędy:

- Data urodzenia „dzisiaj” była odrzucana tuż po północy (backend liczył datę w UTC).
- „Najbliższa wizyta” mogła być wizytą sprzed miesięcy – teraz tylko wizyty z przyszłości,
  zaległe liczone osobno i oznaczane w panelu („Po terminie”).
- Panel główny kręcił loaderem bez końca przy błędzie API.
- „Anuluj” w formularzu wizyty prowadzi do stałej strony (wcześniej `history.back()` mogło
  wyprowadzić z aplikacji).
- Po zalogowaniu powrót na stronę razem z parametrami adresu (np. `?petId=`).
- Ostrzeżenie / potwierdzenie przy oznaczaniu jako zakończonej wizyty z przyszłości.

Dopracowanie:

- Strona „Moje konto”: zmiana hasła i usunięcie konta (`PUT /auth/password`, `DELETE /auth/me`).
- Domyślna ważność tokenu 1 dzień; po wygaśnięciu sesji komunikat na ekranie logowania i powrót
  na tę samą stronę. Synchronizacja wylogowania między kartami.
- Usuwanie wizyt na stronie szczegółów zwierzęcia.
- Dostępność: `aria-describedby` dla błędów pól, `aria-label` na przyciskach z ikoną.
- Usunięta nieużywana zmienna `VITE_APP_NAME`.

Testy: backend 49 (nowe: limit prób, nagłówki, zmiana hasła, usunięcie konta, zaległe wizyty,
strefa czasowa; daty w testach przesunięte na 2099, żeby nie „przeterminowały się”), frontend 12
(`frontend/test/` – formatowanie, odmiana, parametry zapytań, spójność słowników PL/EN).
`npm test` uruchamia oba zestawy. Sprawdzone w przeglądarce: panel z zaległą wizytą, usuwanie
wizyty w szczegółach zwierzęcia, błąd pola przy złym haśle (bez wylogowania), usunięcie konta.
