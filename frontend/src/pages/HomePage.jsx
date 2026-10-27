import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';

// Tymczasowa strona startowa – sprawdza połączenie frontend → backend → baza
export default function HomePage() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiRequest('/health')
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="card">
      <h1>{import.meta.env.VITE_APP_NAME || 'PetCare'}</h1>
      <p>System zarządzania opieką nad zwierzętami.</p>
      {health && (
        <p className="status status-ok">
          API: {health.status}, baza: {health.database}
        </p>
      )}
      {error && <p className="status status-error">Brak połączenia z API: {error}</p>}
    </section>
  );
}
