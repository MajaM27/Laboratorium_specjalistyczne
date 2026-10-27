# 5. Baza danych

SQLite, plik `backend/data/petcare.db`. Definicja: [`backend/src/db/schema.sql`](../backend/src/db/schema.sql).
Klucze obce włączone (`PRAGMA foreign_keys = ON`).

## 5.1 Diagram ERD

```mermaid
erDiagram
  users ||--o{ pets : "posiada"
  pets  ||--o{ visits : "ma"

  users {
    INTEGER id PK
    TEXT email UK "unikalny, bez rozróżniania wielkości liter"
    TEXT password_hash "skrót bcrypt"
    TEXT created_at
  }
  pets {
    INTEGER id PK
    INTEGER user_id FK
    TEXT name "wymagane"
    TEXT species "wymagane"
    TEXT breed
    TEXT birth_date "YYYY-MM-DD"
    REAL weight "kg, > 0"
    TEXT notes
    TEXT created_at
    TEXT updated_at
  }
  visits {
    INTEGER id PK
    INTEGER pet_id FK
    TEXT visit_datetime "YYYY-MM-DDTHH:MM"
    TEXT clinic "wymagane"
    TEXT purpose "wymagane"
    TEXT status "planned | done"
    TEXT created_at
    TEXT updated_at
  }
```

## 5.2 Relacje

- **users 1 — * pets**: jeden użytkownik może mieć wiele zwierząt.
- **pets 1 — * visits**: jedno zwierzę może mieć wiele wizyt.
- Obie relacje mają `ON DELETE CASCADE` – usunięcie zwierzęcia usuwa jego wizyty.

## 5.3 Ograniczenia i indeksy

| Tabela   | Ograniczenie                                         |
| -------- | ---------------------------------------------------- |
| `users`  | `email` UNIQUE, `COLLATE NOCASE`                     |
| `pets`   | `weight IS NULL OR weight > 0`                       |
| `visits` | `status IN ('planned', 'done')`, domyślnie `planned` |

Indeksy: `pets(user_id)`, `visits(pet_id)`, `visits(visit_datetime)`.

## 5.4 Skrypty

| Polecenie          | Działanie                                              |
| ------------------ | ------------------------------------------------------ |
| `npm run db:init`  | Tworzy brakujące tabele (robi to też start serwera)    |
| `npm run db:seed`  | Dodaje konto demo z 2 zwierzętami i 3 wizytami         |
| `npm run db:reset` | Usuwa wszystkie dane, tworzy tabele i dodaje dane demo |
