import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { STATUS_LABEL, STATUS_COLOR, SPARTE_COLOR, SPARTE_ICON, formatDatum, cn } from '@/lib/utils';
import type { AnfrageStatus, Sparte } from '@/types';

const STATUS_OPTIONS: (AnfrageStatus | 'alle')[] = ['alle', 'neu', 'in_bearbeitung', 'kalkuliert', 'angebot_erstellt', 'abgeschlossen'];
const SPARTE_OPTIONS: (Sparte | 'alle')[] = ['alle', 'Strom', 'Gas', 'Wasser', 'MSH'];

export default function Inbox() {
  const { anfragen } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<AnfrageStatus | 'alle'>('alle');
  const [sparteFilter, setSparteFilter] = useState<Sparte | 'alle'>('alle');
  const [suche, setSuche] = useState('');

  const gefiltert = anfragen.filter(a => {
    if (statusFilter !== 'alle' && a.status !== statusFilter) return false;
    if (sparteFilter !== 'alle' && a.anschluss.sparte !== sparteFilter) return false;
    if (suche) {
      const s = suche.toLowerCase();
      const match =
        a.nummer.toLowerCase().includes(s) ||
        a.kunde.nachname.toLowerCase().includes(s) ||
        a.kunde.vorname.toLowerCase().includes(s) ||
        a.kunde.anschlussOrt.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  const neuCount = anfragen.filter(a => a.status === 'neu').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Eingangskorb</h2>
          <p className="text-sm text-gray-500 mt-1">{anfragen.length} Anfragen gesamt · {neuCount} neu</p>
        </div>
      </div>

      {/* Filter-Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Name, Nummer oder Ort suchen…"
          value={suche}
          onChange={e => setSuche(e.target.value)}
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as AnfrageStatus | 'alle')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'alle' ? 'Alle Status' : STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select
          value={sparteFilter}
          onChange={e => setSparteFilter(e.target.value as Sparte | 'alle')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {SPARTE_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'alle' ? 'Alle Sparten' : s}</option>
          ))}
        </select>
      </div>

      {/* Tabelle */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Anfrage-Nr.</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Anschlussnehmer</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Anschlussadresse</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Sparte</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Eingang</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gefiltert.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">Keine Anfragen gefunden</td>
              </tr>
            )}
            {gefiltert.map(anfrage => (
              <tr
                key={anfrage.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/sachbearbeiter/anfrage/${anfrage.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="font-mono font-medium text-gray-800">{anfrage.nummer}</div>
                  {anfrage.status === 'neu' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-1 animate-pulse" />
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {anfrage.kunde.vorname} {anfrage.kunde.nachname}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {anfrage.kunde.anschlussStrasse} {anfrage.kunde.anschlussHausnummer}, {anfrage.kunde.anschlussPLZ} {anfrage.kunde.anschlussOrt}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', SPARTE_COLOR[anfrage.anschluss.sparte])}>
                    {SPARTE_ICON[anfrage.anschluss.sparte]} {anfrage.anschluss.sparte}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDatum(anfrage.eingangsdatum)}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLOR[anfrage.status])}>
                    {STATUS_LABEL[anfrage.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <svg className="w-4 h-4 text-gray-400 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
