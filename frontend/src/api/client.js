import { getLanguage, translate } from '../i18n/i18n.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Wspólny klient HTTP: dokleja token JWT i język (Accept-Language), zamienia błędy na wyjątki
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json', 'Accept-Language': getLanguage() };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(translate('common.networkError'));
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.error || translate('common.serverError', { status: response.status }),
    );
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }
  return data;
}
