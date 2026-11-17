// Testy integracyjne API: prawdziwy serwer Express + baza SQLite w pamięci.
// Uruchomienie: npm test (z katalogu głównego lub backend/)
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Zmienne ustawiamy przed wczytaniem aplikacji – dotenv nie nadpisuje już ustawionych wartości
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';
process.env.JWT_SECRET = 'sekret-tylko-do-testow';
process.env.BCRYPT_ROUNDS = '4';

const { createApp } = await import('../src/app.js');
const { db, applySchema } = await import('../src/db/index.js');

let server;
let baseUrl;

before(async () => {
  applySchema();
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
});

async function api(method, path, { token, body, rawBody, headers = {} } = {}) {
  const init = { method, headers: { ...headers } };
  if (token) init.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  if (rawBody !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = rawBody;
  }
  const res = await fetch(`${baseUrl}${path}`, init);
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
}

let counter = 0;
async function createUser() {
  counter += 1;
  const email = `user${counter}@test.pl`;
  const password = 'Haslo1234';
  assert.equal((await api('POST', '/auth/register', { body: { email, password } })).status, 201);
  const login = await api('POST', '/auth/login', { body: { email, password } });
  assert.equal(login.status, 200);
  return { email, token: login.body.token, id: login.body.user.id };
}

async function createPet(token, data = {}) {
  const res = await api('POST', '/pets', {
    token,
    body: { name: 'Rex', species: 'Pies', ...data },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.pet;
}

async function createVisit(token, petId, data = {}) {
  const res = await api('POST', '/visits', {
    token,
    body: {
      petId,
      visitDateTime: '2026-12-01T10:00',
      clinic: 'VetCare',
      purpose: 'Kontrola',
      ...data,
    },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.visit;
}

describe('Ogólne', () => {
  test('health-check', async () => {
    const res = await api('GET', '/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  test('nieznany endpoint → 404 w formacie JSON', async () => {
    const res = await api('GET', '/nie-ma-takiego');
    assert.equal(res.status, 404);
    assert.match(res.body.error, /Nie znaleziono/);
  });

  test('niepoprawny JSON → 400', async () => {
    const res = await api('POST', '/auth/login', { rawBody: '{"email":' });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /JSON/);
  });

  test('za duża treść żądania → 413', async () => {
    const res = await api('POST', '/auth/login', {
      body: { email: 'a@b.pl', password: 'x'.repeat(200_000) },
    });
    assert.equal(res.status, 413);
  });
});

describe('Autoryzacja (PU-01, PU-02)', () => {
  test('rejestracja i logowanie', async () => {
    const reg = await api('POST', '/auth/register', {
      body: { email: '  Nowy@Test.PL ', password: 'Haslo1234' },
    });
    assert.equal(reg.status, 201);
    assert.equal(reg.body.user.email, 'nowy@test.pl');
    assert.equal(reg.body.user.password_hash, undefined);

    const login = await api('POST', '/auth/login', {
      body: { email: 'NOWY@test.pl', password: 'Haslo1234' },
    });
    assert.equal(login.status, 200);
    assert.ok(login.body.token);

    const me = await api('GET', '/auth/me', { token: login.body.token });
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, 'nowy@test.pl');
  });

  test('błędne dane rejestracji → 400 z błędami pól', async () => {
    const res = await api('POST', '/auth/register', { body: { email: 'zly', password: 'abc' } });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.email);
    assert.ok(res.body.details.password);
  });

  test('hasło bez cyfry → 400', async () => {
    const res = await api('POST', '/auth/register', {
      body: { email: 'bezcyfry@test.pl', password: 'abcdefghij' },
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.password);
  });

  test('zajęty e-mail → 409 (bez względu na wielkość liter)', async () => {
    const { email } = await createUser();
    const res = await api('POST', '/auth/register', {
      body: { email: email.toUpperCase(), password: 'Haslo1234' },
    });
    assert.equal(res.status, 409);
  });

  test('złe hasło i brak konta → ten sam komunikat 401', async () => {
    const { email } = await createUser();
    const wrong = await api('POST', '/auth/login', { body: { email, password: 'Zle12345' } });
    const missing = await api('POST', '/auth/login', {
      body: { email: 'nikt@test.pl', password: 'Haslo1234' },
    });
    assert.equal(wrong.status, 401);
    assert.equal(missing.status, 401);
    assert.equal(wrong.body.error, missing.body.error);
  });

  test('logowanie bez danych → 400', async () => {
    assert.equal((await api('POST', '/auth/login', { body: {} })).status, 400);
    assert.equal((await api('POST', '/auth/login')).status, 400);
  });

  test('brak, zły lub sfałszowany token → 401', async () => {
    assert.equal((await api('GET', '/auth/me')).status, 401);
    assert.equal((await api('GET', '/auth/me', { token: 'abc.def.ghi' })).status, 401);
    const basic = await api('GET', '/auth/me', { headers: { Authorization: 'Basic abc' } });
    assert.equal(basic.status, 401);

    // Token z algorytmem "none" (bez podpisu) musi zostać odrzucony
    const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsigned = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: '1' })}.`;
    assert.equal((await api('GET', '/auth/me', { token: unsigned })).status, 401);
  });

  test('schemat "bearer" małymi literami jest akceptowany', async () => {
    const { token } = await createUser();
    const res = await api('GET', '/auth/me', { headers: { Authorization: `bearer ${token}` } });
    assert.equal(res.status, 200);
  });

  test('token usuniętego konta → 401', async () => {
    const { token, id } = await createUser();
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    assert.equal((await api('GET', '/auth/me', { token })).status, 401);
  });
});

describe('Zwierzęta (PU-03)', () => {
  let owner;
  let other;

  before(async () => {
    owner = await createUser();
    other = await createUser();
  });

  test('wymaga logowania', async () => {
    assert.equal((await api('GET', '/pets')).status, 401);
  });

  test('dodanie, odczyt, edycja, usunięcie', async () => {
    const pet = await createPet(owner.token, {
      name: '  Burek ',
      breed: '',
      birthDate: '2021-05-01',
      weight: '12.345',
    });
    assert.equal(pet.name, 'Burek');
    assert.equal(pet.breed, null);
    assert.equal(pet.weight, 12.35);
    assert.equal(pet.visitCount, 0);
    assert.equal(pet.nextVisit, null);

    const got = await api('GET', `/pets/${pet.id}`, { token: owner.token });
    assert.equal(got.status, 200);
    assert.equal(got.body.pet.birthDate, '2021-05-01');

    const put = await api('PUT', `/pets/${pet.id}`, {
      token: owner.token,
      body: { name: 'Burek II', species: 'Pies', weight: 13 },
    });
    assert.equal(put.status, 200);
    assert.equal(put.body.pet.name, 'Burek II');
    assert.equal(put.body.pet.birthDate, null);

    assert.equal((await api('DELETE', `/pets/${pet.id}`, { token: owner.token })).status, 204);
    assert.equal((await api('GET', `/pets/${pet.id}`, { token: owner.token })).status, 404);
  });

  test('walidacja danych zwierzęcia', async () => {
    const res = await api('POST', '/pets', {
      token: owner.token,
      body: {
        name: '',
        species: 'x'.repeat(51),
        birthDate: '2026-02-30',
        weight: -1,
        notes: 5,
      },
    });
    assert.equal(res.status, 400);
    assert.deepEqual(Object.keys(res.body.details).sort(), [
      'birthDate',
      'name',
      'notes',
      'species',
      'weight',
    ]);
  });

  test('data urodzenia z przyszłości → 400', async () => {
    const res = await api('POST', '/pets', {
      token: owner.token,
      body: { name: 'A', species: 'Kot', birthDate: '2999-01-01' },
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.birthDate);
  });

  test('waga innego typu niż liczba/tekst → 400', async () => {
    for (const weight of [true, [5], { kg: 5 }]) {
      const res = await api('POST', '/pets', {
        token: owner.token,
        body: { name: 'A', species: 'Kot', weight },
      });
      assert.equal(res.status, 400, `weight=${JSON.stringify(weight)}`);
    }
  });

  test('brak treści żądania → 400, nie 500', async () => {
    assert.equal((await api('POST', '/pets', { token: owner.token })).status, 400);
  });

  test('wyszukiwanie po imieniu (bez rozróżniania wielkości liter, % dosłownie)', async () => {
    const user = await createUser();
    await createPet(user.token, { name: 'Rex' });
    await createPet(user.token, { name: 'Luna' });
    await createPet(user.token, { name: 'Max%' });

    const all = await api('GET', '/pets', { token: user.token });
    assert.deepEqual(
      all.body.pets.map((p) => p.name),
      ['Luna', 'Max%', 'Rex'],
    );

    const re = await api('GET', '/pets?search=RE', { token: user.token });
    assert.deepEqual(
      re.body.pets.map((p) => p.name),
      ['Rex'],
    );

    const percent = await api('GET', '/pets?search=%25', { token: user.token });
    assert.deepEqual(
      percent.body.pets.map((p) => p.name),
      ['Max%'],
    );
  });

  test('izolacja: cudze zwierzę → 404 (odczyt, edycja, usunięcie)', async () => {
    const pet = await createPet(owner.token);
    const body = { name: 'Hack', species: 'Pies' };
    assert.equal((await api('GET', `/pets/${pet.id}`, { token: other.token })).status, 404);
    assert.equal((await api('PUT', `/pets/${pet.id}`, { token: other.token, body })).status, 404);
    assert.equal((await api('DELETE', `/pets/${pet.id}`, { token: other.token })).status, 404);

    const list = await api('GET', '/pets', { token: other.token });
    assert.ok(!list.body.pets.some((p) => p.id === pet.id));

    const still = await api('GET', `/pets/${pet.id}`, { token: owner.token });
    assert.equal(still.body.pet.name, 'Rex');
  });

  test('niepoprawne id → 404', async () => {
    for (const id of ['abc', '1.5', '0', '-1', '99999999']) {
      assert.equal((await api('GET', `/pets/${id}`, { token: owner.token })).status, 404, id);
    }
  });

  test('usunięcie zwierzęcia usuwa jego wizyty', async () => {
    const pet = await createPet(owner.token);
    const visit = await createVisit(owner.token, pet.id);
    await api('DELETE', `/pets/${pet.id}`, { token: owner.token });
    assert.equal((await api('GET', `/visits/${visit.id}`, { token: owner.token })).status, 404);
    const row = db.prepare('SELECT COUNT(*) AS n FROM visits WHERE pet_id = ?').get(pet.id);
    assert.equal(row.n, 0);
  });
});

describe('Wizyty (PU-04)', () => {
  let owner;
  let other;
  let pet;

  before(async () => {
    owner = await createUser();
    other = await createUser();
    pet = await createPet(owner.token, { name: 'Luna', species: 'Kot' });
  });

  test('dodanie wizyty – domyślnie status planned', async () => {
    const visit = await createVisit(owner.token, pet.id, { clinic: '  Klinika ' });
    assert.equal(visit.status, 'planned');
    assert.equal(visit.clinic, 'Klinika');
    assert.equal(visit.petName, 'Luna');
    assert.equal(visit.visitDateTime, '2026-12-01T10:00');
  });

  test('walidacja danych wizyty', async () => {
    const res = await api('POST', '/visits', {
      token: owner.token,
      body: { petId: 'abc', visitDateTime: '2026-13-01T25:00', clinic: '', status: 'x' },
    });
    assert.equal(res.status, 400);
    assert.deepEqual(Object.keys(res.body.details).sort(), [
      'clinic',
      'petId',
      'purpose',
      'status',
      'visitDateTime',
    ]);
  });

  test('petId innego typu niż liczba/tekst → 400', async () => {
    const res = await api('POST', '/visits', {
      token: owner.token,
      body: { petId: true, visitDateTime: '2026-12-01T10:00', clinic: 'A', purpose: 'B' },
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.petId);
  });

  test('wizyta dla cudzego zwierzęcia → 400 z błędem pola petId', async () => {
    const res = await api('POST', '/visits', {
      token: other.token,
      body: { petId: pet.id, visitDateTime: '2026-12-01T10:00', clinic: 'A', purpose: 'B' },
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.details.petId);
  });

  test('izolacja: cudza wizyta → 404', async () => {
    const visit = await createVisit(owner.token, pet.id);
    const t = other.token;
    assert.equal((await api('GET', `/visits/${visit.id}`, { token: t })).status, 404);
    assert.equal((await api('PATCH', `/visits/${visit.id}/complete`, { token: t })).status, 404);
    assert.equal((await api('DELETE', `/visits/${visit.id}`, { token: t })).status, 404);
    const list = await api('GET', '/visits', { token: t });
    assert.equal(list.body.total, 0);
  });

  test('edycja bez statusu nie zmienia statusu', async () => {
    const visit = await createVisit(owner.token, pet.id, { status: 'done' });
    const res = await api('PUT', `/visits/${visit.id}`, {
      token: owner.token,
      body: { petId: pet.id, visitDateTime: '2026-01-05T08:30', clinic: 'X', purpose: 'Y' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.visit.status, 'done');
    assert.equal(res.body.visit.visitDateTime, '2026-01-05T08:30');
  });

  test('oznaczenie jako zakończonej – idempotentne', async () => {
    const visit = await createVisit(owner.token, pet.id);
    const first = await api('PATCH', `/visits/${visit.id}/complete`, { token: owner.token });
    const second = await api('PATCH', `/visits/${visit.id}/complete`, { token: owner.token });
    assert.equal(first.status, 200);
    assert.equal(first.body.visit.status, 'done');
    assert.equal(second.status, 200);
  });

  test('usunięcie wizyty', async () => {
    const visit = await createVisit(owner.token, pet.id);
    assert.equal((await api('DELETE', `/visits/${visit.id}`, { token: owner.token })).status, 204);
    assert.equal((await api('GET', `/visits/${visit.id}`, { token: owner.token })).status, 404);
  });

  test('filtry i sortowanie listy', async () => {
    const user = await createUser();
    const a = await createPet(user.token, { name: 'A' });
    const b = await createPet(user.token, { name: 'B' });
    await createVisit(user.token, a.id, { visitDateTime: '2026-11-20T09:00' });
    await createVisit(user.token, b.id, { visitDateTime: '2026-11-15T09:00' });
    await createVisit(user.token, a.id, { visitDateTime: '2026-03-01T09:00', status: 'done' });
    await createVisit(user.token, a.id, { visitDateTime: '2026-05-01T23:59', status: 'done' });

    const planned = await api('GET', '/visits?status=planned', { token: user.token });
    assert.deepEqual(
      planned.body.visits.map((v) => v.visitDateTime),
      ['2026-11-15T09:00', '2026-11-20T09:00'],
    );

    const done = await api('GET', '/visits?status=done', { token: user.token });
    assert.deepEqual(
      done.body.visits.map((v) => v.visitDateTime),
      ['2026-05-01T23:59', '2026-03-01T09:00'],
    );

    // Zakres dat obejmuje całe dni (także 23:59 dnia "to")
    const range = await api('GET', '/visits?from=2026-05-01&to=2026-05-01', { token: user.token });
    assert.equal(range.body.total, 1);

    const byPet = await api('GET', `/visits?petId=${b.id}`, { token: user.token });
    assert.equal(byPet.body.total, 1);
    assert.equal(byPet.body.visits[0].petName, 'B');
  });

  test('niepoprawne filtry → 400', async () => {
    const res = await api('GET', '/visits?status=x&from=2026-02-30&petId=-1', {
      token: owner.token,
    });
    assert.equal(res.status, 400);
    assert.deepEqual(Object.keys(res.body.details).sort(), ['from', 'petId', 'status']);

    const reversed = await api('GET', '/visits?from=2026-05-02&to=2026-05-01', {
      token: owner.token,
    });
    assert.equal(reversed.status, 400);
    assert.ok(reversed.body.details.to);
  });

  test('lista zwierząt pokazuje liczbę wizyt i najbliższą zaplanowaną', async () => {
    const user = await createUser();
    const p = await createPet(user.token);
    await createVisit(user.token, p.id, { visitDateTime: '2026-12-10T10:00' });
    await createVisit(user.token, p.id, { visitDateTime: '2026-12-05T10:00' });
    await createVisit(user.token, p.id, { visitDateTime: '2026-01-01T10:00', status: 'done' });
    const res = await api('GET', `/pets/${p.id}`, { token: user.token });
    assert.equal(res.body.pet.visitCount, 3);
    assert.equal(res.body.pet.nextVisit, '2026-12-05T10:00');
  });
});

describe('Statystyki', () => {
  test('nowe konto – same zera', async () => {
    const { token } = await createUser();
    const res = await api('GET', '/stats', { token });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      petCount: 0,
      plannedVisitCount: 0,
      doneVisitCount: 0,
      nextVisit: null,
    });
  });

  test('liczniki i najbliższa wizyta tylko z własnych danych', async () => {
    const user = await createUser();
    const intruder = await createUser();
    const p = await createPet(user.token);
    await createPet(user.token, { name: 'Drugi' });
    await createVisit(user.token, p.id, { visitDateTime: '2026-12-10T10:00' });
    await createVisit(user.token, p.id, { visitDateTime: '2026-12-01T10:00' });
    await createVisit(user.token, p.id, { status: 'done' });
    const ip = await createPet(intruder.token);
    await createVisit(intruder.token, ip.id, { visitDateTime: '2026-01-01T00:00' });

    const res = await api('GET', '/stats', { token: user.token });
    assert.equal(res.body.petCount, 2);
    assert.equal(res.body.plannedVisitCount, 2);
    assert.equal(res.body.doneVisitCount, 1);
    assert.equal(res.body.nextVisit.visitDateTime, '2026-12-01T10:00');
  });
});
