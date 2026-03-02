import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { berechneKalkulation, formatEuro } from '@/lib/calculator';
import type { Anfrage, Anschlussdaten, Kundenangaben, Sparte, AnschlussTyp, Gebaeude, Oberflaeche } from '@/types';

// ─── Typen für Wizard-Formulare ───────────────────────────────────────────────

interface KontaktForm {
  vorname: string;
  nachname: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  abweichendeAnschlussadresse: boolean;
  anschlussStrasse: string;
  anschlussHausnummer: string;
  anschlussPLZ: string;
  anschlussOrt: string;
}

interface AnschlussForm {
  sparte: Sparte;
  anschlussTyp: AnschlussTyp;
  gebaeude: Gebaeude;
  laengeOeffentlich: number;
  laengePrivat: number;
  oberflaeche: Oberflaeche;
  strassenquerung: boolean;
  hausanschlusssicherung: number;
  sparteMSH: Sparte[];
}

// ─── Hilfkomponenten ──────────────────────────────────────────────────────────

function OptionKachel<T extends string>({
  value,
  selected,
  onClick,
  label,
  sub,
}: {
  value: T;
  selected: boolean;
  onClick: (v: T) => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
        selected
          ? 'border-blue-600 bg-blue-50 text-blue-800'
          : 'border-gray-200 hover:border-blue-300 text-gray-700'
      }`}
    >
      <span className="font-semibold text-sm">{label}</span>
      {sub && <span className="text-xs text-gray-500 mt-0.5">{sub}</span>}
    </button>
  );
}

function LabeledInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

// ─── Fortschrittsleiste ───────────────────────────────────────────────────────

function Fortschritt({ step }: { step: number }) {
  const schritte = ['Kontaktdaten', 'Anschlussdetails', 'Kostenschätzung'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {schritte.map((label, i) => {
        const num = i + 1;
        const aktiv = num === step;
        const fertig = num < step;
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  fertig
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : aktiv
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {fertig ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  num
                )}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${aktiv ? 'text-blue-700 font-semibold' : fertig ? 'text-blue-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < schritte.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-4 ${fertig ? 'bg-blue-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Schritt 1: Kontaktdaten ──────────────────────────────────────────────────

function SchrittKontakt({
  data,
  onChange,
  onWeiter,
}: {
  data: KontaktForm;
  onChange: (d: Partial<KontaktForm>) => void;
  onWeiter: () => void;
}) {
  function isValid() {
    return (
      data.vorname.trim() &&
      data.nachname.trim() &&
      data.strasse.trim() &&
      data.hausnummer.trim() &&
      data.plz.trim() &&
      data.ort.trim() &&
      data.email.trim() &&
      data.telefon.trim()
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <LabeledInput label="Vorname *" value={data.vorname} onChange={e => onChange({ vorname: e.target.value })} placeholder="Max" />
        <LabeledInput label="Nachname *" value={data.nachname} onChange={e => onChange({ nachname: e.target.value })} placeholder="Mustermann" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <LabeledInput label="Straße *" value={data.strasse} onChange={e => onChange({ strasse: e.target.value })} placeholder="Musterstraße" />
        </div>
        <LabeledInput label="Hausnummer *" value={data.hausnummer} onChange={e => onChange({ hausnummer: e.target.value })} placeholder="12a" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <LabeledInput label="PLZ *" value={data.plz} onChange={e => onChange({ plz: e.target.value })} placeholder="76131" />
        <div className="col-span-2">
          <LabeledInput label="Ort *" value={data.ort} onChange={e => onChange({ ort: e.target.value })} placeholder="Karlsruhe" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <LabeledInput label="E-Mail *" type="email" value={data.email} onChange={e => onChange({ email: e.target.value })} placeholder="max@beispiel.de" />
        <LabeledInput label="Telefon *" type="tel" value={data.telefon} onChange={e => onChange({ telefon: e.target.value })} placeholder="+49 721 ..." />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data.abweichendeAnschlussadresse}
            onChange={e => onChange({ abweichendeAnschlussadresse: e.target.checked })}
            className="rounded"
          />
          Anschlussadresse weicht von Kontaktadresse ab
        </label>
      </div>

      {data.abweichendeAnschlussadresse && (
        <div className="border border-blue-100 rounded-xl p-4 bg-blue-50 space-y-4">
          <p className="text-sm font-medium text-blue-800">Anschlussadresse</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <LabeledInput label="Straße" value={data.anschlussStrasse} onChange={e => onChange({ anschlussStrasse: e.target.value })} placeholder="Anschlussstraße" />
            </div>
            <LabeledInput label="Hausnummer" value={data.anschlussHausnummer} onChange={e => onChange({ anschlussHausnummer: e.target.value })} placeholder="5" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <LabeledInput label="PLZ" value={data.anschlussPLZ} onChange={e => onChange({ anschlussPLZ: e.target.value })} placeholder="76131" />
            <div className="col-span-2">
              <LabeledInput label="Ort" value={data.anschlussOrt} onChange={e => onChange({ anschlussOrt: e.target.value })} placeholder="Karlsruhe" />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onWeiter}
        disabled={!isValid()}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Weiter →
      </button>
    </div>
  );
}

// ─── Schritt 2: Anschlussdetails ─────────────────────────────────────────────

const SPARTEN: { value: Sparte; label: string; sub: string }[] = [
  { value: 'Strom', label: 'Strom', sub: 'Elektroanschluss' },
  { value: 'Gas', label: 'Gas', sub: 'Erdgasanschluss' },
  { value: 'Wasser', label: 'Wasser', sub: 'Wasseranschluss' },
  { value: 'MSH', label: 'MSH', sub: 'Mehrsparten' },
];

const ANSCHLUSS_TYPEN: { value: AnschlussTyp; label: string }[] = [
  { value: 'Neuanschluss', label: 'Neuanschluss' },
  { value: 'Änderung', label: 'Änderung' },
  { value: 'Stilllegung', label: 'Stilllegung' },
];

const GEBAEUDE_TYPEN: { value: Gebaeude; label: string; sub: string }[] = [
  { value: 'EFH', label: 'EFH', sub: 'Einfamilienhaus' },
  { value: 'MFH', label: 'MFH', sub: 'Mehrfamilienhaus' },
  { value: 'Gewerbe', label: 'Gewerbe', sub: 'Gewerbeobjekt' },
  { value: 'Baustrom', label: 'Baustrom', sub: 'Baustelle' },
];

const OBERFLAECHEN: { value: Oberflaeche; label: string }[] = [
  { value: 'Grünfläche', label: 'Grünfläche / Erde' },
  { value: 'Schotter', label: 'Schotter / Kies' },
  { value: 'Pflaster', label: 'Pflaster' },
  { value: 'Asphalt', label: 'Asphalt' },
];

const MSH_SPARTEN: { value: Sparte; label: string }[] = [
  { value: 'Strom', label: 'Strom' },
  { value: 'Gas', label: 'Gas' },
  { value: 'Wasser', label: 'Wasser' },
];

function LengthSlider({
  label,
  value,
  onChange,
  max = 80,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-blue-700">{value} m</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>0 m</span>
        <span>{max} m</span>
      </div>
    </div>
  );
}

function SchrittAnschluss({
  data,
  onChange,
  onWeiter,
  onZurueck,
}: {
  data: AnschlussForm;
  onChange: (d: Partial<AnschlussForm>) => void;
  onWeiter: () => void;
  onZurueck: () => void;
}) {
  function toggleMshSparte(s: Sparte) {
    const aktuelle = data.sparteMSH;
    onChange({
      sparteMSH: aktuelle.includes(s) ? aktuelle.filter(x => x !== s) : [...aktuelle, s],
    });
  }

  return (
    <div className="space-y-6">
      {/* Sparte */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Gewünschte Sparte *</p>
        <div className="grid grid-cols-4 gap-2">
          {SPARTEN.map(s => (
            <OptionKachel key={s.value} value={s.value} selected={data.sparte === s.value} onClick={v => onChange({ sparte: v })} label={s.label} sub={s.sub} />
          ))}
        </div>
        {data.sparte === 'MSH' && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs font-medium text-blue-800 mb-2">Welche Sparten sollen angeschlossen werden?</p>
            <div className="flex gap-3">
              {MSH_SPARTEN.map(s => (
                <label key={s.value} className="flex items-center gap-1.5 text-sm text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.sparteMSH.includes(s.value)}
                    onChange={() => toggleMshSparte(s.value)}
                    className="rounded"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Anschlussart */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Anschlussart *</p>
        <div className="grid grid-cols-3 gap-2">
          {ANSCHLUSS_TYPEN.map(t => (
            <OptionKachel key={t.value} value={t.value} selected={data.anschlussTyp === t.value} onClick={v => onChange({ anschlussTyp: v })} label={t.label} />
          ))}
        </div>
      </div>

      {/* Gebäudetyp */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Gebäudetyp *</p>
        <div className="grid grid-cols-4 gap-2">
          {GEBAEUDE_TYPEN.map(g => (
            <OptionKachel key={g.value} value={g.value} selected={data.gebaeude === g.value} onClick={v => onChange({ gebaeude: v })} label={g.label} sub={g.sub} />
          ))}
        </div>
      </div>

      {/* Trassenlängen */}
      <div className="space-y-4">
        <LengthSlider label="Geschätzte Länge im öffentlichen Grund" value={data.laengeOeffentlich} onChange={v => onChange({ laengeOeffentlich: v })} />
        <LengthSlider label="Geschätzte Länge auf Privatgrund" value={data.laengePrivat} onChange={v => onChange({ laengePrivat: v })} />
        <p className="text-xs text-gray-400">Tipp: Messen Sie die Strecke von der Straße bis zur Gebäudewand.</p>
      </div>

      {/* Oberfläche */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Oberfläche im öffentlichen Bereich *</p>
        <div className="grid grid-cols-2 gap-2">
          {OBERFLAECHEN.map(o => (
            <OptionKachel key={o.value} value={o.value} selected={data.oberflaeche === o.value} onClick={v => onChange({ oberflaeche: v })} label={o.label} />
          ))}
        </div>
      </div>

      {/* Straßenquerung */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Muss eine Straße gequert werden?</p>
        <div className="grid grid-cols-2 gap-2">
          <OptionKachel value="ja" selected={data.strassenquerung} onClick={() => onChange({ strassenquerung: true })} label="Ja" />
          <OptionKachel value="nein" selected={!data.strassenquerung} onClick={() => onChange({ strassenquerung: false })} label="Nein" />
        </div>
      </div>

      {/* Strom: Absicherung */}
      {data.sparte === 'Strom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gewünschte Hausanschlusssicherung (Ampere)
            <span className="text-gray-400 font-normal"> – Standard: 63 A</span>
          </label>
          <select
            value={data.hausanschlusssicherung}
            onChange={e => onChange({ hausanschlusssicherung: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[35, 63, 80, 100, 125, 160, 200, 250].map(a => (
              <option key={a} value={a}>{a} A{a === 63 ? ' (Standard EFH)' : ''}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onZurueck} className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
          ← Zurück
        </button>
        <button onClick={onWeiter} className="flex-2 flex-grow-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
          Schätzung anzeigen →
        </button>
      </div>
    </div>
  );
}

// ─── Schritt 3: Kostenschätzung ───────────────────────────────────────────────

function SchrittSchaetzung({
  kontakt,
  anschluss,
  onZurueck,
}: {
  kontakt: KontaktForm;
  anschluss: AnschlussForm;
  onZurueck: () => void;
  onAbsenden: (anfrage: Anfrage) => void;
}) {
  const { preiskonfiguration, addAnfrage } = useApp();
  const [abgesendet, setAbgesendet] = useState(false);
  const [anfrageNummer, setAnfrageNummer] = useState('');

  const dummyAnfrage: Anfrage = useMemo(() => {
    const anschlussdaten: Anschlussdaten = {
      sparte: anschluss.sparte,
      anschlussTyp: anschluss.anschlussTyp,
      gebaeude: anschluss.gebaeude,
      laengeOeffentlich: anschluss.laengeOeffentlich,
      laengePrivat: anschluss.laengePrivat,
      oberflaeche: anschluss.oberflaeche,
      strassenquerung: anschluss.strassenquerung,
      hauseinführungKernbohrung: false,
      bodenklasse: 'Normal',
      bauverfahren: 'Offener Graben',
      winterbau: false,
      ...(anschluss.sparte === 'Strom' && { hausanschlusssicherung: anschluss.hausanschlusssicherung }),
      ...(anschluss.sparte === 'MSH' && { sparteMSH: anschluss.sparteMSH }),
    };
    const kundenangaben: Kundenangaben = {
      vorname: kontakt.vorname,
      nachname: kontakt.nachname,
      strasse: kontakt.strasse,
      hausnummer: kontakt.hausnummer,
      plz: kontakt.plz,
      ort: kontakt.ort,
      telefon: kontakt.telefon,
      email: kontakt.email,
      anschlussStrasse: kontakt.abweichendeAnschlussadresse ? kontakt.anschlussStrasse : kontakt.strasse,
      anschlussHausnummer: kontakt.abweichendeAnschlussadresse ? kontakt.anschlussHausnummer : kontakt.hausnummer,
      anschlussPLZ: kontakt.abweichendeAnschlussadresse ? kontakt.anschlussPLZ : kontakt.plz,
      anschlussOrt: kontakt.abweichendeAnschlussadresse ? kontakt.anschlussOrt : kontakt.ort,
    };
    return {
      id: 'preview',
      nummer: 'preview',
      eingangsdatum: new Date().toISOString(),
      status: 'neu',
      kunde: kundenangaben,
      anschluss: anschlussdaten,
    };
  }, [kontakt, anschluss]);

  const kalkulation = useMemo(
    () => berechneKalkulation(dummyAnfrage, preiskonfiguration, 'Kundenportal'),
    [dummyAnfrage, preiskonfiguration],
  );

  function handleAbsenden() {
    const id = `portal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const laufendeNummer = String(Math.floor(Math.random() * 900) + 100);
    const nummer = `ANF-2025-${laufendeNummer}`;
    const anfrage: Anfrage = {
      ...dummyAnfrage,
      id,
      nummer,
      eingangsdatum: new Date().toISOString(),
      status: 'neu',
      kalkulation: { ...kalkulation, anfragenId: id },
    };
    addAnfrage(anfrage);
    setAnfrageNummer(nummer);
    setAbgesendet(true);
  }

  if (abgesendet) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Anfrage erfolgreich übermittelt!</h3>
        <p className="text-gray-500 mb-4">Ihre Anfragenummer lautet:</p>
        <div className="inline-block bg-blue-50 border border-blue-200 rounded-xl px-6 py-3 mb-6">
          <span className="text-2xl font-bold text-blue-700">{anfrageNummer}</span>
        </div>
        <p className="text-sm text-gray-500">
          Ein Sachbearbeiter wird sich in Kürze mit Ihnen in Verbindung setzen.<br />
          Sie erhalten eine Bestätigung an <strong>{kontakt.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hinweisbox */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-amber-800">
          Dies ist eine <strong>unverbindliche Schätzung</strong> auf Basis Ihrer Angaben. Die tatsächlichen Kosten werden nach einer Prüfung durch unseren Sachbearbeiter ermittelt.
        </p>
      </div>

      {/* Preisanzeige */}
      <div className="rounded-xl border-2 border-blue-600 p-5">
        {kalkulation.istEinzelfall ? (
          <>
            <p className="text-sm text-gray-500 mb-1">Geschätzte Kosten (Kostenspanne)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-700">{formatEuro(kalkulation.kostenspanneMin!)}</span>
              <span className="text-gray-500">bis</span>
              <span className="text-3xl font-bold text-blue-700">{formatEuro(kalkulation.kostenspanneMax!)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">inkl. {Math.round(preiskonfiguration.mwstSatz * 100)} % MwSt.</p>
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs font-semibold text-orange-800 mb-1">Hinweis: Einzelfallprüfung erforderlich</p>
              <ul className="text-xs text-orange-700 space-y-0.5">
                {kalkulation.einzelfallGruende.map((g, i) => <li key={i}>• {g}</li>)}
              </ul>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-1">Geschätzte Kosten</p>
            <span className="text-4xl font-bold text-blue-700">{formatEuro(kalkulation.gesamtBrutto)}</span>
            <p className="text-xs text-gray-400 mt-1">inkl. {Math.round(preiskonfiguration.mwstSatz * 100)} % MwSt.</p>
          </>
        )}
      </div>

      {/* Kostenpositionen (zusammengeklappt) */}
      <details className="border border-gray-200 rounded-xl">
        <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 rounded-xl">
          Aufschlüsselung der Kostenpositionen
        </summary>
        <div className="px-4 pb-3 divide-y divide-gray-100">
          {kalkulation.positionen.map((pos, i) => (
            <div key={i} className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">{pos.bezeichnung}</span>
              <span className="font-medium text-gray-800">{formatEuro(pos.gesamtpreis)}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 text-sm font-semibold text-gray-800">
            <span>Netto</span>
            <span>{formatEuro(kalkulation.zwischensumme)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm text-gray-500">
            <span>MwSt. ({Math.round(preiskonfiguration.mwstSatz * 100)} %)</span>
            <span>{formatEuro(kalkulation.mwstBetrag)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm font-bold text-blue-700">
            <span>Gesamt brutto</span>
            <span>{formatEuro(kalkulation.gesamtBrutto)}</span>
          </div>
        </div>
      </details>

      {/* Annahmen */}
      <p className="text-xs text-gray-400">
        Annahmen: Bodenklasse Normal, offener Graben, kein Winterbau. Tatsächliche Kosten können abweichen.
      </p>

      <div className="flex gap-3 pt-2">
        <button onClick={onZurueck} className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
          ← Zurück
        </button>
        <button
          onClick={handleAbsenden}
          className="flex-2 flex-grow-[2] py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors cursor-pointer"
        >
          Anfrage verbindlich einreichen
        </button>
      </div>
    </div>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

const defaultKontakt: KontaktForm = {
  vorname: '',
  nachname: '',
  strasse: '',
  hausnummer: '',
  plz: '',
  ort: '',
  telefon: '',
  email: '',
  abweichendeAnschlussadresse: false,
  anschlussStrasse: '',
  anschlussHausnummer: '',
  anschlussPLZ: '',
  anschlussOrt: '',
};

const defaultAnschluss: AnschlussForm = {
  sparte: 'Strom',
  anschlussTyp: 'Neuanschluss',
  gebaeude: 'EFH',
  laengeOeffentlich: 10,
  laengePrivat: 5,
  oberflaeche: 'Asphalt',
  strassenquerung: false,
  hausanschlusssicherung: 63,
  sparteMSH: ['Strom', 'Gas', 'Wasser'],
};

export default function Kundenportal() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [kontakt, setKontakt] = useState<KontaktForm>(defaultKontakt);
  const [anschluss, setAnschluss] = useState<AnschlussForm>(defaultAnschluss);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="#/" className="flex items-center gap-3 hover:opacity-75 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">Netz-KA GmbH</span>
              <span className="text-gray-400 text-sm ml-2">· Hausanschluss-Portal</span>
            </div>
          </a>
        </div>
      </header>

      {/* Inhalt */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hausanschluss anfragen</h1>
          <p className="text-gray-500 text-sm mt-1">
            Berechnen Sie Ihre Anschlusskosten und stellen Sie direkt eine Anfrage.
          </p>
        </div>

        <Fortschritt step={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {step === 1 && (
            <SchrittKontakt
              data={kontakt}
              onChange={d => setKontakt(prev => ({ ...prev, ...d }))}
              onWeiter={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <SchrittAnschluss
              data={anschluss}
              onChange={d => setAnschluss(prev => ({ ...prev, ...d }))}
              onWeiter={() => setStep(3)}
              onZurueck={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <SchrittSchaetzung
              kontakt={kontakt}
              anschluss={anschluss}
              onZurueck={() => setStep(2)}
              onAbsenden={() => {}}
            />
          )}
        </div>
      </main>
    </div>
  );
}
