import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { STATUS_LABEL, STATUS_COLOR, SPARTE_COLOR, SPARTE_ICON, formatDatumZeit, cn } from '@/lib/utils';
import type { Anfrage, Anschlussdaten, Kundenangaben } from '@/types';

// ─── Anzeigezeile (read-only) ─────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex py-2 border-b border-gray-100 last:border-0">
      <dt className="w-52 text-sm text-gray-500 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
      <dl>{children}</dl>
    </div>
  );
}

// ─── Eingabefelder für Edit-Modus ─────────────────────────────────────────────

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center py-2 border-b border-gray-100 last:border-0 gap-3">
      <dt className="w-52 text-sm text-gray-500 shrink-0">{label}</dt>
      <dd className="flex-1">{children}</dd>
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const selectCls = 'w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
        value ? 'bg-blue-600' : 'bg-gray-200',
      )}
    >
      <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', value ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function AnfrageDetail() {
  const { id } = useParams<{ id: string }>();
  const { anfragen, updateAnfrage, currentUser } = useApp();
  const navigate = useNavigate();

  const anfrage = anfragen.find(a => a.id === id);
  const [editMode, setEditMode] = useState(false);
  const [editKunde, setEditKunde] = useState<Kundenangaben | null>(null);
  const [editAnschluss, setEditAnschluss] = useState<Anschlussdaten | null>(null);
  const [editNotizen, setEditNotizen] = useState<string>('');

  if (!anfrage) return <div className="text-center py-20 text-gray-400">Anfrage nicht gefunden</div>;

  const a = anfrage.anschluss;
  const kannBearbeiten = anfrage.status === 'in_bearbeitung';

  function markInBearbeitung() {
    updateAnfrage({ ...anfrage!, status: 'in_bearbeitung', sachbearbeiter: currentUser?.name });
  }

  function startEdit() {
    setEditKunde({ ...anfrage!.kunde });
    setEditAnschluss({ ...anfrage!.anschluss });
    setEditNotizen(anfrage!.notizen ?? '');
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setEditKunde(null);
    setEditAnschluss(null);
  }

  function saveEdit() {
    const updated: Anfrage = {
      ...anfrage!,
      kunde: editKunde!,
      anschluss: editAnschluss!,
      notizen: editNotizen || undefined,
    };
    updateAnfrage(updated);
    setEditMode(false);
  }

  function setK(patch: Partial<Kundenangaben>) {
    setEditKunde(prev => ({ ...prev!, ...patch }));
  }

  function setA(patch: Partial<Anschlussdaten>) {
    setEditAnschluss(prev => ({ ...prev!, ...patch }));
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/sachbearbeiter')} className="hover:text-blue-600 cursor-pointer">Eingangskorb</button>
          <span>/</span>
          <span className="font-medium text-gray-800">{anfrage.nummer}</span>
        </div>
        <div className="flex gap-3">
          {editMode ? (
            <>
              <button onClick={cancelEdit} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Abbrechen
              </button>
              <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                Speichern
              </button>
            </>
          ) : (
            <>
              {anfrage.status === 'neu' && (
                <button onClick={markInBearbeitung} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  In Bearbeitung nehmen
                </button>
              )}
              {kannBearbeiten && (
                <button onClick={startEdit} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  Daten bearbeiten
                </button>
              )}
              {(anfrage.status === 'in_bearbeitung' || anfrage.status === 'neu') && (
                <button onClick={() => navigate(`/sachbearbeiter/kalkulation/${anfrage.id}`)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  Kalkulation starten
                </button>
              )}
              {(anfrage.status === 'kalkuliert' || anfrage.status === 'angebot_erstellt') && (
                <button onClick={() => navigate(`/sachbearbeiter/kalkulation/${anfrage.id}`)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  Kalkulation anzeigen
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status-Banner */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div>
          <div className="text-xs text-gray-400 mb-1">Anfrage-Nr.</div>
          <div className="font-mono font-bold text-gray-800">{anfrage.nummer}</div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <div className="text-xs text-gray-400 mb-1">Eingang</div>
          <div className="text-sm text-gray-700">{formatDatumZeit(anfrage.eingangsdatum)}</div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <div className="text-xs text-gray-400 mb-1">Sparte</div>
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', SPARTE_COLOR[a.sparte])}>
            {SPARTE_ICON[a.sparte]} {a.sparte}
          </span>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <div className="text-xs text-gray-400 mb-1">Status</div>
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLOR[anfrage.status])}>
            {STATUS_LABEL[anfrage.status]}
          </span>
        </div>
        {anfrage.sachbearbeiter && (
          <>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="text-xs text-gray-400 mb-1">Sachbearbeiter</div>
              <div className="text-sm text-gray-700">{anfrage.sachbearbeiter}</div>
            </div>
          </>
        )}
        {editMode && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Bearbeitungsmodus
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Kundendaten */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Anschlussnehmer</h3>
          <dl>
            {editMode && editKunde ? (
              <>
                <EditRow label="Vorname">
                  <input className={inputCls} value={editKunde.vorname} onChange={e => setK({ vorname: e.target.value })} />
                </EditRow>
                <EditRow label="Nachname">
                  <input className={inputCls} value={editKunde.nachname} onChange={e => setK({ nachname: e.target.value })} />
                </EditRow>
                <EditRow label="E-Mail">
                  <input className={inputCls} type="email" value={editKunde.email} onChange={e => setK({ email: e.target.value })} />
                </EditRow>
                <EditRow label="Telefon">
                  <input className={inputCls} type="tel" value={editKunde.telefon} onChange={e => setK({ telefon: e.target.value })} />
                </EditRow>
                <EditRow label="Rechnungsstr. / Nr.">
                  <div className="flex gap-2">
                    <input className={inputCls} value={editKunde.strasse} onChange={e => setK({ strasse: e.target.value })} placeholder="Straße" />
                    <input className="w-24 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editKunde.hausnummer} onChange={e => setK({ hausnummer: e.target.value })} placeholder="Nr." />
                  </div>
                </EditRow>
                <EditRow label="PLZ / Ort">
                  <div className="flex gap-2">
                    <input className="w-24 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editKunde.plz} onChange={e => setK({ plz: e.target.value })} placeholder="PLZ" />
                    <input className={inputCls} value={editKunde.ort} onChange={e => setK({ ort: e.target.value })} placeholder="Ort" />
                  </div>
                </EditRow>
                <EditRow label="Anschlussstr. / Nr.">
                  <div className="flex gap-2">
                    <input className={inputCls} value={editKunde.anschlussStrasse} onChange={e => setK({ anschlussStrasse: e.target.value })} placeholder="Straße" />
                    <input className="w-24 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editKunde.anschlussHausnummer} onChange={e => setK({ anschlussHausnummer: e.target.value })} placeholder="Nr." />
                  </div>
                </EditRow>
                <EditRow label="Anschluss PLZ / Ort">
                  <div className="flex gap-2">
                    <input className="w-24 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editKunde.anschlussPLZ} onChange={e => setK({ anschlussPLZ: e.target.value })} placeholder="PLZ" />
                    <input className={inputCls} value={editKunde.anschlussOrt} onChange={e => setK({ anschlussOrt: e.target.value })} placeholder="Ort" />
                  </div>
                </EditRow>
              </>
            ) : (
              <>
                <InfoRow label="Name" value={`${anfrage.kunde.vorname} ${anfrage.kunde.nachname}`} />
                <InfoRow label="Anschlussadresse" value={`${anfrage.kunde.anschlussStrasse} ${anfrage.kunde.anschlussHausnummer}, ${anfrage.kunde.anschlussPLZ} ${anfrage.kunde.anschlussOrt}`} />
                <InfoRow label="Rechnungsadresse" value={`${anfrage.kunde.strasse} ${anfrage.kunde.hausnummer}, ${anfrage.kunde.plz} ${anfrage.kunde.ort}`} />
                <InfoRow label="E-Mail" value={anfrage.kunde.email} />
                <InfoRow label="Telefon" value={anfrage.kunde.telefon} />
              </>
            )}
          </dl>
        </div>

        {/* Anschlussparameter */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Anschlussparameter</h3>
          <dl>
            {editMode && editAnschluss ? (
              <>
                <EditRow label="Sparte">
                  <select className={selectCls} value={editAnschluss.sparte} onChange={e => setA({ sparte: e.target.value as Anschlussdaten['sparte'] })}>
                    {(['Strom', 'Gas', 'Wasser', 'MSH'] as const).map(s => <option key={s}>{s}</option>)}
                  </select>
                </EditRow>
                <EditRow label="Anschlusstyp">
                  <select className={selectCls} value={editAnschluss.anschlussTyp} onChange={e => setA({ anschlussTyp: e.target.value as Anschlussdaten['anschlussTyp'] })}>
                    {(['Neuanschluss', 'Änderung', 'Stilllegung'] as const).map(t => <option key={t}>{t}</option>)}
                  </select>
                </EditRow>
                <EditRow label="Gebäudetyp">
                  <select className={selectCls} value={editAnschluss.gebaeude} onChange={e => setA({ gebaeude: e.target.value as Anschlussdaten['gebaeude'] })}>
                    {(['EFH', 'MFH', 'Gewerbe', 'Baustrom'] as const).map(g => <option key={g}>{g}</option>)}
                  </select>
                </EditRow>
                {editAnschluss.sparte === 'Strom' && (
                  <EditRow label="HA-Sicherung (A)">
                    <input className={inputCls} type="number" value={editAnschluss.hausanschlusssicherung ?? ''} onChange={e => setA({ hausanschlusssicherung: Number(e.target.value) })} />
                  </EditRow>
                )}
                {(editAnschluss.sparte === 'Gas' || editAnschluss.sparte === 'Wasser') && (
                  <EditRow label="Nennweite (DN)">
                    <input className={inputCls} type="number" value={editAnschluss.nennweite ?? ''} onChange={e => setA({ nennweite: Number(e.target.value) })} />
                  </EditRow>
                )}
                {editAnschluss.sparte === 'Gas' && (
                  <EditRow label="Anschlusswert (kW)">
                    <input className={inputCls} type="number" value={editAnschluss.anschlusswert ?? ''} onChange={e => setA({ anschlusswert: Number(e.target.value) })} />
                  </EditRow>
                )}
              </>
            ) : (
              <>
                <InfoRow label="Sparte" value={`${SPARTE_ICON[a.sparte]} ${a.sparte}${a.sparteMSH ? ` (${a.sparteMSH.join(', ')})` : ''}`} />
                <InfoRow label="Anschlusstyp" value={a.anschlussTyp} />
                <InfoRow label="Gebäudetyp" value={a.gebaeude} />
                {a.hausanschlusssicherung !== undefined && <InfoRow label="HA-Sicherung" value={`${a.hausanschlusssicherung} A`} />}
                {a.anzahlZaehlerplaetze !== undefined && <InfoRow label="Zählerplätze" value={a.anzahlZaehlerplaetze} />}
                {a.nennweite !== undefined && <InfoRow label="Nennweite" value={`DN ${a.nennweite}`} />}
                {a.anschlusswert !== undefined && <InfoRow label="Anschlusswert" value={`${a.anschlusswert} kW`} />}
              </>
            )}
          </dl>
        </div>

        {/* Trasse & Randbedingungen */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Trasse & Randbedingungen</h3>
          <dl>
            {editMode && editAnschluss ? (
              <>
                <EditRow label="Länge öff. Grund (m)">
                  <input className={inputCls} type="number" min={0} value={editAnschluss.laengeOeffentlich} onChange={e => setA({ laengeOeffentlich: Number(e.target.value) })} />
                </EditRow>
                <EditRow label="Länge Privatgrund (m)">
                  <input className={inputCls} type="number" min={0} value={editAnschluss.laengePrivat} onChange={e => setA({ laengePrivat: Number(e.target.value) })} />
                </EditRow>
                <EditRow label="Oberfläche">
                  <select className={selectCls} value={editAnschluss.oberflaeche} onChange={e => setA({ oberflaeche: e.target.value as Anschlussdaten['oberflaeche'] })}>
                    {(['Asphalt', 'Pflaster', 'Grünfläche', 'Schotter'] as const).map(o => <option key={o}>{o}</option>)}
                  </select>
                </EditRow>
                <EditRow label="Bodenklasse">
                  <select className={selectCls} value={editAnschluss.bodenklasse} onChange={e => setA({ bodenklasse: e.target.value as Anschlussdaten['bodenklasse'] })}>
                    {(['Normal', 'Fels', 'Grundwasser', 'Kontaminiert'] as const).map(b => <option key={b}>{b}</option>)}
                  </select>
                </EditRow>
                <EditRow label="Bauverfahren">
                  <select className={selectCls} value={editAnschluss.bauverfahren} onChange={e => setA({ bauverfahren: e.target.value as Anschlussdaten['bauverfahren'] })}>
                    {(['Offener Graben', 'Spülbohrung', 'Pressung'] as const).map(b => <option key={b}>{b}</option>)}
                  </select>
                </EditRow>
                <EditRow label="Straßenquerung">
                  <Toggle value={editAnschluss.strassenquerung} onChange={v => setA({ strassenquerung: v })} />
                </EditRow>
                <EditRow label="Kernbohrung">
                  <Toggle value={editAnschluss.hauseinführungKernbohrung} onChange={v => setA({ hauseinführungKernbohrung: v })} />
                </EditRow>
                <EditRow label="Winterbau">
                  <Toggle value={editAnschluss.winterbau} onChange={v => setA({ winterbau: v })} />
                </EditRow>
              </>
            ) : (
              <>
                <InfoRow label="Länge öff. Grund" value={`${a.laengeOeffentlich} m`} />
                <InfoRow label="Länge Privatgrund" value={`${a.laengePrivat} m`} />
                <InfoRow label="Gesamtlänge" value={`${a.laengeOeffentlich + a.laengePrivat} m`} />
                <InfoRow label="Oberfläche" value={a.oberflaeche} />
                <InfoRow label="Bodenklasse" value={a.bodenklasse} />
                <InfoRow label="Bauverfahren" value={a.bauverfahren} />
                <InfoRow label="Straßenquerung" value={a.strassenquerung ? '✅ Ja' : '❌ Nein'} />
                <InfoRow label="Kernbohrung" value={a.hauseinführungKernbohrung ? '✅ Ja' : '❌ Nein'} />
                <InfoRow label="Winterbau" value={a.winterbau ? '✅ Ja' : '❌ Nein'} />
              </>
            )}
          </dl>
        </div>

        {/* Notizen */}
        {editMode ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Notizen</h3>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Interne Notizen zur Anfrage…"
              value={editNotizen}
              onChange={e => setEditNotizen(e.target.value)}
            />
          </div>
        ) : anfrage.notizen ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Notizen
            </h3>
            <p className="text-sm text-amber-900">{anfrage.notizen}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
