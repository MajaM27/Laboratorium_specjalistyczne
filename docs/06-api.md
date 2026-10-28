# 6. REST API

Bazowy adres: `http://localhost:3001/api` (w trybie dev frontend używa `/api` przez proxy Vite).
Format danych: JSON. Testy ręczne: [`backend/requests.http`](../backend/requests.http).

## 6.1 Konwencje

- Endpointy chronione wymagają nagłówka `Authorization: Bearer <token>`.
- Format błędu:

  ```json
  { "error": "Komunikat dla użytkownika", "details": { "email": "Niepoprawny adres e-mail" } }
  ```

| Kod | Znaczenie                                           |
| --- | --------------------------------------------------- |
| 200 | OK                                                  |
| 201 | Utworzono zasób                                     |
| 204 | Usunięto (brak treści)                              |
| 400 | Błędne dane wejściowe (walidacja)                   |
| 401 | Brak lub nieważny token / złe dane logowania        |
| 404 | Zasób nie istnieje lub należy do innego użytkownika |
| 409 | Konflikt (np. zajęty e-mail)                        |
| 500 | Błąd serwera                                        |

## 6.2 Endpointy

Status: ✅ zaimplementowany · ⬜ zaplanowany.

| Metoda | Ścieżka                            | Opis                                    | Auth | Status |
| ------ | ---------------------------------- | --------------------------------------- | ---- | ------ |
| GET    | `/health`                          | Stan API i połączenia z bazą            | –    | ✅     |
| POST   | `/auth/register`                   | Rejestracja (PU-01)                     | –    | ✅     |
| POST   | `/auth/login`                      | Logowanie, zwraca token (PU-02)         | –    | ✅     |
| GET    | `/auth/me`                         | Dane zalogowanego użytkownika           | ✔    | ✅     |
| GET    | `/pets?search=`                    | Lista zwierząt, wyszukiwanie po imieniu | ✔    | ✅     |
| POST   | `/pets`                            | Dodanie zwierzęcia                      | ✔    | ✅     |
| GET    | `/pets/:id`                        | Szczegóły zwierzęcia                    | ✔    | ✅     |
| PUT    | `/pets/:id`                        | Edycja zwierzęcia                       | ✔    | ✅     |
| DELETE | `/pets/:id`                        | Usunięcie zwierzęcia (z wizytami)       | ✔    | ✅     |
| GET    | `/visits?status=&from=&to=&petId=` | Lista wizyt z filtrami                  | ✔    | ⬜     |
| POST   | `/visits`                          | Dodanie wizyty                          | ✔    | ⬜     |
| PUT    | `/visits/:id`                      | Edycja wizyty                           | ✔    | ⬜     |
| PATCH  | `/visits/:id/complete`             | Oznaczenie wizyty jako zakończonej      | ✔    | ⬜     |
| DELETE | `/visits/:id`                      | Usunięcie wizyty                        | ✔    | ⬜     |
| GET    | `/stats`                           | Liczba zwierząt, najbliższa wizyta      | ✔    | ⬜     |

## 6.3 Szczegóły

### GET /health ✅

Odpowiedź `200`:

```json
{ "status": "ok", "database": "ok", "time": "2026-10-27T14:00:00.000Z" }
```

### POST /auth/register ✅ (PU-01)

Treść żądania:

```json
{ "email": "anna@example.com", "password": "Haslo1234" }
```

Reguły walidacji:

- `email` – wymagany, poprawny format, maks. 254 znaki; zapisywany małymi literami,
  unikalny bez względu na wielkość liter.
- `password` – 8–72 znaki, co najmniej jedna litera i jedna cyfra; w bazie tylko skrót bcrypt.

Odpowiedź `201`:

```json
{
  "message": "Konto zostało utworzone. Możesz się zalogować.",
  "user": { "id": 2, "email": "anna@example.com", "createdAt": "2026-10-28 07:20:16" }
}
```

Błędy:

| Kod | Kiedy                  | Przykład `details`                                          |
| --- | ---------------------- | ----------------------------------------------------------- |
| 400 | Niepoprawne dane       | `{ "email": "Niepoprawny adres e-mail.", "password": "…" }` |
| 409 | E-mail jest już zajęty | `{ "email": "Ten adres e-mail jest już zajęty." }`          |

Rejestracja **nie loguje** automatycznie – zgodnie z PU-01 kończy się komunikatem, potem PU-02.

