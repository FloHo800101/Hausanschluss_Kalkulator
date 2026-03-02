export type Sparte = 'Strom' | 'Gas' | 'Wasser' | 'MSH';
export type AnschlussTyp = 'Neuanschluss' | 'Änderung' | 'Stilllegung';
export type Gebaeude = 'EFH' | 'MFH' | 'Gewerbe' | 'Baustrom';
export type Oberflaeche = 'Asphalt' | 'Pflaster' | 'Grünfläche' | 'Schotter';
export type Bauverfahren = 'Offener Graben' | 'Spülbohrung' | 'Pressung';
export type AnfrageStatus = 'neu' | 'in_bearbeitung' | 'kalkuliert' | 'angebot_erstellt' | 'abgeschlossen';
export type Bodenklasse = 'Normal' | 'Fels' | 'Grundwasser' | 'Kontaminiert';

export interface Anschlussdaten {
  sparte: Sparte;
  anschlussTyp: AnschlussTyp;
  gebaeude: Gebaeude;
  // Strom
  hausanschlusssicherung?: number; // Ampere
  anzahlZaehlerplaetze?: number;
  // Gas/Wasser
  nennweite?: number; // DN
  anschlusswert?: number; // kW
  // Trasse
  laengeOeffentlich: number; // Meter
  laengePrivat: number; // Meter
  strassenquerung: boolean;
  hauseinführungKernbohrung: boolean;
  // Oberfläche
  oberflaeche: Oberflaeche;
  // Boden
  bodenklasse: Bodenklasse;
  // Besonderheiten
  bauverfahren: Bauverfahren;
  winterbau: boolean;
  // MSH
  sparteMSH?: Sparte[];
}

export interface Kundenangaben {
  vorname: string;
  nachname: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  // Anschlussadresse (falls abweichend)
  anschlussStrasse: string;
  anschlussHausnummer: string;
  anschlussPLZ: string;
  anschlussOrt: string;
}

export interface Anfrage {
  id: string;
  nummer: string;
  eingangsdatum: string;
  status: AnfrageStatus;
  sachbearbeiter?: string;
  kunde: Kundenangaben;
  anschluss: Anschlussdaten;
  kalkulation?: Kalkulation;
  notizen?: string;
}

// Preiskonfiguration
export interface SpartePreise {
  grundpauschale: number;      // €, inkl. inkludierteMetersÖ
  inkludierteMetersOeffentlich: number; // Meter kostenfrei
  inkludierteMetersPrivat: number;
  meterpreisOeffentlich: number; // €/m
  meterpreisPrivat: number;      // €/m
  zuschlagAsphalt: number;       // €/m
  zuschlagPflaster: number;      // €/m
  zuschlagStrassenquerung: number; // €/Querung
  zuschlagKernbohrung: number;
  zuschlagWinterbau: number;     // €/m
  zuschlagSpuelbohrung: number;  // €/m (Mehrkosten)
  zuschlagFels: number;          // €/m Mehrkosten
  bkzSatz?: number;              // €/kW (nur Strom)
  schwelleEinzelfall: number;    // Gesamtlänge ab der Einzelfall
  planungspauschale: number;
  inbetriebnahme: number;
  dokumentation: number;
}

export interface Preiskonfiguration {
  version: string;
  gueltigAb: string;
  preisstand: string;
  mwstSatz: number; // z.B. 0.19
  spartePreise: Record<Sparte, SpartePreise>;
  mshRabatt: number; // % Rabatt bei Mehrsparten-Anschluss
}

// Kalkulation
export interface KalkulationsPosition {
  bezeichnung: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
  kategorie: 'Grundleistung' | 'Länge' | 'Zuschlag' | 'Admin' | 'BKZ' | 'Manuell';
  manuell?: boolean;
}

export interface Kalkulation {
  anfragenId: string;
  erstelltAm: string;
  erstelltVon: string;
  preiskonfigurationVersion: string;
  positionen: KalkulationsPosition[];
  zwischensumme: number;
  rabattProzent?: number;
  mwstBetrag: number;
  gesamtBrutto: number;
  istEinzelfall: boolean;
  einzelfallGruende: string[];
  kostenspanneMin?: number;
  kostenspanneMax?: number;
  annahmen: string[];
}

export interface Nutzer {
  id: string;
  name: string;
  email: string;
  rolle: 'sachbearbeiter' | 'admin';
  aktiv: boolean;
  erstelltAm: string;
  letzteAnmeldung?: string;
}
