import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { Sparte } from '@/types';
import { cn } from '@/lib/utils';

const SPARTEN: Sparte[] = ['Strom', 'Gas', 'Wasser', 'MSH'];

interface FieldDef {
  key: string;
  label: string;
  unit: string;
  hint?: string;
}

const FIELDS: FieldDef[] = [
  { key: 'grundpauschale', label: 'Grundpauschale', unit: '€', hint: 'Enthält inkludierte Meter' },
  { key: 'inkludierteMetersOeffentlich', label: 'Inkludierte Meter öff. Grund', unit: 'm' },
  { key: 'inkludierteMetersPrivat', label: 'Inkludierte Meter Privatgrund', unit: 'm' },
  { key: 'meterpreisOeffentlich', label: 'Meterpreis öff. Grund', unit: '€/m' },
  { key: 'meterpreisPrivat', label: 'Meterpreis Privatgrund', unit: '€/m' },
  { key: 'zuschlagAsphalt', label: 'Zuschlag Asphalt', unit: '€/m' },
  { key: 'zuschlagPflaster', label: 'Zuschlag Pflaster', unit: '€/m' },
  { key: 'zuschlagStrassenquerung', label: 'Zuschlag Straßenquerung', unit: '€/St.' },
  { key: 'zuschlagKernbohrung', label: 'Zuschlag Kernbohrung', unit: '€/St.' },
  { key: 'zuschlagWinterbau', label: 'Zuschlag Winterbau', unit: '€/m' },
  { key: 'zuschlagSpuelbohrung', label: 'Zuschlag Spülbohrung (Mehrkosten)', unit: '€/m' },
  { key: 'zuschlagFels', label: 'Zuschlag Felsaushub (Mehrkosten)', unit: '€/m' },
  { key: 'bkzSatz', label: 'BKZ-Satz (nur Strom)', unit: '€/kW' },
  { key: 'schwelleEinzelfall', label: 'Schwelle Einzelfall', unit: 'm', hint: 'Ab dieser Gesamtlänge → Einzelfall' },
  { key: 'planungspauschale', label: 'Planungspauschale', unit: '€' },
  { key: 'inbetriebnahme', label: 'Inbetriebnahme / Abnahme', unit: '€' },
  { key: 'dokumentation', label: 'Dokumentation / GIS', unit: '€' },
];

export default function Preisparameter() {
  const { preiskonfiguration, updatePreiskonfiguration } = useApp();
  const [aktivSparte, setAktivSparte] = useState<Sparte>('Strom');
  const [gespeichert, setGespeichert] = useState(false);
  const [lokal, setLokal] = useState(preiskonfiguration);

  function handleChange(key: string, value: string) {
    const num = parseFloat(value);
    setLokal(prev => ({
      ...prev,
      spartePreise: {
        ...prev.spartePreise,
        [aktivSparte]: {
          ...prev.spartePreise[aktivSparte],
          [key]: isNaN(num) ? 0 : num,
        },
      },
    }));
  }

  function handleMwst(value: string) {
    const num = parseFloat(value);
    setLokal(prev => ({ ...prev, mwstSatz: isNaN(num) ? 0.19 : num / 100 }));
  }

  function handleSpeichern() {
    updatePreiskonfiguration(lokal);
    setGespeichert(true);
    setTimeout(() => setGespeichert(false), 3000);
  }

  const preise = lokal.spartePreise[aktivSparte];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Preisparameter</h2>
          <p className="text-sm text-gray-500 mt-1">Preisstand: {lokal.preisstand} · Version: {lokal.version}</p>
        </div>
        <button
          onClick={handleSpeichern}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          Speichern
        </button>
      </div>

      {gespeichert && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-800 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Preisparameter gespeichert
        </div>
      )}

      {/* Global */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h3 className="font-semibold text-gray-700 mb-4">Globale Parameter</h3>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600 w-48">MwSt.-Satz</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={Math.round(lokal.mwstSatz * 100)}
              onChange={e => handleMwst(e.target.value)}
              step="1"
              min="0"
              max="100"
              className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">MSH-Rabatt</label>
            <input
              type="number"
              value={Math.round(lokal.mshRabatt * 100)}
              onChange={e => {
                const num = parseFloat(e.target.value);
                setLokal(prev => ({ ...prev, mshRabatt: isNaN(num) ? 0 : num / 100 }));
              }}
              step="1"
              min="0"
              max="50"
              className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>
      </div>

      {/* Sparten-Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {SPARTEN.map(s => (
            <button
              key={s}
              onClick={() => setAktivSparte(s)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors cursor-pointer',
                aktivSparte === s
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-3">
          {FIELDS.map(field => {
            const val = (preise as unknown as Record<string, number | undefined>)[field.key];
            if (val === undefined && field.key !== 'bkzSatz') return null;
            if (field.key === 'bkzSatz' && aktivSparte !== 'Strom') return null;
            return (
              <div key={field.key} className="flex items-center gap-4">
                <div className="w-64 shrink-0">
                  <div className="text-sm text-gray-700">{field.label}</div>
                  {field.hint && <div className="text-xs text-gray-400">{field.hint}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={val ?? 0}
                    onChange={e => handleChange(field.key, e.target.value)}
                    step="1"
                    min="0"
                    className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                  <span className="text-xs text-gray-400 w-16">{field.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
