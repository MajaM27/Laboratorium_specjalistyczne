// Migracje schematu dla istniejących baz (bez kasowania danych przez db:reset).
// Numer ostatniej zastosowanej migracji przechowuje PRAGMA user_version.
// Nowa baza dostaje od razu pełny schemat z schema.sql, dlatego każda migracja musi być
// idempotentna (sprawdza, czy zmiana nie została już wprowadzona).
//
// Dodając kolumnę: dopisz ją do schema.sql ORAZ dodaj tu migrację z kolejnym numerem.

function hasColumn(db, table, column) {
  // Nazwa tabeli pochodzi wyłącznie z kodu migracji (nigdy od użytkownika)
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((c) => c.name === column);
}

export const migrations = [
  {
    version: 1,
    description: 'users.token_version – unieważnianie starych tokenów po zmianie hasła',
    up(db) {
      if (!hasColumn(db, 'users', 'token_version')) {
        db.exec('ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0');
      }
    },
  },
];

// Stosuje brakujące migracje – każdą w osobnej transakcji razem ze zmianą user_version
export function migrate(db) {
  const current = db.pragma('user_version', { simple: true });
  for (const migration of migrations) {
    if (migration.version <= current) continue;
    db.transaction(() => {
      migration.up(db);
      db.pragma(`user_version = ${migration.version}`);
    })();
  }
}
