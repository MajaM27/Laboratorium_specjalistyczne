// Tłumaczenie komunikatów API (NF-C-02). Komunikaty w kodzie są po polsku – to język domyślny.
// Gdy klient wyśle nagłówek "Accept-Language: en", komunikaty błędów są tłumaczone na angielski.

export const LANGUAGES = ['pl', 'en'];

// Wybór języka z nagłówka Accept-Language: pierwszy obsługiwany język wg kolejności klienta
export function pickLanguage(header) {
  if (typeof header !== 'string') return 'pl';
  for (const part of header.split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (LANGUAGES.includes(code)) return code;
  }
  return 'pl';
}

const EN = {
  'Adres e-mail jest wymagany.': 'Email address is required.',
  'Niepoprawny adres e-mail.': 'Invalid email address.',
  'Hasło jest wymagane.': 'Password is required.',
  'Hasło jest za długie (maks. 72 znaki).': 'Password is too long (max. 72 characters).',
  'Hasło musi zawierać co najmniej jedną literę i jedną cyfrę.':
    'Password must contain at least one letter and one digit.',
  'Popraw zaznaczone pola formularza.': 'Please correct the highlighted fields.',
  'Podaj poprawną datę urodzenia (RRRR-MM-DD).': 'Enter a valid date of birth (YYYY-MM-DD).',
  'Data urodzenia nie może być z przyszłości.': 'Date of birth cannot be in the future.',
  'Waga musi być liczbą.': 'Weight must be a number.',
  'Waga musi być liczbą większą od 0.': 'Weight must be a number greater than 0.',
  'Waga może wynosić maksymalnie 1000 kg.': 'Weight can be at most 1000 kg.',
  'Wybierz zwierzę.': 'Select a pet.',
  'Wybierz zwierzę z listy.': 'Select a pet from the list.',
  'Podaj datę i godzinę wizyty.': 'Enter the visit date and time.',
  'Podaj poprawną datę i godzinę (RRRR-MM-DDTGG:MM).':
    'Enter a valid date and time (YYYY-MM-DDTHH:MM).',
  'Status musi mieć wartość „planned” lub „done”.': 'Status must be "planned" or "done".',
  'Konto z tym adresem e-mail już istnieje.': 'An account with this email address already exists.',
  'Ten adres e-mail jest już zajęty.': 'This email address is already taken.',
  'Konto zostało utworzone. Możesz się zalogować.': 'Account created. You can now sign in.',
  'Podaj adres e-mail i hasło.': 'Enter your email address and password.',
  'Nieprawidłowy adres e-mail lub hasło.': 'Invalid email address or password.',
  'Nie znaleziono wybranego zwierzęcia.': 'The selected pet was not found.',
  'Nie znaleziono zwierzęcia.': 'Pet not found.',
  'Nie znaleziono wizyty.': 'Visit not found.',
  'Podaj poprawną datę (RRRR-MM-DD).': 'Enter a valid date (YYYY-MM-DD).',
  'Data końcowa nie może być wcześniejsza niż początkowa.':
    'The end date cannot be earlier than the start date.',
  'Niepoprawny identyfikator zwierzęcia.': 'Invalid pet identifier.',
  'Niepoprawne filtry wizyt.': 'Invalid visit filters.',
  'Zaloguj się, aby kontynuować.': 'Sign in to continue.',
  'Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.':
    'Your session has expired or is invalid. Please sign in again.',
  'Niepoprawny format JSON w treści żądania.': 'Invalid JSON in the request body.',
  'Treść żądania jest za duża.': 'The request body is too large.',
  'Niepoprawne żądanie.': 'Bad request.',
  'Wewnętrzny błąd serwera.': 'Internal server error.',
};

// Nazwy pól używane w komunikatach walidacji
const FIELD_LABELS_EN = {
  Imię: 'Name',
  Gatunek: 'Species',
  Rasa: 'Breed',
  Notatki: 'Notes',
  Gabinet: 'Clinic',
  'Cel wizyty': 'Purpose',
};
const label = (name) => FIELD_LABELS_EN[name] ?? name;

// Komunikaty z parametrami
const EN_PATTERNS = [
  [
    /^Hasło musi mieć co najmniej (\d+) znaków\.$/,
    (n) => `Password must be at least ${n} characters long.`,
  ],
  [/^Pole „(.+)” jest wymagane\.$/, (f) => `The "${label(f)}" field is required.`],
  [/^Pole „(.+)” musi być tekstem\.$/, (f) => `The "${label(f)}" field must be text.`],
  [
    /^Pole „(.+)” może mieć maksymalnie (\d+) znaków\.$/,
    (f, n) => `The "${label(f)}" field can have at most ${n} characters.`,
  ],
  [/^Nie znaleziono: (.+)$/, (route) => `Not found: ${route}`],
];

export function translate(message, lang) {
  if (lang !== 'en' || typeof message !== 'string') return message;
  if (EN[message]) return EN[message];
  for (const [pattern, build] of EN_PATTERNS) {
    const match = pattern.exec(message);
    if (match) return build(...match.slice(1));
  }
  return message;
}

// Tłumaczy obiekt { pole: komunikat } z błędami walidacji
export function translateDetails(details, lang) {
  if (!details) return details;
  return Object.fromEntries(Object.entries(details).map(([k, v]) => [k, translate(v, lang)]));
}
