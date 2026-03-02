import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { berechneKalkulation } from '@/lib/calculator';
import { formatEuro, formatDatumZeit, cn } from '@/lib/utils';
import type { KalkulationsPosition } from '@/types';
import { druckeKalkulationPDF } from '@/lib/pdfExport';

const KATEGORIE_COLOR: Record<KalkulationsPosition['kategorie'], string> = {
  Grundleistung: 'bg-blue-50',
  Länge: 'bg-cyan-50',
  Zuschlag: 'bg-orange-50',
  Admin: 'bg-gray-50',
  BKZ: 'bg-purple-50',
  Manuell: 'bg-green-50',
};

// ─── Neue manuelle Position (Formular-State) ──────────────────────────────────

interface NeuPosition {
  bezeichnung: string;
  menge: string;
  einheit: string;
  einzelpreis: string;
}

const emptyNeuPos: NeuPosition = { bezeichnung: '', menge: '1', einheit: 'Pauschale', einzelpreis: '' };

export default function Kalkulation() {
  const { id } = useParams<{ id: string }>();
  const { anfragen, updateAnfrage, preiskonfiguration, currentUser } = useApp();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [gespeichert, setGespeichert] = useState(false);

  const anfrage = anfragen.find(a => a.id === id);

  const basisKalkulation = anfrage?.kalkulation ?? (anfrage
    ? berechneKalkulation(anfrage, preiskonfiguration, currentUser?.name ?? 'System')
    : null);

  // Lokaler Edit-State
  const [positionen, setPositionen] = useState<KalkulationsPosition[]>(() => basisKalkulation?.positionen ?? []);
  const [rabattProzent, setRabattProzent] = useState<number>(() => basisKalkulation?.rabattProzent ?? 0);
  const [neuPosOffen, setNeuPosOffen] = useState(false);
  const [neuPos, setNeuPos] = useState<NeuPosition>(emptyNeuPos);

  useEffect(() => {
    if (anfrage && !anfrage.kalkulation && basisKalkulation) {
      updateAnfrage({ ...anfrage, kalkulation: basisKalkulation, status: 'kalkuliert' });
      setGespeichert(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dynamisch berechnete Summen
  const zwischensumme = useMemo(
    () => positionen.reduce((s, p) => s + p.menge * p.einzelpreis, 0),
    [positionen],
  );
  const rabattBetrag = useMemo(() => zwischensumme * (rabattProzent / 100), [zwischensumme, rabattProzent]);
  const zwischensummeNachRabatt = zwischensumme - rabattBetrag;
  const mwstSatz = preiskonfiguration.mwstSatz;
  const mwstBetrag = zwischensummeNachRabatt * mwstSatz;
  const gesamtBrutto = zwischensummeNachRabatt + mwstBetrag;

  const hatAenderungen = useMemo(() => {
    if (!basisKalkulation) return false;
    const posGeaendert = JSON.stringify(positionen) !== JSON.stringify(basisKalkulation.positionen);
    const rabattGeaendert = rabattProzent !== (basisKalkulation.rabattProzent ?? 0);
    return posGeaendert || rabattGeaendert;
  }, [positionen, rabattProzent, basisKalkulation]);

  if (!anfrage || !basisKalkulation) {
    return <div className="text-center py-20 text-gray-400">Anfrage nicht gefunden</div>;
  }

  // ─── Aktionen ───────────────────────────────────────────────────────────────

  function handleSpeichern() {
    const updated = {
      ...basisKalkulation!,
      positionen,
      rabattProzent: rabattProzent > 0 ? rabattProzent : undefined,
      zwischensumme,
      mwstBetrag,
      gesamtBrutto,
    };
    updateAnfrage({ ...anfrage!, kalkulation: updated });
    setGespeichert(true);
  }

  function handleAngebotErstellen() {
    handleSpeichern();
    updateAnfrage({ ...anfrage!, status: 'angebot_erstellt', kalkulation: { ...basisKalkulation!, positionen, rabattProzent: rabattProzent || undefined, zwischensumme, mwstBetrag, gesamtBrutto } });
    setGespeichert(true);
  }

  function handlePDF() {
    druckeKalkulationPDF(anfrage!, { ...basisKalkulation!, positionen, zwischensumme, mwstBetrag, gesamtBrutto });
  }

  // ─── Positionsbearbeitung ────────────────────────────────────────────────────

  function setMenge(index: number, value: string) {
    const n = parseFloat(value.replace(',', '.'));
    if (isNaN(n) || n < 0) return;
    setPositionen(prev => prev.map((p, i) => i === index ? { ...p, menge: n, gesamtpreis: n * p.einzelpreis } : p));
  }

  function setEinzelpreis(index: number, value: string) {
    const n = parseFloat(value.replace(',', '.'));
    if (isNaN(n)) return;
    setPositionen(prev => prev.map((p, i) => i === index ? { ...p, einzelpreis: n, gesamtpreis: p.menge * n } : p));
  }

  function loeschePosition(index: number) {
    setPositionen(prev => prev.filter((_, i) => i !== index));
  }

  function fuegePositionHinzu() {
    const menge = parseFloat(neuPos.menge.replace(',', '.'));
    const einzelpreis = parseFloat(neuPos.einzelpreis.replace(',', '.'));
    if (!neuPos.bezeichnung || isNaN(menge) || isNaN(einzelpreis)) return;
    const pos: KalkulationsPosition = {
      bezeichnung: neuPos.bezeichnung,
      menge,
      einheit: neuPos.einheit,
      einzelpreis,
      gesamtpreis: menge * einzelpreis,
      kategorie: 'Manuell',
      manuell: true,
    };
    setPositionen(prev => [...prev, pos]);
    setNeuPos(emptyNeuPos);
    setNeuPosOffen(false);
  }

  const inputCls = 'border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500 w-full';

  return (
    <div className="max-w-4xl" ref={printRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/sachbearbeiter')} className="hover:text-blue-600 cursor-pointer">Eingangskorb</button>
          <span>/</span>
          <button onClick={() => navigate(`/sachbearbeiter/anfrage/${anfrage.id}`)} className="hover:text-blue-600 cursor-pointer">{anfrage.nummer}</button>
          <span>/</span>
          <span className="font-medium text-gray-800">Kalkulation</span>
        </div>
        <div className="flex gap-2">
          {hatAenderungen && (
            <button onClick={handleSpeichern} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
              Änderungen speichern
            </button>
          )}
          {anfrage.status === 'kalkuliert' && (
            <button onClick={handleAngebotErstellen} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
              Angebot erstellen
            </button>
          )}
          <button onClick={handlePDF} className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF Export
          </button>
        </div>
      </div>

      {gespeichert && !hatAenderungen && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Kalkulation gespeichert · Status aktualisiert
        </div>
      )}

      {hatAenderungen && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Ungespeicherte Änderungen
        </div>
      )}

      {/* Einzelfall-Warnung */}
      {basisKalkulation.istEinzelfall && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-5">
          <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Hinweis: Einzelfall / Vor-Ort-Termin empfohlen
          </h3>
          <ul className="space-y-1">
            {basisKalkulation.einzelfallGruende.map((g, i) => (
              <li key={i} className="text-sm text-amber-900 flex gap-2">
                <span className="mt-0.5 shrink-0">•</span><span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Angebots-Kopf */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-1">Anfrage-Nr.</div>
            <div className="font-mono font-bold">{anfrage.nummer}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Erstellt am</div>
            <div>{formatDatumZeit(basisKalkulation.erstelltAm)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Anschlussnehmer</div>
            <div className="font-medium">{anfrage.kunde.vorname} {anfrage.kunde.nachname}</div>
            <div className="text-gray-500">{anfrage.kunde.anschlussStrasse} {anfrage.kunde.anschlussHausnummer}, {anfrage.kunde.anschlussPLZ} {anfrage.kunde.anschlussOrt}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Sachbearbeiter</div>
            <div>{basisKalkulation.erstelltVon}</div>
            <div className="text-gray-500">Version: {basisKalkulation.preiskonfigurationVersion}</div>
          </div>
        </div>
      </div>

      {/* Positionsliste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Positionsliste</h3>
          <span className="text-xs text-gray-400">Menge und Einzelpreis sind editierbar</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 font-semibold text-gray-600">Position</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-600 w-24">Menge</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-600 w-24">Einheit</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-600 w-28">Einzelpreis</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-600 w-28">Gesamt</th>
              <th className="w-8 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {positionen.map((pos, i) => (
              <tr key={i} className={cn('transition-colors', KATEGORIE_COLOR[pos.kategorie])}>
                <td className="px-4 py-2">
                  <span className="text-gray-800">{pos.bezeichnung}</span>
                  <span className="ml-2 text-xs text-gray-400 uppercase tracking-wide">{pos.kategorie}</span>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={pos.menge}
                    onChange={e => setMenge(i, e.target.value)}
                    className={inputCls}
                  />
                </td>
                <td className="px-4 py-2 text-gray-500">{pos.einheit}</td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    step="any"
                    value={pos.einzelpreis}
                    onChange={e => setEinzelpreis(i, e.target.value)}
                    className={inputCls}
                  />
                </td>
                <td className="px-4 py-2 text-right font-medium text-gray-800">
                  {formatEuro(pos.menge * pos.einzelpreis)}
                </td>
                <td className="px-2 py-2 text-center">
                  {pos.manuell && (
                    <button
                      onClick={() => loeschePosition(i)}
                      title="Position entfernen"
                      className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Manuelle Position hinzufügen */}
        {neuPosOffen ? (
          <div className="border-t border-gray-200 bg-green-50 px-4 py-3">
            <p className="text-xs font-semibold text-green-800 mb-2">Neue manuelle Position</p>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex-1 min-w-48">
                <label className="text-xs text-gray-500 mb-1 block">Bezeichnung</label>
                <input
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="z.B. Sondermaßnahme Gehweg"
                  value={neuPos.bezeichnung}
                  onChange={e => setNeuPos(p => ({ ...p, bezeichnung: e.target.value }))}
                />
              </div>
              <div className="w-20">
                <label className="text-xs text-gray-500 mb-1 block">Menge</label>
                <input
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                  type="number"
                  step="any"
                  value={neuPos.menge}
                  onChange={e => setNeuPos(p => ({ ...p, menge: e.target.value }))}
                />
              </div>
              <div className="w-28">
                <label className="text-xs text-gray-500 mb-1 block">Einheit</label>
                <select
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={neuPos.einheit}
                  onChange={e => setNeuPos(p => ({ ...p, einheit: e.target.value }))}
                >
                  {['Pauschale', 'Stück', 'm', 'm²', 'kW', 'Std.'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="w-32">
                <label className="text-xs text-gray-500 mb-1 block">Einzelpreis (€)</label>
                <input
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                  type="number"
                  step="any"
                  placeholder="0,00"
                  value={neuPos.einzelpreis}
                  onChange={e => setNeuPos(p => ({ ...p, einzelpreis: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fuegePositionHinzu}
                  disabled={!neuPos.bezeichnung || !neuPos.einzelpreis}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-40 cursor-pointer"
                >
                  Hinzufügen
                </button>
                <button
                  onClick={() => { setNeuPosOffen(false); setNeuPos(emptyNeuPos); }}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 cursor-pointer"
                >
                  Abbrechen
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Negativer Einzelpreis = Abzugsposition (z.B. Nachlass, Gutschrift)</p>
          </div>
        ) : (
          <div className="border-t border-gray-100 px-4 py-2">
            <button
              onClick={() => setNeuPosOffen(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Manuelle Position hinzufügen
            </button>
          </div>
        )}

        {/* Summen */}
        <div className="border-t border-gray-200 px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Zwischensumme (netto)</span>
            <span className="font-medium">{formatEuro(zwischensumme)}</span>
          </div>

          {/* Rabatt */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Rabatt</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={rabattProzent}
                  onChange={e => setRabattProzent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-16 border border-gray-300 rounded px-2 py-0.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-500">%</span>
              </div>
            </div>
            <span className={rabattBetrag > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
              {rabattBetrag > 0 ? `– ${formatEuro(rabattBetrag)}` : '–'}
            </span>
          </div>

          {rabattProzent > 0 && (
            <div className="flex justify-between text-sm text-gray-600 border-t border-dashed border-gray-200 pt-1.5">
              <span>Netto nach Rabatt</span>
              <span className="font-medium">{formatEuro(zwischensummeNachRabatt)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm text-gray-600">
            <span>MwSt. {Math.round(mwstSatz * 100)} %</span>
            <span>{formatEuro(mwstBetrag)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200 mt-1">
            <span>Gesamtbetrag (brutto)</span>
            <span className="text-blue-700 text-lg">{formatEuro(gesamtBrutto)}</span>
          </div>
        </div>
      </div>

      {/* Kalkulationsannahmen */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Kalkulationsannahmen
        </h3>
        <ul className="space-y-1">
          {basisKalkulation.annahmen.map((a, i) => (
            <li key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="mt-0.5 shrink-0 text-gray-400">•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
