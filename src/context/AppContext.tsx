import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Anfrage, Preiskonfiguration, Nutzer } from '@/types';
import { mockAnfragen, mockNutzer } from '@/data/mockAnfragen';
import { defaultPreiskonfiguration } from '@/data/preiskonfiguration';

export type UserRole = 'sachbearbeiter' | 'admin';

interface AppState {
  currentUser: { name: string; rolle: UserRole } | null;
  anfragen: Anfrage[];
  nutzer: Nutzer[];
  preiskonfiguration: Preiskonfiguration;
  login: (rolle: UserRole) => void;
  logout: () => void;
  addAnfrage: (anfrage: Anfrage) => void;
  updateAnfrage: (anfrage: Anfrage) => void;
  updatePreiskonfiguration: (config: Preiskonfiguration) => void;
  updateNutzer: (nutzer: Nutzer[]) => void;
}

const AppContext = createContext<AppState | null>(null);

const DEMO_USERS: Record<UserRole, string> = {
  sachbearbeiter: 'Stefan Müller',
  admin: 'Admin Netz-KA',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppState['currentUser']>(null);
  const [anfragen, setAnfragen] = useState<Anfrage[]>(mockAnfragen);
  const [nutzer, setNutzer] = useState<Nutzer[]>(mockNutzer);
  const [preiskonfiguration, setPreiskonfiguration] = useState<Preiskonfiguration>(defaultPreiskonfiguration);

  function login(rolle: UserRole) {
    setCurrentUser({ name: DEMO_USERS[rolle], rolle });
  }

  function logout() {
    setCurrentUser(null);
  }

  function addAnfrage(anfrage: Anfrage) {
    setAnfragen(prev => [anfrage, ...prev]);
  }

  function updateAnfrage(updated: Anfrage) {
    setAnfragen(prev => prev.map(a => (a.id === updated.id ? updated : a)));
  }

  function updatePreiskonfiguration(config: Preiskonfiguration) {
    setPreiskonfiguration(config);
  }

  function updateNutzer(updated: Nutzer[]) {
    setNutzer(updated);
  }

  return (
    <AppContext.Provider value={{ currentUser, anfragen, nutzer, preiskonfiguration, login, logout, addAnfrage, updateAnfrage, updatePreiskonfiguration, updateNutzer }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp muss innerhalb von AppProvider verwendet werden');
  return ctx;
}
