import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/routes.jsx';
import AccountPage from './pages/AccountPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PetDetailsPage from './pages/PetDetailsPage.jsx';
import PetFormPage from './pages/PetFormPage.jsx';
import PetsPage from './pages/PetsPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VisitFormPage from './pages/VisitFormPage.jsx';
import VisitsPage from './pages/VisitsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pets" element={<PetsPage />} />
          <Route path="pets/new" element={<PetFormPage />} />
          <Route path="pets/:id" element={<PetDetailsPage />} />
          <Route path="pets/:id/edit" element={<PetFormPage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="visits/new" element={<VisitFormPage />} />
          <Route path="visits/:id/edit" element={<VisitFormPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
