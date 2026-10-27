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
