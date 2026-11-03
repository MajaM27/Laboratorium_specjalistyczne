# PetCare – System zarządzania opieką nad zwierzętami

Projekt na **Laboratorium specjalistyczne 2026**, zespół **PetDev**.

Aplikacja internetowa, w której właściciel zwierząt zakłada konto, dodaje swoje zwierzęta,
planuje wizyty weterynaryjne i przegląda ich historię.

**Stos:** React + Vite · Node.js + Express · SQLite (better-sqlite3)

## Szybki start

Wymagany Node.js ≥ 20 (zalecany 22, patrz `.nvmrc`).

```bash
npm install
cp backend/.env.example backend/.env     # ustaw własny JWT_SECRET
cp frontend/.env.example frontend/.env
npm run db:seed                           # dane testowe (opcjonalnie)
npm run dev                               # aplikacja: http://localhost:5180, API: http://localhost:3001/api
```

Konto testowe po `db:seed`: **demo@petcare.pl / Demo1234**

## Technologie i stos

Aplikacja jest napisana w całości w JavaScripcie. Repozytorium to monorepo (**npm workspaces**)
z dwoma pakietami: `backend` i `frontend`.

### Frontend (`frontend/`)

| Technologia      | Wersja | Do czego służy                                                      |
| ---------------- | ------ | ------------------------------------------------------------------- |
| **React**        | 19     | Interfejs z komponentów i hooków (`src/components`, `src/hooks`)    |
| **Vite**         | 8      | Serwer deweloperski (port **5180**) i budowanie wersji produkcyjnej |
| **React Router** | 7      | Nawigacja między widokami (`src/pages`) bez przeładowania strony    |
| **Zwykły CSS**   | –      | Style w `src/styles`, bez Tailwinda i bibliotek UI                  |

- **Proxy Vite:** frontend wysyła żądania na `/api/...`, a Vite przekazuje je do backendu
  (port 3001), więc w trybie deweloperskim nie trzeba konfigurować CORS.
- **AuthContext** (`src/context`): przechowuje token JWT (w `localStorage`) i zalogowanego użytkownika.
- **apiRequest** (`src/api`): wspólna funkcja do zapytań HTTP, która dodaje nagłówek
  `Authorization: Bearer <token>`.

### Backend (`backend/`)

| Technologia        | Wersja | Do czego służy                                               |
| ------------------ | ------ | ------------------------------------------------------------ |
| **Node.js**        | 22     | Środowisko uruchomieniowe, moduły ES (`import`/`export`)     |
| **Express**        | 5      | Serwer HTTP i REST API (port **3001**)                       |
| **better-sqlite3** | 12.x   | Sterownik SQLite (13.x crashuje na Node 22.12, dlatego 12.x) |
| **bcryptjs**       | 3      | Hashowanie haseł                                             |
| **jsonwebtoken**   | 9      | Tworzenie i weryfikacja tokenów JWT                          |
| **dotenv**         | –      | Wczytywanie konfiguracji z `backend/.env` (`src/config.js`)  |
| **cors**           | –      | Nagłówki CORS                                                |

Kod backendu jest podzielony na warstwy:

- `routes/`: jeden plik na moduł (auth, zwierzęta, wizyty, statystyki),
- `middleware/`: sprawdzanie tokenu JWT i wspólna obsługa błędów,
- `utils/`: klasa `HttpError` i walidacja danych,
- `db/`: połączenie z bazą, `schema.sql`, skrypty `init` i `seed`.

W trybie deweloperskim `node --watch` restartuje serwer po każdej zmianie kodu.

### Baza danych

- **SQLite**: cała baza to jeden plik w `backend/data/` (ignorowany przez git), bez osobnego serwera bazy.
- Zapytania są zawsze parametryzowane (`?`), co chroni przed SQL injection.
- Każdy użytkownik widzi tylko swoje dane: zwierzęta są filtrowane po `user_id`, wizyty przez
  JOIN z tabelą `pets`. Próba dostępu do cudzego zasobu zwraca **404**.
- Usunięcie zwierzęcia usuwa też jego wizyty (kasowanie kaskadowe).

### Narzędzia deweloperskie

| Narzędzie                                               | Do czego służy                                      |
| ------------------------------------------------------- | --------------------------------------------------- |
| **concurrently**                                        | `npm run dev` uruchamia API i frontend jednocześnie |
| **ESLint 9** (flat config, pluginy React i React Hooks) | Wyłapywanie błędów w kodzie (`npm run lint`)        |
| **Prettier 3**                                          | Jednolite formatowanie kodu (`npm run format`)      |
| **REST Client** (`backend/requests.http`)               | Ręczne testowanie endpointów API z poziomu edytora  |

### Jak to działa razem

```
Przeglądarka (React SPA, :5180)
      │  fetch /api/...  + Authorization: Bearer <JWT>
      ▼
Vite proxy ──► Express API (:3001) ──► middleware auth ──► routes ──► better-sqlite3 ──► plik SQLite
      ◄── JSON  (błędy: { "error": "...", "details": { "pole": "..." } })
```

### Najważniejsze decyzje

- **JWT zamiast sesji na serwerze**: serwer nie przechowuje stanu logowania, a wylogowanie
  to usunięcie tokenu w przeglądarce.
- **Walidacja zawsze na backendzie**: frontend sprawdza dane dodatkowo, żeby szybciej pokazać błąd.
- **Komunikaty błędów po polsku i we wspólnym formacie**, z polem `details` z błędami
  przypisanymi do konkretnych pól formularza.
- **Kod po angielsku**, a interfejs, komentarze i dokumentacja **po polsku**.

## Dokumentacja

| Dokument                                                   | Zawartość                                 |
| ---------------------------------------------------------- | ----------------------------------------- |
| [KONTEKST.md](KONTEKST.md)                                 | Kontekst aplikacji, decyzje, konwencje    |
| [docs/01-koncept.md](docs/01-koncept.md)                   | Koncept systemu                           |
| [docs/02-wymagania.md](docs/02-wymagania.md)               | Wymagania MoSCoW (ze statusem realizacji) |
| [docs/03-przypadki-uzycia.md](docs/03-przypadki-uzycia.md) | Diagram UCD i opisy PU-01…PU-05           |
| [docs/04-architektura.md](docs/04-architektura.md)         | Architektura i struktura kodu             |
| [docs/05-baza-danych.md](docs/05-baza-danych.md)           | Schemat bazy, diagram ERD                 |
| [docs/06-api.md](docs/06-api.md)                           | Specyfikacja REST API                     |
| [docs/07-uruchomienie.md](docs/07-uruchomienie.md)         | Instalacja, zmienne środowiskowe, skrypty |
| [docs/08-postep-prac.md](docs/08-postep-prac.md)           | Plan i postęp prac                        |
