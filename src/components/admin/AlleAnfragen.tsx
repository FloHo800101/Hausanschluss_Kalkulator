import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { STATUS_LABEL, STATUS_COLOR, SPARTE_COLOR, SPARTE_ICON, formatDatum, formatEuro, cn } from '@/lib/utils';

export default function AlleAnfragen() {
  const { anfragen } = useApp();
  const navigate = useNavigate();
  const [suche, setSuche] = useState('');

  const gefiltert = anfragen.filter(a => {
    if (!suche) return true;
    const s = suche.toLowerCase();
    return (
      a.nummer.toLowerCase().includes(s) ||
      a.kunde.nachname.toLowerCase().includes(s) ||
      a.kunde.vorname.toLowerCase().includes(s) ||
      (a.sachbearbeiter?.toLowerCase().includes(s) ?? false)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alle Anfragen</h2>
          <p className="text-sm text-gray-500 mt-1">{anfragen.length} Anfragen im System</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <input
          type="text"
          placeholder="Anfrage-Nr., Name oder Sachbearbeiter suchen…"
          value={suche}
          onChange={e => setSuche(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nr.</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Anschlussnehmer</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Sparte</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Sachbearbeiter</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Eingang</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Angebotswert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gefiltert.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Keine Anfragen gefunden</td></tr>
            )}
            {gefiltert.map(a => (
              <tr
                key={a.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/sachbearbeiter/anfrage/${a.id}`)}
              >
                <td className="px-4 py-3 font-mono text-gray-800">{a.nummer}</td>
                <td className="px-4 py-3 text-gray-700">{a.kunde.vorname} {a.kunde.nachname}</td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', SPARTE_COLOR[a.anschluss.sparte])}>
                    {SPARTE_ICON[a.anschluss.sparte]} {a.anschluss.sparte}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{a.sachbearbeiter ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{formatDatum(a.eingangsdatum)}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLOR[a.status])}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">
                  {a.kalkulation ? formatEuro(a.kalkulation.gesamtBrutto) : <span className="text-gray-400 font-normal">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
