// Parametry zapytania GET /visits z filtrów formularza
export function filtersToQuery(status, filters) {
  const params = new URLSearchParams({ status });
  for (const key of ['petId', 'from', 'to']) if (filters[key]) params.set(key, filters[key]);
  return params.toString();
}
