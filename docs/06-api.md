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
| POST   | `/auth/register`                   | Rejestracja (PU-01)                     | –    | ⬜     |
| POST   | `/auth/login`                      | Logowanie, zwraca token (PU-02)         | –    | ⬜     |
| GET    | `/auth/me`                         | Dane zalogowanego użytkownika           | ✔    | ⬜     |
| GET    | `/pets?search=`                    | Lista zwierząt, wyszukiwanie po imieniu | ✔    | ⬜     |
| POST   | `/pets`                            | Dodanie zwierzęcia                      | ✔    | ⬜     |
| GET    | `/pets/:id`                        | Szczegóły zwierzęcia                    | ✔    | ⬜     |
| PUT    | `/pets/:id`                        | Edycja zwierzęcia                       | ✔    | ⬜     |
| DELETE | `/pets/:id`                        | Usunięcie zwierzęcia (z wizytami)       | ✔    | ⬜     |
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

<!-- Kolejne endpointy opisujemy tutaj w miarę implementacji: treść żądania, odpowiedź, błędy. -->
