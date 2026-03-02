import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Statistiken from '@/components/admin/Statistiken';
import AlleAnfragen from '@/components/admin/AlleAnfragen';
import Preisparameter from '@/components/admin/Preisparameter';
import Nutzerverwaltung from '@/components/admin/Nutzerverwaltung';

const ChartIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ListIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const TagIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const UsersIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

function useRouteTitle() {
  const path = window.location.pathname;
  if (path.includes('/anfragen')) return 'Alle Anfragen';
  if (path.includes('/preise')) return 'Preisparameter';
  if (path.includes('/nutzer')) return 'Nutzerverwaltung';
  return 'Statistiken';
}

export default function AdminDashboard() {
  const navItems = [
    { to: '/admin', label: 'Statistiken', icon: <ChartIcon /> },
    { to: '/admin/anfragen', label: 'Alle Anfragen', icon: <ListIcon /> },
    { to: '/admin/preise', label: 'Preisparameter', icon: <TagIcon /> },
    { to: '/admin/nutzer', label: 'Nutzerverwaltung', icon: <UsersIcon /> },
  ];

  return (
    <Layout navItems={navItems} title={useRouteTitle()}>
      <Routes>
        <Route index element={<Statistiken />} />
        <Route path="anfragen" element={<AlleAnfragen />} />
        <Route path="preise" element={<Preisparameter />} />
        <Route path="nutzer" element={<Nutzerverwaltung />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  );
}
