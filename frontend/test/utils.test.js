// Testy logiki frontendu bez przeglądarki: formatowanie, tłumaczenia, parametry zapytań.
// Uruchomienie: npm test (z katalogu głównego) lub npm test -w frontend
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatAge,
  formatDate,
  formatDateTime,
  formatWeight,
  initials,
  isOverdue,
  nowISO,
  todayISO,
} from '../src/utils/format.js';
import { filtersToQuery } from '../src/utils/visitQuery.js';
import { getLanguage, setLanguage, translate } from '../src/i18n/i18n.js';
import { messages } from '../src/i18n/messages.js';

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function monthsAgo(n) {
  const d = new Date();
  d.setDate(1); // unikamy przeskoku miesiąca (np. 31 marca − 1 miesiąc)
  d.setMonth(d.getMonth() - n);
  return isoDate(d);
}

describe('format.js', () => {
  test('todayISO i nowISO w formacie lokalnym', () => {
    assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
    assert.match(nowISO(), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    assert.equal(todayISO(), isoDate(new Date()));
    assert.ok(nowISO().startsWith(todayISO()));
  });

  test('formatAge – miesiące, lata i polska odmiana', () => {
    setLanguage('pl');
    assert.equal(formatAge(null), null);
    assert.equal(formatAge(monthsAgo(3)), '3 mies.');
    assert.equal(formatAge(monthsAgo(12)), '1 rok');
    assert.equal(formatAge(monthsAgo(24)), '2 lata');
    assert.equal(formatAge(monthsAgo(60)), '5 lat');
    assert.equal(formatAge(monthsAgo(12 * 22)), '22 lata');
    // Data z przyszłości (podgląd formularza) nie daje ujemnego wieku
    assert.equal(formatAge('2999-01-01'), '0 mies.');
  });

  test('formatAge po angielsku', () => {
    setLanguage('en');
    assert.equal(formatAge(monthsAgo(12)), '1 year');
    assert.equal(formatAge(monthsAgo(36)), '3 years');
    setLanguage('pl');
  });

  test('formatWeight – przecinek po polsku, kropka po angielsku', () => {
    setLanguage('pl');
    assert.equal(formatWeight(4.25), '4,25 kg');
    assert.equal(formatWeight(null), '—');
    setLanguage('en');
    assert.equal(formatWeight(4.25), '4.25 kg');
    setLanguage('pl');
  });

  test('formatDate i formatDateTime', () => {
    assert.equal(formatDate(''), '—');
    assert.equal(formatDateTime(null), '—');
    assert.match(formatDate('2026-04-12'), /12/);
    assert.match(formatDateTime('2026-04-12T16:30'), /, 16:30$/);
  });

  test('isOverdue – tylko zaplanowane z datą w przeszłości', () => {
    assert.equal(isOverdue({ status: 'planned', visitDateTime: '2000-01-01T10:00' }), true);
    assert.equal(isOverdue({ status: 'planned', visitDateTime: '2999-01-01T10:00' }), false);
    assert.equal(isOverdue({ status: 'done', visitDateTime: '2000-01-01T10:00' }), false);
  });

  test('initials', () => {
    assert.equal(initials('anna@example.com'), 'AN');
    assert.equal(initials(), '');
  });
});

describe('visitQuery.js', () => {
  test('pomija puste filtry', () => {
    assert.equal(filtersToQuery('planned', { petId: '', from: '', to: '' }), 'status=planned');
  });

  test('dodaje ustawione filtry', () => {
    const query = filtersToQuery('done', { petId: '3', from: '2026-01-01', to: '2026-02-01' });
    assert.equal(query, 'status=done&petId=3&from=2026-01-01&to=2026-02-01');
  });
});

describe('i18n', () => {
  test('oba słowniki mają te same klucze', () => {
    assert.deepEqual(Object.keys(messages.en).sort(), Object.keys(messages.pl).sort());
  });

  test('parametry, liczba mnoga i brakujący klucz', () => {
    assert.equal(
      translate('visits.confirmDelete', { purpose: 'A', pet: 'Rex' }, 'pl'),
      'Usunąć wizytę „A” (Rex)?',
    );
    assert.match(translate('dashboard.statOverdue', { count: 2 }, 'pl'), /^2 zaległe/);
    assert.match(translate('dashboard.statOverdue', { count: 5 }, 'pl'), /^5 zaległych/);
    assert.equal(translate('nie.istnieje'), 'nie.istnieje');
  });

  test('nieobsługiwany język jest ignorowany', () => {
    setLanguage('pl');
    setLanguage('de');
    assert.equal(getLanguage(), 'pl');
  });
});
