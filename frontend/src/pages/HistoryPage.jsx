import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import PetAvatar from '../components/PetAvatar.jsx';
import { EmptyState, Loader } from '../components/States.jsx';
import VisitFilters from '../components/VisitFilters.jsx';
import { filtersToQuery } from '../utils/visitQuery.js';
import VisitTabs from '../components/VisitTabs.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { useVisitActions } from '../hooks/useVisitActions.js';
import { formatDate } from '../utils/format.js';

const NO_FILTERS = { petId: '', from: '', to: '' };

// Historia odbytych wizyt (status „done”, F-M-07), od najnowszej
export default function HistoryPage() {
  usePageMeta('Historia wizyt', 'Wszystkie odbyte wizyty Twoich zwierząt.');
  const [filters, setFilters] = useState(NO_FILTERS);
  const pets = useApiData('/pets');
  const visits = useApiData(`/visits?${filtersToQuery('done', filters)}`);
  const actions = useVisitActions(visits.reload);

  return (
    <>
      <VisitTabs />
      <Alert>{visits.error || actions.error}</Alert>
      <section className="section-card history-card">
        <div className="history-tools">
          <VisitFilters pets={pets.data?.pets ?? []} filters={filters} onChange={setFilters} />
        </div>
        {!visits.data ? (
          !visits.error && <Loader />
        ) : visits.data.visits.length === 0 ? (
          <EmptyState icon="file" title="Brak wizyt w historii">
            Zakończone wizyty pojawią się tutaj.
          </EmptyState>
        ) : (
          <div className="history-scroll">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Zwierzę</th>
                  <th>Cel wizyty</th>
                  <th>Gabinet</th>
                  <th>
                    <span className="sr-only">Akcje</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visits.data.visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <b>{formatDate(v.visitDateTime.slice(0, 10))}</b>
                      <small>{v.visitDateTime.slice(11, 16)}</small>
                    </td>
                    <td>
                      <Link className="table-pet" to={`/pets/${v.petId}`}>
                        <PetAvatar pet={{ id: v.petId, name: v.petName }} size={30} radius={9} />
                        <b>{v.petName}</b>
                      </Link>
                    </td>
                    <td>{v.purpose}</td>
                    <td>
                      <em>{v.clinic}</em>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Link
                          className="icon-action"
                          to={`/visits/${v.id}/edit`}
                          title="Edytuj wizytę"
                        >
                          <Icon name="edit" size={16} />
                        </Link>
                        <button
                          className="icon-action danger"
                          onClick={() => actions.remove(v)}
                          disabled={actions.busy}
                          title="Usuń wizytę"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
