# 3. Przypadki użycia

## 3.1 Diagram przypadków użycia (UCD)

Jeden aktor: **Właściciel zwierzęcia**. Źródło diagramu: [diagramy/ucd.puml](diagramy/ucd.puml)
(PlantUML – podgląd w VS Code przez rozszerzenie _PlantUML_ albo na plantuml.com). Wersję
końcową można odtworzyć w draw.io i wyeksportować do `diagramy/ucd.png`.

| Przypadek użycia                     | PU    | Relacje                        |
| ------------------------------------ | ----- | ------------------------------ |
| Zarejestruj się                      | PU-01 | –                              |
| Zaloguj się                          | PU-02 | –                              |
| Zarządzaj zwierzętami                | PU-03 | «include» Zaloguj się          |
| ↳ Dodaj / edytuj / usuń zwierzę      | PU-03 | «extend» Zarządzaj zwierzętami |
| ↳ Wyszukaj zwierzę, zobacz szczegóły | PU-03 | «extend» Zarządzaj zwierzętami |
| Zarządzaj wizytami                   | PU-04 | «include» Zaloguj się          |
| ↳ Dodaj / edytuj / usuń wizytę       | PU-04 | «extend» Zarządzaj wizytami    |
| ↳ Oznacz wizytę jako zakończoną      | PU-04 | «extend» Zarządzaj wizytami    |
| ↳ Filtruj wizyty według daty         | PU-04 | «extend» Zarządzaj wizytami    |
| Wyloguj się                          | PU-05 | –                              |

## 3.2 Opisy przypadków użycia

### PU-01 — Rejestracja użytkownika

- **Aktor:** Właściciel zwierzęcia
- **Cel:** Utworzenie nowego konta w systemie.
- **Warunki wstępne:** Użytkownik nie jest zalogowany.

**Scenariusz podstawowy:**

1. Użytkownik otwiera formularz rejestracji.
2. Wprowadza adres e-mail i hasło.
3. System sprawdza poprawność danych.
4. System sprawdza, czy konto z podanym adresem e-mail już istnieje.
5. System zapisuje konto w bazie danych (hasło jako skrót bcrypt).
6. System wyświetla komunikat o pomyślnej rejestracji.

**Scenariusze alternatywne:**

- 3a. Niepoprawny e-mail lub zbyt słabe hasło → komunikat o błędzie, powrót do kroku 2.
- 4a. E-mail jest już zajęty → komunikat o błędzie, powrót do kroku 2.

**Warunek końcowy:** Konto użytkownika zostaje zapisane w bazie danych.

### PU-02 — Logowanie

- **Aktor:** Właściciel zwierzęcia
- **Cel:** Uzyskanie dostępu do własnych danych.
- **Warunki wstępne:** Użytkownik posiada konto.

**Scenariusz podstawowy:**

1. Użytkownik otwiera formularz logowania.
2. Podaje adres e-mail i hasło.
3. System weryfikuje dane logowania.
4. System rozpoczyna sesję użytkownika (wydaje token JWT).
5. Użytkownik zostaje przeniesiony do panelu głównego.

**Scenariusz alternatywny:**

- 3a. Nieprawidłowe dane → komunikat o błędzie, powrót do kroku 2.

**Warunek końcowy:** Użytkownik jest zalogowany.

### PU-03 — Zarządzanie zwierzętami

- **Aktor:** Zalogowany właściciel zwierzęcia
- **Cel:** Zarządzanie informacjami o posiadanych zwierzętach.
- **Warunki wstępne:** Użytkownik jest zalogowany.

**Scenariusz podstawowy:**

1. Użytkownik wybiera opcję „Moje zwierzęta”.
2. System wyświetla listę jego zwierząt.
3. Użytkownik wybiera dodawanie nowego zwierzęcia.
4. Wprowadza imię, gatunek, rasę i pozostałe dane.
5. System sprawdza poprawność danych.
6. System zapisuje zwierzę w bazie danych.
7. Użytkownik może później edytować lub usunąć wpis.

**Scenariusze alternatywne:**

- 5a. Brak wymaganych danych (imię, gatunek) lub niepoprawna waga/data → komunikat o błędzie.
- 7a. Próba edycji cudzego zwierzęcia → komunikat o błędzie (zasób nie istnieje).

**Warunek końcowy:** Dane zwierzęcia są zapisane lub zaktualizowane.

### PU-04 — Zarządzanie wizytami

- **Aktor:** Zalogowany właściciel zwierzęcia
- **Cel:** Planowanie wizyt weterynaryjnych i przechowywanie informacji o odbytych wizytach.
- **Warunki wstępne:** Użytkownik jest zalogowany i posiada co najmniej jedno zwierzę.

**Scenariusz podstawowy:**

1. Użytkownik otwiera zakładkę „Wizyty”.
2. Wybiera zwierzę, którego dotyczy wizyta.
3. Podaje datę, godzinę, nazwę gabinetu i cel wizyty.
4. System sprawdza poprawność wprowadzonych danych.
5. System zapisuje wizytę w bazie danych.
6. Użytkownik może przeglądać, edytować i usuwać wizyty.
7. Po odbyciu wizyty użytkownik może oznaczyć ją jako zakończoną.

**Scenariusze alternatywne:**

- 4a. Niepoprawna data lub brak wymaganych danych → komunikat o błędzie.
- 6a. Próba modyfikacji cudzej wizyty → komunikat o błędzie (zasób nie istnieje).

**Warunek końcowy:** Wizyta zostaje zapisana lub zmodyfikowana.

### PU-05 — Wylogowanie

- **Aktor:** Zalogowany właściciel zwierzęcia
- **Cel:** Bezpieczne zakończenie pracy z systemem.
- **Warunki wstępne:** Użytkownik jest zalogowany.

**Scenariusz podstawowy:**

1. Użytkownik wybiera opcję „Wyloguj”.
2. System kończy sesję użytkownika (usuwa token).
3. System przenosi użytkownika do strony logowania.

**Warunek końcowy:** Użytkownik nie ma dostępu do chronionego panelu bez ponownego zalogowania.
