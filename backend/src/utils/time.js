// Pomocnicze funkcje czasu. Daty wizyt zapisujemy jako czas lokalny „YYYY-MM-DDTHH:MM”
// (tak, jak wpisuje je użytkownik), więc porównujemy je z lokalnym czasem serwera.
const pad = (n) => String(n).padStart(2, '0');

// Bieżąca chwila wg zegara serwera w formacie YYYY-MM-DDTHH:MM
export function localNowISO(date = new Date()) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

// Najpóźniejsza data „dzisiaj” na świecie (strefa UTC+14). Datę urodzenia odrzucamy dopiero,
// gdy jest późniejsza – dzięki temu „dzisiaj” użytkownika jest zawsze akceptowane,
// niezależnie od strefy czasowej (np. w Polsce tuż po północy, gdy w UTC trwa jeszcze wczoraj).
export function latestTodayISO(now = Date.now()) {
  return new Date(now + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
