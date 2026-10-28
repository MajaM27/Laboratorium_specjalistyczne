# 2. Wymagania – analiza MoSCoW

Status: ⬜ do zrobienia · 🟨 w trakcie · ✅ zrealizowane (aktualizowany na bieżąco).

## 2.1 Wymagania funkcjonalne

### MUST – wymagane

| ID     | Wymaganie                                                  | PU           | Status |
| ------ | ---------------------------------------------------------- | ------------ | ------ |
| F-M-01 | Rejestracja nowego użytkownika                             | PU-01        | 🟨     |
| F-M-02 | Logowanie i wylogowywanie użytkownika                      | PU-02, PU-05 | 🟨     |
| F-M-03 | Dodawanie zwierząt do swojego konta                        | PU-03        | ⬜     |
| F-M-04 | Przeglądanie listy swoich zwierząt                         | PU-03        | ⬜     |
| F-M-05 | Edytowanie i usuwanie danych zwierzęcia                    | PU-03        | ⬜     |
| F-M-06 | Dodawanie wizyt weterynaryjnych                            | PU-04        | ⬜     |
| F-M-07 | Przeglądanie zaplanowanych wizyt i historii wizyt          | PU-04        | ⬜     |
| F-M-08 | Edytowanie i usuwanie wizyt                                | PU-04        | ⬜     |
| F-M-09 | Zapisywanie danych użytkowników, zwierząt i wizyt w SQLite | –            | 🟨     |

### SHOULD – istotne

| ID     | Wymaganie                                          | Status |
| ------ | -------------------------------------------------- | ------ |
| F-S-01 | Wyszukiwanie zwierząt po imieniu                   | ⬜     |
| F-S-02 | Filtrowanie wizyt według daty                      | ⬜     |
| F-S-03 | Oznaczanie wizyty jako zakończonej                 | ⬜     |
| F-S-04 | Wyświetlanie szczegółowych informacji o zwierzęciu | ⬜     |

### COULD – dodatkowe

| ID     | Wymaganie                                          | Status |
| ------ | -------------------------------------------------- | ------ |
| F-C-01 | Wyświetlanie liczby zwierząt przypisanych do konta | ⬜     |
| F-C-02 | Wyświetlanie najbliższej zaplanowanej wizyty       | ⬜     |
| F-C-03 | Notatki dotyczące opieki nad zwierzęciem           | 🟨     |

### WON'T – poza zakresem aktualnej wersji

- Wysyłanie automatycznych wiadomości SMS.
- Rezerwowanie wizyt bezpośrednio w gabinetach weterynaryjnych.
- Płatności internetowe za wizyty.
- Integracja z aplikacjami mobilnymi i urządzeniami GPS.

## 2.2 Wymagania niefunkcjonalne

### MUST – wymagane

| ID      | Wymaganie                                                  | Realizacja                     | Status |
| ------- | ---------------------------------------------------------- | ------------------------------ | ------ |
| NF-M-01 | Czytelny i intuicyjny interfejs                            | React, spójny CSS              | ⬜     |
| NF-M-02 | Backend w środowisku Node.js                               | Node.js 22 + Express 5         | ✅     |
| NF-M-03 | Relacyjna baza danych SQLite                               | better-sqlite3, `schema.sql`   | ✅     |
| NF-M-04 | Hasła przechowywane jako bezpieczne skróty kryptograficzne | bcryptjs                       | ✅     |
| NF-M-05 | Użytkownik ma dostęp wyłącznie do swoich danych            | JWT + filtrowanie po `user_id` | 🟨     |
| NF-M-06 | Weryfikacja poprawności danych wejściowych                 | walidacja backend + frontend   | 🟨     |
| NF-M-07 | Działanie w popularnych przeglądarkach                     | Vite (build ES)                | ⬜     |

### SHOULD – istotne

| ID      | Wymaganie                                       | Realizacja                       | Status |
| ------- | ----------------------------------------------- | -------------------------------- | ------ |
| NF-S-01 | Interfejs dostosowany do komputerów i telefonów | responsywny CSS                  | ⬜     |
| NF-S-02 | Zrozumiałe komunikaty o błędach                 | format `{ error, details }`, PL  | 🟨     |
| NF-S-03 | Kod podzielony na moduły                        | routes / middleware / db / pages | ✅     |

### COULD – dodatkowe

- NF-C-01: Ciemny motyw interfejsu.
- NF-C-02: Wybór języka polskiego lub angielskiego.

### WON'T – poza zakresem aktualnej wersji

- Gwarantowana dostępność systemu na poziomie 99,9%.
- Obsługa bardzo dużej liczby użytkowników jednocześnie.
- Wdrożenie infrastruktury serwerowej o wysokiej dostępności.
