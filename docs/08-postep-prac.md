# 8. Plan i postęp prac

Pracujemy małymi krokami – każdy krok jest sprawdzany i dokumentowany przed przejściem dalej.
Status: ⬜ do zrobienia · 🟨 w trakcie · ✅ zrobione.

| #   | Krok                                                      | Wymagania                  | Status | Data       |
| --- | --------------------------------------------------------- | -------------------------- | ------ | ---------- |
| 0   | Środowisko: monorepo, pakiety, `.env`, ESLint/Prettier    | NF-M-02, NF-S-03           | ✅     | 2026-10-27 |
| 1   | Baza danych: schemat, init, seed                          | NF-M-03, F-M-09            | ✅     | 2026-10-27 |
| 2   | Backend: rejestracja, logowanie, `requireAuth`            | F-M-01, F-M-02, NF-M-04/05 | ⬜     |            |
| 3   | Backend: CRUD zwierząt + wyszukiwanie                     | F-M-03..05, F-S-01         | ⬜     |            |
| 4   | Backend: CRUD wizyt, filtry, „zakończ”, statystyki        | F-M-06..08, F-S-02/03, F-C | ⬜     |            |
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
