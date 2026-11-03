import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { EmptyState } from '../components/States.jsx';

export default function NotFoundPage() {
  usePageMeta('Nie znaleziono strony');
  return (
    <EmptyState
      icon="search"
      title="Ta strona nie istnieje"
      action={
        <Link className="primary" to="/">
          Wróć do panelu
        </Link>
      }
    />
  );
}
