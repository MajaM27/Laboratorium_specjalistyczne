import { useState } from 'react';
import { useAuth } from '../context/auth.js';
import { useI18n } from '../context/language.js';
import { nowISO } from '../utils/format.js';

// Wspólne akcje na wizytach: zakończenie i usunięcie (z potwierdzeniem)
export function useVisitActions(onDone) {
  const { request } = useAuth();
  const { t } = useI18n();
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

  const names = (visit) => ({ purpose: visit.purpose, pet: visit.petName });

  // Wizyta z przyszłości raczej się jeszcze nie odbyła – prosimy o potwierdzenie
  const complete = (visit) => {
    const future = visit.visitDateTime > nowISO();
    if (future && !window.confirm(t('visits.confirmCompleteFuture', names(visit)))) return;
    run(`/visits/${visit.id}/complete`, 'PATCH');
  };

  const remove = (visit) => {
    if (window.confirm(t('visits.confirmDelete', names(visit))))
      run(`/visits/${visit.id}`, 'DELETE');
  };

  return { busy, error, complete, remove };
}
