# Session-Log – Hausanschluss-Kalkulator

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
