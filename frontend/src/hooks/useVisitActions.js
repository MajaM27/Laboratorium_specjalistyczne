import { useState } from 'react';
import { useAuth } from '../context/auth.js';

// Wspólne akcje na wizytach: zakończenie i usunięcie (z potwierdzeniem)
export function useVisitActions(onDone) {
  const { request } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(path, method) {
    setBusy(true);
    setError('');
    try {
      await request(path, { method });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const complete = (visit) => run(`/visits/${visit.id}/complete`, 'PATCH');

  const remove = (visit) => {
    if (window.confirm(`Usunąć wizytę „${visit.purpose}” (${visit.petName})?`))
      run(`/visits/${visit.id}`, 'DELETE');
  };

  return { busy, error, complete, remove };
}
