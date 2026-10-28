import { HttpError } from './httpError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(value) {
  if (typeof value !== 'string' || value.trim() === '') return 'Adres e-mail jest wymagany.';
  if (value.length > 254 || !EMAIL_PATTERN.test(value.trim())) return 'Niepoprawny adres e-mail.';
  return null;
}

// Hasło: min. 8 znaków, co najmniej jedna litera i jedna cyfra
export function validatePassword(value) {
  if (typeof value !== 'string' || value === '') return 'Hasło jest wymagane.';
  if (value.length < PASSWORD_MIN_LENGTH)
    return `Hasło musi mieć co najmniej ${PASSWORD_MIN_LENGTH} znaków.`;
  // bcrypt bierze pod uwagę tylko pierwsze 72 bajty hasła
  if (Buffer.byteLength(value, 'utf8') > 72) return 'Hasło jest za długie (maks. 72 znaki).';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value))
    return 'Hasło musi zawierać co najmniej jedną literę i jedną cyfrę.';
  return null;
}

// Przyjmuje obiekt { pole: komunikat | null } i rzuca 400, jeśli którykolwiek komunikat istnieje
export function assertValid(checks) {
  const details = Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
  if (Object.keys(details).length > 0) {
    throw new HttpError(400, 'Popraw zaznaczone pola formularza.', details);
  }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isEmpty(value) {
  return (
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
  );
}

function validateText(value, { label, required = false, max }) {
  if (isEmpty(value)) return required ? `Pole „${label}” jest wymagane.` : null;
  if (typeof value !== 'string') return `Pole „${label}” musi być tekstem.`;
  if (value.trim().length > max) return `Pole „${label}” może mieć maksymalnie ${max} znaków.`;
  return null;
}

// Data w formacie YYYY-MM-DD, która faktycznie istnieje w kalendarzu (np. odrzuca 2026-02-30)
export function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateBirthDate(value) {
  if (isEmpty(value)) return null;
  if (!isValidDate(value)) return 'Podaj poprawną datę urodzenia (RRRR-MM-DD).';
  if (value > new Date().toISOString().slice(0, 10))
    return 'Data urodzenia nie może być z przyszłości.';
  return null;
}

function validateWeight(value) {
  if (isEmpty(value)) return null;
  const weight = Number(value);
  if (!Number.isFinite(weight) || weight <= 0) return 'Waga musi być liczbą większą od 0.';
  if (weight > 1000) return 'Waga może wynosić maksymalnie 1000 kg.';
  return null;
}

function cleanText(value) {
  return isEmpty(value) ? null : value.trim();
}

// Waliduje dane zwierzęcia (PU-03) i zwraca je w postaci gotowej do zapisu w bazie
export function parsePetInput(body) {
  const input = body ?? {};
  assertValid({
    name: validateText(input.name, { label: 'Imię', required: true, max: 50 }),
    species: validateText(input.species, { label: 'Gatunek', required: true, max: 50 }),
    breed: validateText(input.breed, { label: 'Rasa', max: 50 }),
    birthDate: validateBirthDate(input.birthDate),
    weight: validateWeight(input.weight),
    notes: validateText(input.notes, { label: 'Notatki', max: 1000 }),
  });

  return {
    name: input.name.trim(),
    species: input.species.trim(),
    breed: cleanText(input.breed),
    birth_date: isEmpty(input.birthDate) ? null : input.birthDate,
    weight: isEmpty(input.weight) ? null : Math.round(Number(input.weight) * 100) / 100,
    notes: cleanText(input.notes),
  };
}

const DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/;

export const VISIT_STATUSES = ['planned', 'done'];

// Data i godzina w formacie YYYY-MM-DDTHH:MM (jak <input type="datetime-local">)
export function isValidDateTime(value) {
  const match = typeof value === 'string' ? DATETIME_PATTERN.exec(value) : null;
  if (!match) return false;
  const [, date, hours, minutes] = match;
  return isValidDate(date) && Number(hours) < 24 && Number(minutes) < 60;
}

function validatePetId(value) {
  if (isEmpty(value)) return 'Wybierz zwierzę.';
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return 'Wybierz zwierzę z listy.';
  return null;
}

function validateVisitDateTime(value) {
  if (isEmpty(value)) return 'Podaj datę i godzinę wizyty.';
  if (!isValidDateTime(value)) return 'Podaj poprawną datę i godzinę (RRRR-MM-DDTGG:MM).';
  return null;
}

function validateStatus(value) {
  if (value === undefined) return null;
  if (!VISIT_STATUSES.includes(value)) return 'Status musi mieć wartość „planned” lub „done”.';
  return null;
}

// Waliduje dane wizyty (PU-04). Pominięty status zwracany jest jako undefined –
// przy dodawaniu oznacza „planned”, przy edycji pozostawia dotychczasowy status.
export function parseVisitInput(body) {
  const input = body ?? {};
  assertValid({
    petId: validatePetId(input.petId),
    visitDateTime: validateVisitDateTime(input.visitDateTime),
    clinic: validateText(input.clinic, { label: 'Gabinet', required: true, max: 100 }),
    purpose: validateText(input.purpose, { label: 'Cel wizyty', required: true, max: 200 }),
    status: validateStatus(input.status),
  });

  return {
    pet_id: Number(input.petId),
    visit_datetime: input.visitDateTime,
    clinic: input.clinic.trim(),
    purpose: input.purpose.trim(),
    status: input.status,
  };
}
