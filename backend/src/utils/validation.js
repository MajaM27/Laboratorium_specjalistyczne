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
