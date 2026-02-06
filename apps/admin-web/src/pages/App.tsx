import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { isAuthed } from '../lib/auth';
import Layout from './Layout';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import VehiclesPage from './VehiclesPage';
import RentalsPage from './RentalsPage';
import MaintenancePage from './MaintenancePage';
import AuditLogsPage from './AuditLogsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  if (!isAuthed()) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="rentals" element={<RentalsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