### POST /auth/login ✅ (PU-02)

Treść żądania:

```json
{ "email": "anna@example.com", "password": "Haslo1234" }
```

Odpowiedź `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs…",
  "user": { "id": 2, "email": "anna@example.com", "createdAt": "2026-10-28 07:20:16" }
}
```

Token JWT jest ważny przez `JWT_EXPIRES_IN` (domyślnie 2h). Frontend dołącza go do kolejnych
żądań: `Authorization: Bearer <token>`.

Błędy:

| Kod | Kiedy                                                                                       |
| --- | ------------------------------------------------------------------------------------------- |
| 400 | Brak e-maila lub hasła                                                                      |
| 401 | Złe hasło **lub** brak konta – ten sam komunikat celowo (nie zdradzamy, czy konto istnieje) |

### GET /auth/me ✅

Wymaga tokenu. Zwraca dane zalogowanego użytkownika – frontend używa go do sprawdzenia, czy
zapisany token jest wciąż ważny.

Odpowiedź `200`:

```json
{ "user": { "id": 2, "email": "anna@example.com", "createdAt": "2026-10-28 07:20:16" } }
```

Błędy: `401` – brak tokenu, token nieważny/wygasły lub konto usunięte.

### Wylogowanie (PU-05)

Nie ma osobnego endpointu – token JWT jest bezstanowy. Wylogowanie polega na usunięciu tokenu
po stronie frontendu; po wygaśnięciu (`JWT_EXPIRES_IN`) token i tak przestaje działać.

### Zwierzęta – `/pets` ✅ (PU-03)

Wszystkie endpointy wymagają tokenu i działają **wyłącznie na zwierzętach zalogowanego
użytkownika**. Cudze lub nieistniejące zwierzę → `404 { "error": "Nie znaleziono zwierzęcia." }`.

#### Obiekt zwierzęcia

```json
{
  "id": 1,
  "name": "Rex",
  "species": "Pies",
  "breed": "Labrador",
  "birthDate": "2020-04-12",
  "weight": 31.5,
  "notes": "Alergia na kurczaka",
  "visitCount": 2,
  "nextVisit": "2026-11-15T16:30",
  "createdAt": "2026-10-28 07:30:00",
  "updatedAt": "2026-10-28 07:30:00"
}
```

`visitCount` – liczba wszystkich wizyt, `nextVisit` – najwcześniejsza wizyta o statusie
`planned` (albo `null`). Pola wyliczane, tylko do odczytu.

#### Pola wejściowe (POST, PUT)

| Pole        | Wymagane | Reguły                                                 |
| ----------- | -------- | ------------------------------------------------------ |
| `name`      | tak      | tekst, maks. 50 znaków (spacje na brzegach są usuwane) |
| `species`   | tak      | tekst, maks. 50 znaków                                 |
| `breed`     | nie      | tekst, maks. 50 znaków                                 |
| `birthDate` | nie      | `RRRR-MM-DD`, istniejąca data, nie z przyszłości       |
| `weight`    | nie      | liczba > 0 i ≤ 1000 (kg), zaokrąglana do 2 miejsc      |
| `notes`     | nie      | tekst, maks. 1000 znaków                               |

Puste pole opcjonalne zapisywane jest jako `null`. `PUT` zastępuje **wszystkie** pola – pole
pominięte zostanie wyczyszczone.

#### Endpointy

| Żądanie               | Odpowiedź                                                                    |
| --------------------- | ---------------------------------------------------------------------------- |
| `GET /pets`           | `200 { "pets": [ … ], "total": 2 }` – sortowane po imieniu                   |
| `GET /pets?search=re` | jak wyżej, tylko imiona zawierające frazę (bez rozróżniania wielkości liter) |
| `GET /pets/:id`       | `200 { "pet": { … } }`                                                       |
| `POST /pets`          | `201 { "pet": { … } }`                                                       |
| `PUT /pets/:id`       | `200 { "pet": { … } }`                                                       |
| `DELETE /pets/:id`    | `204` – usuwa też wszystkie wizyty zwierzęcia                                |

Błąd walidacji (`400`):

```json
{
  "error": "Popraw zaznaczone pola formularza.",
  "details": {
    "name": "Pole „Imię” jest wymagane.",
    "weight": "Waga musi być liczbą większą od 0.",
    "birthDate": "Podaj poprawną datę urodzenia (RRRR-MM-DD)."
  }
}
```
