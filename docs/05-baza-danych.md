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
    INTEGER token_version "+1 przy zmianie hasła"
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
| `npm run db:seed`  | Dodaje konto demo z 2 zwierzętami i 3 wizytami¹        |
| `npm run db:reset` | Usuwa wszystkie dane, tworzy tabele i dodaje dane demo |

¹ Daty wizyt demo są liczone względem dnia uruchomienia seeda (odbyta – ok. 4 miesiące temu,
zaplanowane – za 3 i 16 dni), więc dane demo nie „starzeją się”.

## 5.5 Migracje

`schema.sql` zawiera zawsze **pełny, aktualny** schemat, ale `CREATE TABLE IF NOT EXISTS` nie
zmienia tabel, które już istnieją. Zmiany dla istniejących baz opisują migracje w
[`backend/src/db/migrations.js`](../backend/src/db/migrations.js):

- numer ostatniej zastosowanej migracji jest zapisany w bazie (`PRAGMA user_version`),
- przy każdym starcie serwera (i w `db:init`) brakujące migracje są stosowane automatycznie,
  każda w osobnej transakcji – dane zostają, `db:reset` nie jest potrzebny,
- migracje są idempotentne (np. dodają kolumnę tylko, jeśli jej nie ma), bo nowa baza dostaje
  od razu pełny schemat z `schema.sql`.

Dodając kolumnę: dopisz ją do `schema.sql` **i** dodaj migrację z kolejnym numerem.

| Wersja | Zmiana                                                                 |
| ------ | ---------------------------------------------------------------------- |
| 1      | `users.token_version` – unieważnianie starych tokenów po zmianie hasła |
