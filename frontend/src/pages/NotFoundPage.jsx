import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { EmptyState } from '../components/States.jsx';
import { useI18n } from '../context/language.js';

export default function NotFoundPage() {
  const { t } = useI18n();
  usePageMeta(t('notFound.pageTitle'));
  return (
    <EmptyState
      icon="search"
      title={t('notFound.title')}
      action={
        <Link className="primary" to="/">
          {t('notFound.back')}
        </Link>
      }
    />
  );
}
