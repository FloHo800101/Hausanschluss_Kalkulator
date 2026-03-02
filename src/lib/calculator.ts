import type { Anfrage, Kalkulation, KalkulationsPosition, Preiskonfiguration, SpartePreise, Sparte } from '@/types';

function addPos(
  positionen: KalkulationsPosition[],
  bezeichnung: string,
  menge: number,
  einheit: string,
  einzelpreis: number,
  kategorie: KalkulationsPosition['kategorie'],
) {
  if (menge === 0 || einzelpreis === 0) return;
  positionen.push({ bezeichnung, menge, einheit, einzelpreis, gesamtpreis: menge * einzelpreis, kategorie });
}

function kalkuliereSparte(
  sparte: Sparte,
  preise: SpartePreise,
  anfrage: Anfrage,
  positionen: KalkulationsPosition[],
  annahmen: string[],
  einzelfallGruende: string[],
  prefix: string = '',
) {
  const a = anfrage.anschluss;
  const label = prefix ? `${prefix} ` : '';

  // Grundpauschale
  addPos(positionen, `${label}Grundpauschale inkl. ${preise.inkludierteMetersOeffentlich} m`, 1, 'Pauschale', preise.grundpauschale, 'Grundleistung');
  annahmen.push(`${label}Grundpauschale enthält ${preise.inkludierteMetersOeffentlich} m öffentlicher Grund und ${preise.inkludierteMetersPrivat} m Privatgrund.`);

  // Zusätzliche Meter öffentlicher Grund
  const extraOeffentlich = Math.max(0, a.laengeOeffentlich - preise.inkludierteMetersOeffentlich);
  if (extraOeffentlich > 0) {
    addPos(positionen, `${label}Meterpreis öff. Grund (>${preise.inkludierteMetersOeffentlich} m)`, extraOeffentlich, 'm', preise.meterpreisOeffentlich, 'Länge');
  }

  // Zusätzliche Meter Privatgrund
  const extraPrivat = Math.max(0, a.laengePrivat - preise.inkludierteMetersPrivat);
  if (extraPrivat > 0) {
    addPos(positionen, `${label}Meterpreis Privatgrund (>${preise.inkludierteMetersPrivat} m)`, extraPrivat, 'm', preise.meterpreisPrivat, 'Länge');
  }

  // Oberflächenzuschlag
  const gesamtlaenge = a.laengeOeffentlich + a.laengePrivat;
  if (a.oberflaeche === 'Asphalt') {
    addPos(positionen, `${label}Zuschlag Asphaltoberfläche`, gesamtlaenge, 'm', preise.zuschlagAsphalt, 'Zuschlag');
    annahmen.push(`${label}Asphaltwiederherstellung auf ${gesamtlaenge} m Gesamttrasse.`);
  } else if (a.oberflaeche === 'Pflaster') {
    addPos(positionen, `${label}Zuschlag Pflasteroberfläche`, gesamtlaenge, 'm', preise.zuschlagPflaster, 'Zuschlag');
    annahmen.push(`${label}Pflasterwiederherstellung auf ${gesamtlaenge} m Gesamttrasse.`);
  }

  // Straßenquerung
  if (a.strassenquerung) {
    addPos(positionen, `${label}Zuschlag Straßenquerung`, 1, 'Stück', preise.zuschlagStrassenquerung, 'Zuschlag');
  }

  // Kernbohrung
  if (a.hauseinführungKernbohrung) {
    addPos(positionen, `${label}Kernbohrung Hauseinführung`, 1, 'Stück', preise.zuschlagKernbohrung, 'Zuschlag');
  }

  // Winterbau
  if (a.winterbau) {
    addPos(positionen, `${label}Zuschlag Winterbau`, gesamtlaenge, 'm', preise.zuschlagWinterbau, 'Zuschlag');
  }

  // Spülbohrung statt Offener Graben
  if (a.bauverfahren === 'Spülbohrung') {
    addPos(positionen, `${label}Spülbohrung (Mehrkosten ggü. offener Graben)`, gesamtlaenge, 'm', preise.zuschlagSpuelbohrung, 'Zuschlag');
    annahmen.push(`${label}Horizontalbohrung als Bauverfahren aufgrund Straßenquerung/Hindernisse.`);
  }

  // Fels-Zuschlag
  if (a.bodenklasse === 'Fels') {
    addPos(positionen, `${label}Zuschlag Felsaushub`, gesamtlaenge, 'm', preise.zuschlagFels, 'Zuschlag');
  }

  // BKZ nur für Strom
  if (sparte === 'Strom' && preise.bkzSatz && a.hausanschlusssicherung) {
    const standardleistung = 63; // A
    if (a.hausanschlusssicherung > standardleistung) {
      // Näherungsformel: kW = A * U * sqrt(3) / 1000
      const erhöhungsleistung = Math.round(((a.hausanschlusssicherung - standardleistung) * 400 * 1.732) / 1000);
      addPos(positionen, `BKZ Baukostenzuschuss (${erhöhungsleistung} kW Erhöhungsleistung)`, erhöhungsleistung, 'kW', preise.bkzSatz, 'BKZ');
      annahmen.push(`BKZ berechnet auf Erhöhungsleistung ${erhöhungsleistung} kW (HA-Sicherung ${a.hausanschlusssicherung}A ggü. Standard 63A).`);
    }
  }

  // Gates / Einzelfall-Prüfung
  const gesamtTrasse = a.laengeOeffentlich + a.laengePrivat;
  if (gesamtTrasse > preise.schwelleEinzelfall) {
    einzelfallGruende.push(`Gesamttrassenlänge ${gesamtTrasse} m überschreitet Schwelle von ${preise.schwelleEinzelfall} m → Einzelfallprüfung erforderlich.`);
  }
  if (a.strassenquerung && a.bauverfahren === 'Spülbohrung') {
    einzelfallGruende.push('Straßenquerung mit Spülbohrung → Prüfung von Tiefenlage und Hindernissen empfohlen.');
  }
  if (a.bodenklasse === 'Kontaminiert') {
    einzelfallGruende.push('Kontaminierter Boden → Sonderentsorgung, Einzelfallpreis erforderlich.');
  }
  if (a.bodenklasse === 'Grundwasser') {
    einzelfallGruende.push('Hoher Grundwasserstand → Wasserhaltung als Sonderleistung, Kostenspanne statt Festpreis.');
  }
}

