// Formatowanie dat i liczb w interfejsie – zgodnie z wybranym językiem (pl/en)
import { getLanguage, getLocale, translate } from '../i18n/i18n.js';

const pad = (n) => String(n).padStart(2, '0');

// 'YYYY-MM-DD' → '12 kwi 2020' / '12 Apr 2020'
export function formatDate(date) {
  if (!date) return '—';
  return new Date(`${date}T12:00:00`).toLocaleDateString(getLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// 'YYYY-MM-DDTHH:MM' → '15 lis 2026, 16:30'
export function formatDateTime(value) {
  if (!value) return '—';
  return `${formatDate(value.slice(0, 10))}, ${value.slice(11, 16)}`;
}

// Części daty wizyty do „kafelka” z datą
export function dateParts(value) {
  const d = new Date(value);
  return {
    weekday: d.toLocaleDateString(getLocale(), { weekday: 'short' }).replace('.', ''),
    day: d.getDate(),
    month: d.toLocaleDateString(getLocale(), { month: 'short' }).replace('.', ''),
    time: value.slice(11, 16),
  };
}

// Dzisiejsza data do powitania, np. „wtorek, 17 listopada” / „Tuesday 17 November”
export function formatLongToday() {
  return new Date().toLocaleDateString(getLocale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// Wiek zwierzęcia z odmianą: 1 rok, 2 lata, 5 lat, 7 mies. / 1 year, 2 years, 7 mo.
export function formatAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T12:00:00`);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 12) return translate('format.months', { count: Math.max(months, 0) });
  return translate('format.years', { count: Math.floor(months / 12) });
}

export function formatWeight(weight) {
  if (weight == null) return '—';
  const value = getLanguage() === 'pl' ? String(weight).replace('.', ',') : String(weight);
  return `${value} kg`;
}

// Dzisiejsza data w formacie 'YYYY-MM-DD' (czas lokalny)
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Bieżąca chwila w formacie 'YYYY-MM-DDTHH:MM' – do porównań z datą wizyty
export function nowISO() {
  const d = new Date();
  return `${todayISO()}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isOverdue(visit) {
  return visit.status === 'planned' && visit.visitDateTime < nowISO();
}

// Inicjały do awatara użytkownika (z adresu e-mail)
export function initials(email = '') {
  return email.slice(0, 2).toUpperCase();
}
