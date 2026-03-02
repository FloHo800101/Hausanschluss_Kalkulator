import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface LayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

export default function Layout({ children, navItems, title }: LayoutProps) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={cn('flex flex-col bg-blue-950 text-white transition-all duration-200', sidebarOpen ? 'w-64' : 'w-16')}>
        {/* Logo */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-5 border-b border-blue-900 hover:bg-blue-900 transition-colors w-full text-left cursor-pointer"
          title="Zur Startseite"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700 shrink-0">
            <span className="text-sm">⚡</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-bold text-sm leading-tight">Netz-KA GmbH</div>
              <div className="text-xs text-blue-400">HA-Kalkulator</div>
            </div>
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('/sachbearbeiter') || item.to.endsWith('/admin')}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-900 hover:text-white',
                )
              }
            >
              <span className="shrink-0 w-5 h-5">{item.icon}</span>
              {sidebarOpen && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {sidebarOpen && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-blue-900 p-3">
          <div className={cn('flex items-center gap-3', sidebarOpen ? '' : 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
              {currentUser?.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-medium truncate">{currentUser?.name}</div>
                <div className="text-xs text-blue-400 capitalize">{currentUser?.rolle}</div>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} title="Abmelden" className="text-blue-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
