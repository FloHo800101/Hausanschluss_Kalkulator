import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Inbox from '@/components/sachbearbeiter/Inbox';
import AnfrageDetail from '@/components/sachbearbeiter/AnfrageDetail';
import Kalkulation from '@/components/sachbearbeiter/Kalkulation';
import { useApp } from '@/context/AppContext';

const InboxIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const CalcIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

function useRouteTitle() {
  const path = window.location.pathname;
  if (path.includes('/kalkulation/')) return 'Kalkulation';
  if (path.includes('/anfrage/')) return 'Anfrage Details';
  return 'Eingangskorb';
}

export default function SachbearbeiterDashboard() {
  const { anfragen } = useApp();
  const neuCount = anfragen.filter(a => a.status === 'neu').length;
  const kalkuliertCount = anfragen.filter(a => a.status === 'kalkuliert').length;

  const navItems = [
    {
      to: '/sachbearbeiter',
      label: 'Eingangskorb',
      icon: <InboxIcon />,
      badge: neuCount,
    },
    {
      to: '/sachbearbeiter/kalkulationen',
      label: 'Kalkulationen',
      icon: <CalcIcon />,
      badge: kalkuliertCount,
    },
  ];

  return (
    <Layout navItems={navItems} title={useRouteTitle()}>
      <Routes>
        <Route index element={<Inbox />} />
        <Route path="anfrage/:id" element={<AnfrageDetail />} />
        <Route path="kalkulation/:id" element={<Kalkulation />} />
        <Route path="kalkulationen" element={<Inbox />} />
        <Route path="*" element={<Navigate to="/sachbearbeiter" replace />} />
      </Routes>
    </Layout>
  );
}
