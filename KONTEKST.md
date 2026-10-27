# Kontekst aplikacji – PetCare

> Plik kontekstowy projektu: czym jest aplikacja, jak jest zbudowana i jakie decyzje już zapadły.
> Czytaj go przed rozpoczęciem pracy nad projektem.

## Czym jest PetCare

Aplikacja internetowa dla **właścicieli zwierząt domowych** (zespół **PetDev**, Laboratorium
specjalistyczne 2026). Użytkownik zakłada konto, dodaje swoje zwierzęta, planuje wizyty
weterynaryjne i przegląda ich historię.

- Jeden aktor: **Właściciel zwierzęcia** (brak ról admin/weterynarz).
- Poza zakresem (WON'T): SMS, rezerwacje w gabinetach, płatności, GPS/aplikacje mobilne.

Szczegóły: [docs/01-koncept.md](docs/01-koncept.md), [docs/02-wymagania.md](docs/02-wymagania.md).

## Stos technologiczny

| Warstwa     | Technologia                                                          |
| ----------- | -------------------------------------------------------------------- |
| Frontend    | React 19 + Vite, React Router, zwykły CSS                            |
| Backend     | Node.js 22 + Express 5 (ES modules)                                  |
| Baza danych | SQLite przez `better-sqlite3` **12.x** (13.x crashuje na Node 22.12) |
| Hasła       | `bcryptjs`                                                           |
| Autoryzacja | JWT (`jsonwebtoken`) w nagłówku `Authorization`                      |
| Jakość kodu | ESLint 9 (flat config) + Prettier                                    |

## Struktura repozytorium

```
backend/              API (Express)
  src/config.js       odczyt zmiennych z backend/.env
  src/app.js          konfiguracja Express, montowanie tras
  src/server.js       punkt startowy
  src/db/             połączenie, schema.sql, init.js, seed.js
  src/routes/         trasy API (jeden plik na moduł)
  src/middleware/     auth, obsługa błędów
  src/utils/          pomocnicze (HttpError, walidacja)
  data/               plik bazy SQLite (ignorowany przez git)
  requests.http       ręczne testy API (REST Client)
frontend/             SPA (React + Vite)
  src/api/            klient HTTP (apiRequest)
  src/context/        AuthContext (token, zalogowany użytkownik)
  src/pages/          widoki (strony routingu)
  src/components/     komponenty wielokrotnego użytku
  src/styles/         CSS
docs/                 dokumentacja projektu (aktualizowana na bieżąco)
```

## Kluczowe decyzje projektowe

1. **Monorepo (npm workspaces)**: `npm run dev` uruchamia API (:3001) i frontend (:5180, `strictPort` – port 5173 bywa zajęty przez inne projekty).
2. **Proxy Vite**: frontend woła `/api/...`, Vite przekazuje żądania do backendu.
3. **JWT zamiast sesji serwerowej**: token w `localStorage`, nagłówek `Authorization: Bearer <token>`.
   Wylogowanie = usunięcie tokenu po stronie klienta.
4. **Wizyta ma jedno pole `visit_datetime`** (`YYYY-MM-DDTHH:MM`) – data + godzina (PU-04).
5. **Status wizyty**: `planned` | `done`. „Zaplanowane” = `planned`, „Historia” = `done`.
6. **Izolacja danych**: zapytania o `pets` filtrują po `user_id`, o `visits` – przez JOIN z `pets`.
   Cudzy zasób → **404**.
7. **Usuwanie kaskadowe**: usunięcie zwierzęcia usuwa jego wizyty.
8. **Walidacja zawsze na backendzie**; frontend waliduje dodatkowo dla wygody.
9. **Format błędów API**: `{ "error": "komunikat po polsku", "details": { "pole": "opis" } }`.

## Konwencje

- Kod (zmienne, funkcje, tabele) po **angielsku**; UI, komentarze i dokumentacja po **polsku**.
- Zawsze zapytania parametryzowane (`?`), nigdy sklejanie SQL ze stringów.
- `npm run lint` i `npm run format` przed commitem.
- **Pracujemy małymi krokami** – jeden moduł/funkcjonalność na raz, każdy krok sprawdzony
  i opisany w dokumentacji przed przejściem dalej.

## Zasada dokumentacji

Po każdej zmianie aktualizuj dokumentację w tym samym kroku:

- nowy/zmieniony endpoint → [docs/06-api.md](docs/06-api.md) + `backend/requests.http`
- zmiana schematu bazy → [docs/05-baza-danych.md](docs/05-baza-danych.md)
- zmiana architektury/decyzji → ten plik + [docs/04-architektura.md](docs/04-architektura.md)
- zrealizowany krok → [docs/08-postep-prac.md](docs/08-postep-prac.md) i status w [docs/02-wymagania.md](docs/02-wymagania.md)
- nowa zmienna środowiskowa → `.env.example` + [docs/07-uruchomienie.md](docs/07-uruchomienie.md)
