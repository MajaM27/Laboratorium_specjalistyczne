// Użycie: npm run db:init            – tworzy brakujące tabele
//         npm run db:init -- --reset – usuwa wszystkie dane i tworzy tabele od nowa
import { db, applySchema } from './index.js';
import { config } from '../config.js';

if (process.argv.includes('--reset')) {
  db.exec('DROP TABLE IF EXISTS visits; DROP TABLE IF EXISTS pets; DROP TABLE IF EXISTS users;');
  console.log('Usunięto istniejące tabele.');
}

applySchema();
console.log(`Schemat bazy gotowy: ${config.databasePath}`);
db.close();
