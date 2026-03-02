# CLAUDE.md – Hausanschluss-Kalkulator

## Block 1 – Projektkontext

### Was ist der Hausanschluss-Kalkulator?
Webanwendung für Netzbetreiber (Demo: Netz-KA GmbH) zur Kalkulation und Verwaltung von Hausanschlusskosten für die Versorgungssparten Strom, Gas, Wasser und Mehrsparten (MSH).

**Problem, das es löst:** Sachbearbeiter können eingehende Anschlussanfragen strukturiert erfassen, technische Parameter ergänzen, Kosten nach konfigurierbaren Preistabellen berechnen und Angebote als PDF exportieren. Kunden können über ein öffentliches Portal selbst eine Anfrage stellen und eine erste Kostenschätzung erhalten.

### Rollen
| Rolle | Zugang | Aufgaben |
|---|---|---|
| Kunde | `/portal` (öffentlich) | Anfrage stellen, Kostenschätzung einsehen |
| Sachbearbeiter | `/sachbearbeiter` | Anfragen bearbeiten, Kalkulation, PDF-Export |
| Admin | `/admin` | Preisparameter, Nutzerverwaltung, Statistiken |

### Tech-Stack
- **Frontend:** React 19 + TypeScript, Vite 7, Tailwind CSS 4, Radix UI
- **Routing:** React Router v7
- **State:** React Context API (`src/context/AppContext.tsx`) + lokaler useState
- **PDF-Export:** jsPDF + html2canvas
- **Backend / DB:** keines – aktuell reiner Click-Dummy mit Mock-Daten (`src/data/mockAnfragen.ts`)
- **Aktueller Status:** Frontend-Demo / Prototyp, keine Persistenz

### Wichtige Dateien
| Datei | Zweck |
|---|---|
| `src/lib/calculator.ts` | Kernlogik Preisberechnung |
| `src/data/preiskonfiguration.ts` | Standardpreise je Sparte |
| `src/types/index.ts` | Alle TypeScript-Typen |
| `src/context/AppContext.tsx` | Globaler State (Anfragen, Preise, Nutzer) |
| `src/pages/Kundenportal.tsx` | Öffentliches Kundenportal (3-Stufen-Wizard) |

---

## Block 2 – Arbeitsregeln

- **Nie direkt in `main` pushen** – immer Feature-Branch erstellen
- **Kein Commit ohne `.gitignore`-Check** – sicherstellen dass keine Build-Artefakte oder Secrets enthalten sind
- **API-Keys / Secrets niemals in Git** – auch nicht in Kommentaren oder Beispieldaten
- **Vor größeren Änderungen: Plan zeigen, nicht einfach loslegen** – bei strukturellen Änderungen (neue Seiten, Architektur, neue Abhängigkeiten) erst Ansatz beschreiben und Freigabe abwarten
- **Bei Unsicherheit fragen, nicht erfinden** – lieber kurz nachfragen als falsche Annahmen im Code umsetzen

---

## Block 3 – Session Management

- **Session-Start:** `docs/backlog.md` und die letzte Einträge in `docs/session-log.md` lesen, um den aktuellen Stand zu kennen
- **Session-Ende:** Kurze Summary in `docs/session-log.md` schreiben (was wurde gemacht, was ist offen)

Format für Session-Log-Einträge:
```
## YYYY-MM-DD
**Erledigt:** ...
**Offen / Nächste Schritte:** ...
```
