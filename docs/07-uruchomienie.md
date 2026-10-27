# 7. Uruchomienie i środowisko

## 7.1 Wymagania

- **Node.js ≥ 20** (zalecany 22 – plik `.nvmrc`, `nvm use`)
- npm ≥ 10

## 7.2 Instalacja

```bash
npm install                                # instaluje zależności backendu i frontendu (workspaces)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

W `backend/.env` ustaw własny `JWT_SECRET`, np. wygenerowany poleceniem:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 7.3 Zmienne środowiskowe

Pliki `.env` **nie trafiają do repozytorium** – w repo są tylko szablony `.env.example`.

### `backend/.env`

| Zmienna          | Domyślnie               | Opis                                   |
| ---------------- | ----------------------- | -------------------------------------- |
| `NODE_ENV`       | `development`           | Środowisko                             |
| `PORT`           | `3001`                  | Port API                               |
| `DATABASE_PATH`  | `./data/petcare.db`     | Plik SQLite (względem `backend/`)      |
| `JWT_SECRET`     | – (**wymagana**)        | Sekret podpisu tokenów JWT             |
| `JWT_EXPIRES_IN` | `2h`                    | Ważność tokenu                         |
| `BCRYPT_ROUNDS`  | `10`                    | Koszt haszowania haseł                 |
| `CORS_ORIGIN`    | `http://localhost:5180` | Adres frontendu dopuszczony przez CORS |

### `frontend/.env`

| Zmienna                 | Domyślnie               | Opis                          |
| ----------------------- | ----------------------- | ----------------------------- |
| `VITE_API_URL`          | `/api`                  | Bazowy adres API              |
| `VITE_API_PROXY_TARGET` | `http://localhost:3001` | Cel proxy Vite w trybie dev   |
| `VITE_APP_NAME`         | `PetCare`               | Nazwa aplikacji w interfejsie |

## 7.4 Skrypty (katalog główny)

| Polecenie          | Działanie                                     |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | API + frontend jednocześnie (concurrently)    |
| `npm run dev:api`  | Tylko backend (z automatycznym restartem)     |
| `npm run dev:web`  | Tylko frontend                                |
| `npm run build`    | Build produkcyjny frontendu → `frontend/dist` |
| `npm run db:init`  | Tworzy tabele                                 |
| `npm run db:seed`  | Dane testowe (`demo@petcare.pl` / `Demo1234`) |
| `npm run db:reset` | Czyści bazę i wgrywa dane testowe             |
| `npm run lint`     | ESLint                                        |
| `npm run format`   | Prettier                                      |

## 7.5 Narzędzia i wtyczki

**Pakiety npm:**

| Pakiet                                                         | Rola                                    |
| -------------------------------------------------------------- | --------------------------------------- |
| express, cors                                                  | serwer HTTP, CORS                       |
| better-sqlite3                                                 | sterownik SQLite                        |
| bcryptjs                                                       | haszowanie haseł                        |
| jsonwebtoken                                                   | tokeny JWT                              |
| dotenv                                                         | wczytywanie `.env`                      |
| react, react-dom, react-router-dom                             | interfejs i routing                     |
| vite, @vitejs/plugin-react                                     | serwer dev i build frontendu            |
| eslint (+ wtyczki react, react-hooks, react-refresh), prettier | jakość kodu                             |
| concurrently                                                   | równoległe uruchamianie API i frontendu |

**Rozszerzenia VS Code** (`.vscode/extensions.json` – VS Code zaproponuje instalację):
ESLint, Prettier, EditorConfig, SQLite Viewer (podgląd bazy), REST Client (`requests.http`),
PlantUML (diagram UCD), Markdown Mermaid (diagramy w dokumentacji), Code Spell Checker – polski.
