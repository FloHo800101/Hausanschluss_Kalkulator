import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDatum, cn } from '@/lib/utils';
import type { Nutzer } from '@/types';

export default function Nutzerverwaltung() {
  const { nutzer, updateNutzer } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [neuerNutzer, setNeuerNutzer] = useState({ name: '', email: '', rolle: 'sachbearbeiter' as Nutzer['rolle'] });

  function toggleAktiv(id: string) {
    updateNutzer(nutzer.map(n => n.id === id ? { ...n, aktiv: !n.aktiv } : n));
  }

  function handleHinzufuegen() {
    if (!neuerNutzer.name || !neuerNutzer.email) return;
    const neu: Nutzer = {
      id: `usr-${Date.now()}`,
      name: neuerNutzer.name,
      email: neuerNutzer.email,
      rolle: neuerNutzer.rolle,
      aktiv: true,
      erstelltAm: new Date().toISOString().slice(0, 10),
    };
    updateNutzer([...nutzer, neu]);
    setNeuerNutzer({ name: '', email: '', rolle: 'sachbearbeiter' });
    setShowForm(false);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nutzerverwaltung</h2>
          <p className="text-sm text-gray-500 mt-1">{nutzer.filter(n => n.aktiv).length} aktive Nutzer</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          + Nutzer anlegen
        </button>
      </div>

      {/* Formular */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
          <h3 className="font-semibold text-blue-800 mb-4">Neuer Nutzer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={neuerNutzer.name}
              onChange={e => setNeuerNutzer(p => ({ ...p, name: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="E-Mail"
              value={neuerNutzer.email}
              onChange={e => setNeuerNutzer(p => ({ ...p, email: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={neuerNutzer.rolle}
              onChange={e => setNeuerNutzer(p => ({ ...p, rolle: e.target.value as Nutzer['rolle'] }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="sachbearbeiter">Sachbearbeiter</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleHinzufuegen}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Speichern
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Tabelle */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">E-Mail</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Rolle</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Erstellt</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {nutzer.map(n => (
              <tr key={n.id} className={cn('transition-colors', !n.aktiv && 'opacity-50')}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                      {n.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800">{n.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{n.email}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    n.rolle === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700',
                  )}>
                    {n.rolle === 'admin' ? 'Administrator' : 'Sachbearbeiter'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDatum(n.erstelltAm)}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', n.aktiv ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                    {n.aktiv ? 'Aktiv' : 'Deaktiviert'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleAktiv(n.id)}
                    className="text-xs text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    {n.aktiv ? 'Deaktivieren' : 'Reaktivieren'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
