import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { EmptyState, Loader } from '../components/States.jsx';
import VisitFilters from '../components/VisitFilters.jsx';
import { filtersToQuery } from '../utils/visitQuery.js';
import { VisitCard } from '../components/VisitItem.jsx';
import VisitTabs from '../components/VisitTabs.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { useVisitActions } from '../hooks/useVisitActions.js';
import { useI18n } from '../context/language.js';

const NO_FILTERS = { petId: '', from: '', to: '' };

// Zaplanowane wizyty (F-M-07) z filtrami (F-S-02) i oznaczaniem jako zakończone (F-S-03)
export default function VisitsPage() {
  const { t } = useI18n();
  usePageMeta(t('visits.title'), t('visits.subtitle'));
  const [filters, setFilters] = useState(NO_FILTERS);
  const pets = useApiData('/pets');
  const visits = useApiData(`/visits?${filtersToQuery('planned', filters)}`);
  const actions = useVisitActions(visits.reload);
  const filtered = filters.petId || filters.from || filters.to;

  return (
    <>
      <VisitTabs />
      <Alert>{visits.error || actions.error}</Alert>
      <section className="section-card appointment-page-list">
        <VisitFilters pets={pets.data?.pets ?? []} filters={filters} onChange={setFilters} />
        {!visits.data ? (
          !visits.error && <Loader />
        ) : visits.data.visits.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={filtered ? t('visits.noneFiltered') : t('visits.none')}
            action={
              !filtered && (
                <Link className="primary" to="/visits/new">
                  <Icon name="plus" size={18} /> {t('visits.plan')}
                </Link>
              )
            }
          />
        ) : (
          visits.data.visits.map((v) => (
            <VisitCard
              key={v.id}
              visit={v}
              busy={actions.busy}
              onComplete={actions.complete}
              onDelete={actions.remove}
            />
          ))
        )}
      </section>
    </>
  );
}
