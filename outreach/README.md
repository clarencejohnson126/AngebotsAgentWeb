# Outreach Pipeline

Automatisierte Lead-Anreicherung und E-Mail-Generierung für AngebotsAgent.

## Ordnerstruktur

```
/outreach/
├── input/               # Eingabe-Spreadsheet (XLSX oder CSV)
├── enriched/            # Angereicherte Lead-Daten
│   ├── leads_enriched.csv
│   └── {company}_{name}.json
├── emails/              # Generierte E-Mail-Entwürfe
│   └── {company}_{name}.txt
├── logs/                # Verarbeitungsprotokolle
│   └── processing.log
├── process-leads.ts     # Hauptskript
└── README.md
```

## Ausführung

### Voraussetzungen
- Node.js 18+
- Das Projekt muss bereits `npm install` ausgeführt haben

### Pipeline starten

```bash
# Vom Projekt-Root
npx tsx outreach/process-leads.ts
```

### Neue Leads verarbeiten

1. Spreadsheet (XLSX oder CSV) in `/outreach/input/` legen
2. Pipeline ausführen: `npx tsx outreach/process-leads.ts`
3. Ergebnisse prüfen:
   - `/outreach/enriched/leads_enriched.csv` - Alle Leads mit erkannten Feldern
   - `/outreach/emails/` - E-Mail-Entwürfe zum Kopieren
   - `/outreach/logs/processing.log` - Status und Fehler

## Ausgabe

### Enriched CSV Spalten

| Spalte | Beschreibung |
|--------|--------------|
| original_fullName | Name aus Spreadsheet |
| original_company | Firma aus Spreadsheet |
| original_email | E-Mail aus Spreadsheet |
| original_linkedIn | LinkedIn-URL |
| detected_first_name | Erkannter Vorname |
| detected_last_name | Erkannter Nachname |
| detected_company | Erkannte Firma |
| detected_trade | Erkanntes Gewerk |
| detected_role | Erkannte Rolle |
| website | Firmen-Website |
| email | E-Mail-Adresse |
| phone | Telefon (wenn gefunden) |
| source_urls | Quell-URLs |
| personalization_hook | Personalisierungselement |
| confidence | Vertrauenswert (0-1) |
| status | READY / MISSING_EMAIL / LOW_CONFIDENCE |

### E-Mail-Dateiformat

Jede `.txt`-Datei enthält:
```
Betreff: [Betreffzeile]

An: [E-Mail-Adresse oder {{email_not_found}}]

---

[E-Mail-Text]
```

## E-Mail-Varianten

Das System generiert 12 verschiedene Varianten:
- 6 mit "Du"-Anrede
- 6 mit "Sie"-Anrede
- Wechsel zwischen "ich" (Clarence) und "wir" (kleines Team)
- 6 verschiedene Betreffzeilen
- Mehrere CTA-Varianten

Die Variante wird deterministisch pro Lead ausgewählt (basierend auf Hash der E-Mail).

## Gewerk-Erkennung

Automatische Erkennung aus Firmenname, Titel und LinkedIn-Bio:
- Elektro
- SHK (Sanitär/Heizung/Klima)
- Trockenbau
- Dach/Abdichtung
- Maler
- Schreinerei/Tischlerei
- Metallbau
- Bodenbelag/Estrich
- Fassade/WDVS
- Gerüstbau
- Kälte/Klima
- GaLa-Bau
- Rohbau/Maurer
- Sonnenschutz
- Messebau/Ladenbau
- Energie/Solar
- Fallback: Bau/Handwerk

## Status-Werte

| Status | Bedeutung |
|--------|-----------|
| READY | Alle wichtigen Daten vorhanden |
| MISSING_EMAIL | Keine E-Mail gefunden ({{email_not_found}} im Entwurf) |
| LOW_CONFIDENCE | Wichtige Felder fehlen |

## Hinweise

- **Keine erfundenen Daten**: Wenn E-Mail nicht vorhanden, wird `{{email_not_found}}` verwendet
- **Deterministisch**: Gleiche Eingabe = gleiche Ausgabe (für Wiederholbarkeit)
- **Personalisierung**: Basiert auf echten Daten (Ort, Gewerk, Firma)
- **iPhone-Stil**: Kurze, direkte E-Mails (4-7 Zeilen)
