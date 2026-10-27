const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Wspólny klient HTTP: dokleja token JWT i zamienia odpowiedzi błędów na wyjątki
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || `Błąd serwera (${response.status})`);
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }
  return data;
}
