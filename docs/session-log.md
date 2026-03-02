# Session-Log – Hausanschluss-Kalkulator

## 2026-03-02 (Session 2)
**Erledigt:**
- PDF-Fix: Spalten EINHEIT/EINZELPREIS überlappten → Proportionen angepasst (0.63 / 0.87)
- PDF-Fix: Tabellen-Kopfzeile zu klein → auf 9mm vergrößert, Text-Baseline auf y+6 zentriert
- Kundenportal: SVG-Infografik `TrassenDiagramm` eingebaut (zwischen Gebäudetyp und Längen-Slidern)
  - Zeigt Straße, Auto, Baum, Haus, Grundstücksgrenze (gestrichelt), unterirdische Leitungen mit Bemaßung
- Fachliche Diskussion: Anschlussart Änderung/Stilllegung → andere Pflichtfelder sinnvoll (Umsetzung offen)
- Nutzungs-Tracking für GitHub Pages besprochen (GA4, GoatCounter, Cloudflare) → zurückgestellt

**Offen / Nächste Schritte:**
- Anschlussart-spezifische Formularfelder im Portal (Änderung: Zählernummer + Art d. Änderung; Stilllegung: nur Zählernummer)
- MSH-Spartenwahl im Edit-Modus noch nicht abgedeckt
- Persistenz / Backend fehlt noch
- Einfaches Nutzungs-Tracking – in Überlegung

## 2026-03-02
**Erledigt:**
- Preisanpassung in Kalkulation: editierbare Mengen/Einzelpreise, manuelle Positionen (inkl. Abzugspositionen), Gesamtrabatt in %
- Typen erweitert: `KalkulationsPosition.manuell`, `Kalkulation.rabattProzent`, Kategorie `'Manuell'`
- Einheiten-Bug gefixt: `'Pau'` → `'Pauschale'`, `'St'` → `'Stück'`
- GitHub Repo erstellt: https://github.com/FloHo800101/Hausanschluss_Kalkulator
- GitHub Pages deployt (HashRouter + Vite base): https://floho800101.github.io/Hausanschluss_Kalkulator/
- GitHub Actions Workflow (`.github/workflows/deploy.yml`) – deploy bei jedem Push auf main
- TS-Buildfehler behoben (ungenutztes `Section`-Component in AnfrageDetail)

**Offen / Nächste Schritte:**
- MSH-Spartenwahl im Edit-Modus noch nicht abgedeckt
- Persistenz / Backend fehlt noch


## 2026-03-01
**Erledigt:**
- Kundenportal (`/portal`) mit 3-Stufen-Wizard implementiert (Kontaktdaten → Anschlussdetails → Kostenschätzung)
- Vereinfachte Kundenangaben, Standardwerte für Bodenklasse/Bauverfahren
- Kostenschätzung nutzt bestehende `berechneKalkulation()`-Logik; Einzelfall-Kostenspanne wird ausgewiesen
- Anfrage-Einreichung erstellt echte Anfrage im AppContext (in Sachbearbeiter-Inbox sichtbar)
- `addAnfrage()` in AppContext ergänzt
- Link zum Kundenportal auf Login-Seite (prominente Kachel)
- Logo-Button als Navigation zur Startseite (Layout + Portal)
- Login-Seite komplett überarbeitet: clean, nüchtern, Netzbetreiber-Stil mit slate-800 Header/Footer
- Edit-Modus für AnfrageDetail: alle Felder editierbar wenn Status „In Bearbeitung" (inkl. technische Felder Bodenklasse, Bauverfahren, Kernbohrung, Winterbau)
- CLAUDE.md, docs/backlog.md, docs/session-log.md angelegt

**Offen / Nächste Schritte:**
- MSH-Spartenwahl im Edit-Modus noch nicht abgedeckt
- Persistenz / Backend fehlt noch
