// Dane testowe. Konto demo: demo@petcare.pl / Demo1234
import bcrypt from 'bcryptjs';
import { db, applySchema } from './index.js';
import { config } from '../config.js';
import { localNowISO } from '../utils/time.js';

// Daty wizyt liczone względem dnia uruchomienia seeda – dane demo nie „starzeją się”
// (zaplanowane wizyty są zawsze w przyszłości, odbyte w przeszłości).
function daysFromToday(days, time) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${localNowISO(date).slice(0, 10)}T${time}`;
}

applySchema();

const email = 'demo@petcare.pl';

const seed = db.transaction(() => {
  db.prepare('DELETE FROM users WHERE email = ?').run(email);

  const passwordHash = bcrypt.hashSync('Demo1234', config.bcryptRounds);
  const userId = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, passwordHash).lastInsertRowid;

  const insertPet = db.prepare(
    `INSERT INTO pets (user_id, name, species, breed, birth_date, weight, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const rexId = insertPet.run(
    userId,
    'Rex',
    'Pies',
    'Labrador',
    '2020-04-12',
    31.5,
    'Alergia na kurczaka',
  ).lastInsertRowid;
  const lunaId = insertPet.run(
    userId,
    'Luna',
    'Kot',
    'Europejski',
    '2022-09-01',
    4.2,
    null,
  ).lastInsertRowid;

  const insertVisit = db.prepare(
    `INSERT INTO visits (pet_id, visit_datetime, clinic, purpose, status) VALUES (?, ?, ?, ?, ?)`,
  );
  insertVisit.run(
    rexId,
    daysFromToday(-120, '10:00'),
    'VetCare Lublin',
    'Szczepienie przeciw wściekliźnie',
    'done',
  );
  insertVisit.run(
    rexId,
    daysFromToday(3, '16:30'),
    'VetCare Lublin',
    'Kontrola okresowa',
    'planned',
  );
  insertVisit.run(
    lunaId,
    daysFromToday(16, '09:15'),
    'Klinika Pod Łapą',
    'Sterylizacja – konsultacja',
    'planned',
  );
});

seed();
console.log(`Dodano dane testowe (${email} / Demo1234).`);
db.close();
