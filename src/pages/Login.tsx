import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { UserRole } from '@/context/AppContext';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  function handleLogin(rolle: UserRole) {
    login(rolle);
    navigate(rolle === 'admin' ? '/admin' : '/sachbearbeiter');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Kopfleiste */}
      <header className="bg-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="font-semibold text-white tracking-tight">Netz-KA GmbH</span>
          <span className="text-white/30 mx-2">|</span>
          <span className="text-sm text-slate-300">Hausanschluss-Kalkulator</span>
        </div>
      </header>

      {/* Inhalt */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Anmeldung</h1>
          <p className="text-sm text-gray-500 mb-8">Wählen Sie Ihre Rolle, um fortzufahren.</p>

          <div className="space-y-2">
            <button
              onClick={() => handleLogin('sachbearbeiter')}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors text-left group cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Sachbearbeiter</div>
                <div className="text-xs text-gray-400 mt-0.5">Anfragen · Kalkulation · PDF-Export</div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => handleLogin('admin')}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors text-left group cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">Administrator</div>
                <div className="text-xs text-gray-400 mt-0.5">Preisparameter · Statistiken · Nutzerverwaltung</div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Demo-System · Keine echte Authentifizierung
          </p>

          {/* Trenner */}
          <div className="my-8 border-t border-gray-200" />

          {/* Kundenportal */}
          <a
            href="#/portal"
            className="flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors group"
          >
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">Kundenportal</div>
              <div className="text-xs text-gray-400 mt-0.5">Hausanschluss anfragen · Kosten schätzen</div>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </main>

      {/* Fußzeile */}
      <footer className="bg-slate-800 px-6 py-4">
        <p className="text-xs text-slate-400 text-center">
          © 2025 Netz-KA GmbH · Hausanschluss-Kalkulator v1.0
        </p>
      </footer>
    </div>
  );
}