export function berechneKalkulation(anfrage: Anfrage, config: Preiskonfiguration, erstelltVon: string): Kalkulation {
  const positionen: KalkulationsPosition[] = [];
  const annahmen: string[] = [];
  const einzelfallGruende: string[] = [];

  const a = anfrage.anschluss;
  const preise = config.spartePreise[a.sparte];

  if (a.sparte === 'MSH' && a.sparteMSH && a.sparteMSH.length > 0) {
    // MSH: Paketpreis
    kalkuliereSparte('MSH', preise, anfrage, positionen, annahmen, einzelfallGruende);
    annahmen.push(`Mehrsparten-Hausanschluss (${a.sparteMSH.join(', ')}) als Paketpreis mit ${Math.round(config.mshRabatt * 100)}% Paketrabatt bereits eingerechnet.`);
  } else {
    kalkuliereSparte(a.sparte, preise, anfrage, positionen, annahmen, einzelfallGruende);
  }

  // Admin-Positionen (einmalig)
  addPos(positionen, 'Planung und Engineering', 1, 'Pauschale', preise.planungspauschale, 'Admin');
  addPos(positionen, 'Inbetriebnahme und Abnahme', 1, 'Pauschale', preise.inbetriebnahme, 'Admin');
  addPos(positionen, 'Dokumentation und GIS-Einmessung', 1, 'Pauschale', preise.dokumentation, 'Admin');

  annahmen.push(`MwSt-Satz: ${Math.round(config.mwstSatz * 100)} %`);
  annahmen.push(`Preisstand: ${config.preisstand} (Version ${config.version})`);
  annahmen.push(`Anschlussart: ${a.anschlussTyp}, Gebäudetyp: ${a.gebaeude}`);

  const zwischensumme = positionen.reduce((s, p) => s + p.gesamtpreis, 0);
  const mwstBetrag = zwischensumme * config.mwstSatz;
  const gesamtBrutto = zwischensumme + mwstBetrag;
  const istEinzelfall = einzelfallGruende.length > 0;

  // Kostenspanne für Einzelfall-Positionen
  const kostenspanneMin = istEinzelfall ? gesamtBrutto * 0.85 : undefined;
  const kostenspanneMax = istEinzelfall ? gesamtBrutto * 1.35 : undefined;

  return {
    anfragenId: anfrage.id,
    erstelltAm: new Date().toISOString(),
    erstelltVon,
    preiskonfigurationVersion: config.version,
    positionen,
    zwischensumme,
    mwstBetrag,
    gesamtBrutto,
    istEinzelfall,
    einzelfallGruende,
    kostenspanneMin,
    kostenspanneMax,
    annahmen,
  };
}

export function formatEuro(betrag: number): string {
  return betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
