# 1. Koncept systemu „PetCare”

**Zespół:** PetDev

System internetowy pozwalający właścicielom zwierząt przechowywać informacje o swoich pupilach,
planować wizyty weterynaryjne i prowadzić historię opieki.

## Opis

System „PetCare” jest aplikacją internetową przeznaczoną do zarządzania informacjami o zwierzętach
domowych oraz ich opiece weterynaryjnej. Jego głównym celem jest ułatwienie właścicielom zwierząt
przechowywania najważniejszych informacji o swoich pupilach w jednym miejscu oraz kontrolowania
terminów wizyt weterynaryjnych.

System składa się z trzech podstawowych elementów: interfejsu użytkownika, serwera aplikacji oraz
relacyjnej bazy danych. Interfejs użytkownika wykonano w technologii React, warstwa backendowa
działa w środowisku Node.js z wykorzystaniem Express.js, a do przechowywania danych wykorzystano
bazę SQLite.

Użytkownik po wejściu do aplikacji może założyć konto i zalogować się do systemu. Następnie może
dodawać swoje zwierzęta, uzupełniać ich dane, edytować informacje oraz usuwać nieaktualne wpisy.
Dla każdego zwierzęcia można zapisać imię, gatunek, rasę, datę urodzenia, wagę oraz notatki
dotyczące opieki.

Kolejną funkcjonalnością systemu jest zarządzanie wizytami weterynaryjnymi. Użytkownik może
dodawać wizyty, określać ich datę i godzinę, podawać nazwę gabinetu oraz cel wizyty. Może również
przeglądać listę zaplanowanych wizyt i historię wizyt zakończonych.

Wszystkie dane przechowywane są w relacyjnej bazie danych SQLite. Backend odpowiada za obsługę
żądań użytkownika, weryfikację przekazywanych danych oraz komunikację z bazą danych. Frontend
prezentuje informacje w czytelnej i intuicyjnej formie.

System przeznaczony jest przede wszystkim dla właścicieli zwierząt domowych. W podstawowej wersji
aplikacja nie wymaga integracji z zewnętrznymi systemami, płatnościami ani urządzeniami GPS. Dzięki
temu projekt jest możliwy do zrealizowania w ramach zajęć laboratoryjnych i stanowi przykład
aplikacji internetowej wykorzystującej frontend, backend oraz relacyjną bazę danych.

## Użytkownicy systemu

| Aktor                 | Opis                                                        |
| --------------------- | ----------------------------------------------------------- |
| Właściciel zwierzęcia | Jedyny typ użytkownika. Zarządza wyłącznie własnymi danymi. |
