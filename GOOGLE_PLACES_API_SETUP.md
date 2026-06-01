# Google Places API Setup für echte Google Bewertungen

## Voraussetzungen
- Google Cloud Projekt für den Kunden (bereits erstellt)
- Zugriff auf Google Business Profile des Kunden

## Schritte zur Einrichtung

### 1. Google Places API aktivieren

1. **Google Cloud Console öffnen:**
   - https://console.cloud.google.com
   - Zum Projekt des Kunden wechseln

2. **Places API aktivieren:**
   - Navigation: APIs & Services → Library
   - Suchen nach: "Places API"
   - Klicken auf "Activate"

3. **API-Key erstellen:**
   - Navigation: APIs & Services → Credentials
   - "Create Credentials" → "API Key"
   - API-Key erstellen

4. **API-Key konfigurieren:**
   - Auf den API-Key klicken
   - Unter "Application restrictions":
     - "IP addresses" wählen
     - IP-Adresse des Servers hinzufügen (oder "None" für Entwicklung)
   - Unter "API restrictions":
     - "Restrict key" wählen
     - Nur "Places API" auswählen
   - Speichern

### 2. Google Place ID finden

1. **Google Maps öffnen:**
   - https://www.google.com/maps
   - Nach dem Unternehmen suchen: "Hebammen am Marienhospital Bonn"

2. **Place ID aus URL kopieren:**
   - In der URL nach `!1s` suchen
   - Die Zeichenkette bis zum nächsten `!` ist die Place ID
   - Beispiel: `https://www.google.com/maps/place/Hebammen/@50.7264,7.1044,17z/data=!3m1!4b1!4m6!3m5!1sChIJ...`
   - Place ID: `ChIJ...`

3. **Alternativ mit Place ID Finder:**
   - https://developers.google.com/maps/documentation/places/web-service/place-id
   - Adresse eingeben und Place ID erhalten

### 3. Umgebungsvariablen konfigurieren

In der Datei `.env.local` folgende Werte eintragen:

```env
GOOGLE_PLACES_API_KEY=IHR_API_KEY_HIER
GOOGLE_PLACE_ID=IHR_PLACE_ID_HIER
```

### 4. Server neu starten

```bash
npm run dev
```

## Alternative: Ohne API-Key (Platzhalter-Bewertungen)

Wenn Sie noch keinen API-Key haben, zeigt die Website automatisch die Platzhalter-Bewertungen an. Die API ist so konfiguriert, dass sie bei Fehlern auf die Platzhalter zurückfällt.

## Testen

1. Nach dem Konfigurieren die Website öffnen
2. Im Bereich "Bewertungen" sollten jetzt echte Google Bewertungen erscheinen
3. Die Gesamtbewertung und Anzahl der Bewertungen sollten automatisch aktualisiert werden

## Wichtige Hinweise

- **API-Key sicher aufbewahren** - nicht in den Code committen
- **API-Key beschränken** - nur auf die Domain/IP und Places API
- **Kosten:** Places API hat ein kostenloses Kontingent (200 USD/Monat)
- **Rate Limits:** Bei vielen Anfragen können Limits erreicht werden
- **Aktualisierung:** Bewertungen werden bei jedem Seitenabruf neu geladen

## Fehlerbehebung

### "Google Places API Key not configured"
- Prüfen Sie, ob die Umgebungsvariablen in `.env.local` korrekt gesetzt sind
- Server neu starten nach Änderungen

### "Failed to fetch Google reviews"
- Prüfen Sie, ob der API-Key korrekt ist
- Prüfen Sie, ob die Places API aktiviert ist
- Prüfen Sie, ob die Place ID korrekt ist

### Keine Bewertungen angezeigt
- Prüfen Sie, ob das Unternehmen Bewertungen auf Google hat
- Prüfen Sie, ob die Place ID korrekt ist
- Prüfen Sie die Browser-Konsole auf Fehler

## Unterstützung

Bei Problemen mit der Google Places API:
- Google Cloud Console: https://console.cloud.google.com
- Places API Dokumentation: https://developers.google.com/maps/documentation/places/web-service/overview
