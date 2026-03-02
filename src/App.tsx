import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import Login from '@/pages/Login';
import Kundenportal from '@/pages/Kundenportal';
import SachbearbeiterDashboard from '@/pages/SachbearbeiterDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (requiredRole && currentUser.rolle !== requiredRole) {
    return <Navigate to={currentUser.rolle === 'admin' ? '/admin' : '/sachbearbeiter'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route path="/portal" element={<Kundenportal />} />
      <Route
        path="/"
        element={
          currentUser
            ? <Navigate to={currentUser.rolle === 'admin' ? '/admin' : '/sachbearbeiter'} replace />
            : <Login />
        }
      />
      <Route
        path="/sachbearbeiter/*"
        element={
          <ProtectedRoute>
            <SachbearbeiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  );
}
