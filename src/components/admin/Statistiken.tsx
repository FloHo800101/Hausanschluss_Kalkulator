import { useApp } from '@/context/AppContext';
import { formatEuro, SPARTE_COLOR, SPARTE_ICON } from '@/lib/utils';
import type { AnfrageStatus, Sparte } from '@/types';

const STATUS_LABEL_SHORT: Record<AnfrageStatus, string> = {
  neu: 'Neu',
  in_bearbeitung: 'In Bearb.',
  kalkuliert: 'Kalk.',
  angebot_erstellt: 'Angebot',
  abgeschlossen: 'Abgeschl.',
};

function StatCard({ label, value, sub, color = 'blue' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
    amber: 'border-amber-200 bg-amber-50',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color] ?? colors.blue}`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Statistiken() {
  const { anfragen } = useApp();

  const kalkuliert = anfragen.filter(a => a.kalkulation);
  const gesamtVolumen = kalkuliert.reduce((s, a) => s + (a.kalkulation?.gesamtBrutto ?? 0), 0);
  const durchschnitt = kalkuliert.length > 0 ? gesamtVolumen / kalkuliert.length : 0;
  const einzelfall = anfragen.filter(a => a.kalkulation?.istEinzelfall).length;

  const sparteCount: Record<Sparte, number> = { Strom: 0, Gas: 0, Wasser: 0, MSH: 0 };
  anfragen.forEach(a => { sparteCount[a.anschluss.sparte]++; });

  const statusCount: Partial<Record<AnfrageStatus, number>> = {};
  anfragen.forEach(a => { statusCount[a.status] = (statusCount[a.status] ?? 0) + 1; });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Berichte & Statistiken</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Anfragen gesamt" value={anfragen.length} color="blue" />
        <StatCard label="Kalkuliertes Volumen" value={formatEuro(gesamtVolumen)} sub={`${kalkuliert.length} Kalkulationen`} color="green" />
        <StatCard label="Ø Angebotswert" value={formatEuro(durchschnitt)} sub="brutto inkl. MwSt." color="purple" />
        <StatCard label="Einzelfall-Quote" value={`${einzelfall} / ${kalkuliert.length}`} sub="manuell zu prüfen" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sparten-Verteilung */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Anfragen nach Sparte</h3>
          <div className="space-y-3">
            {(Object.keys(sparteCount) as Sparte[]).map(sparte => {
              const count = sparteCount[sparte];
              const pct = anfragen.length > 0 ? Math.round((count / anfragen.length) * 100) : 0;
              return (
                <div key={sparte}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SPARTE_COLOR[sparte]}`}>
                      {SPARTE_ICON[sparte]} {sparte}
                    </span>
                    <span className="text-gray-600 font-medium">{count} ({pct} %)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status-Verteilung */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Anfragen nach Status</h3>
          <div className="space-y-3">
            {(Object.entries(statusCount) as [AnfrageStatus, number][]).map(([status, count]) => {
              const pct = anfragen.length > 0 ? Math.round((count / anfragen.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{STATUS_LABEL_SHORT[status]}</span>
                    <span className="text-gray-600 font-medium">{count} ({pct} %)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-Kalkulationen */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Kalkulierte Angebote (nach Wert)</h3>
          {kalkuliert.length === 0 ? (
            <p className="text-sm text-gray-400">Noch keine Kalkulationen vorhanden.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="pb-2 font-medium">Anfrage-Nr.</th>
                  <th className="pb-2 font-medium">Anschlussnehmer</th>
                  <th className="pb-2 font-medium">Sparte</th>
                  <th className="pb-2 font-medium text-right">Netto</th>
                  <th className="pb-2 font-medium text-right">Brutto</th>
                  <th className="pb-2 font-medium">Einzelfall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...kalkuliert]
                  .sort((a, b) => (b.kalkulation?.gesamtBrutto ?? 0) - (a.kalkulation?.gesamtBrutto ?? 0))
                  .map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-2 font-mono text-gray-700">{a.nummer}</td>
                      <td className="py-2 text-gray-700">{a.kunde.vorname} {a.kunde.nachname}</td>
                      <td className="py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SPARTE_COLOR[a.anschluss.sparte]}`}>
                          {SPARTE_ICON[a.anschluss.sparte]} {a.anschluss.sparte}
                        </span>
                      </td>
                      <td className="py-2 text-right text-gray-700">{formatEuro(a.kalkulation!.zwischensumme)}</td>
                      <td className="py-2 text-right font-medium text-blue-700">{formatEuro(a.kalkulation!.gesamtBrutto)}</td>
                      <td className="py-2">
                        {a.kalkulation!.istEinzelfall
                          ? <span className="text-amber-600 text-xs font-medium">⚠ Einzelfall</span>
                          : <span className="text-green-600 text-xs">✓ Auto</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
