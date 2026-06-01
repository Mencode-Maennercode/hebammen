# Anleitung für Mitarbeiter: Website pflegen

## 🎯 Übersicht
Sie können jetzt ganz einfach Ihre Mitarbeiterdaten und Fotos auf der Website aktualisieren - alles über Google Sheets!

---

## 📝 Schritt 1: Google Sheets bearbeiten

### Zugangsdaten
- **Link:** [Ihr Google Sheet](https://docs.google.com/spreadsheets/d/1FGM3hz2oGA4TY911X-sXhv-R2OHdHjhEmSZA7v8gnb4)
- **Tab:** "Mitarbeiter"

### Spalten erklärt
| Spalte | Was gehört hier rein? | Beispiel |
|--------|----------------------|----------|
| **Vorname** | Ihr Vorname | Anna |
| **Nachname** | Ihr Nachname | Schmidt |
| **Bild** | **Nur der Dateiname** (z.B. "Anna Schmidt.avif") | Anna Schmidt.avif |
| **Tätigkeiten** | Ihre Position | Hebamme |
| **Einzugsgebiet** | Ihr Arbeitsbereich (optional) | Bonn, Rhein-Sieg |
| **Telefonnummer** | Ihre Telefonnummer (optional) | 0228 123456 |
| **Email-Adresse** | Ihre E-Mail (optional) | anna.schmidt@email.de |

---

## 📸 Schritt 2: Foto hochladen (wenn neues Foto needed)

### Upload-Link
Gehen Sie zu: `http://localhost:3000/upload`

### So einfach geht's:
1. **Namen eingeben** - Vorname und Nachname genau wie im Google Sheet
2. **Foto auswählen** - Beliebiges Bildformat (JPG, PNG, etc.)
3. **Hochladen klicken** - Das System optimiert das Bild automatisch
4. **Dateiname kopieren** - Sie erhalten den genauen Dateinamen
5. **Im Google Sheet einfügen** - Fügen Sie den Dateinamen in die "Bild"-Spalte ein

### Was passiert automatisch?
- ✅ Bild wird auf optimale Größe gebracht (400x600px)
- ✅ Bild wird als AVIF gespeichert (kleinste Dateigröße)
- ✅ Bild wird für Web optimiert
- ✅ Dateiname wird automatisch generiert

---

## 🔄 Schritt 3: Änderungen aktivieren

Nachdem Sie etwas im Google Sheet ändern:
1. **Speichern** Sie das Google Sheet (STRG+S)
2. **Warten** Sie 1-2 Minuten
3. **Website neu laden** - Die Änderungen erscheinen automatisch!

---

## 🚀 Mögliche Aktionen

### ✅ Mitarbeiter hinzufügen
```
1. Neue Zeile im Google Sheet erstellen
2. Alle Daten ausfüllen
3. Foto hochladen über /upload
4. Dateiname in Bild-Spalte eintragen
```

### ✅ Mitarbeiter bearbeiten
```
1. Entsprechende Zeile im Google Sheet finden
2. Daten ändern (Name, Position, etc.)
3. Bei Bedarf neues Foto hochladen
4. Google Sheet speichern
```

### ✅ Mitarbeiter entfernen
```
1. Zeile im Google Sheet löschen
2. Google Sheet speichern
3. Fertig! (Foto kann bleiben, stört nicht)
```

---

## 💡 Tipps & Tricks

### Foto-Qualität
- **Bestes Format:** Portrait-Fotos mit guter Beleuchtung
- **Hintergrund:** Am besten ein neutraler Hintergrund
- **Größe:** Keine Sorge, das System skaliert automatisch

### Dateinamen
- **Muster:** "Vorname Nachname.avif"
- **Beispiele:** 
  - ✅ "Anna Schmidt.avif"
  - ✅ "Maria Meier-Müller.avif"
  - ❌ "IMG_1234.jpg" (nicht verwenden)

### Häufige Fragen
**Q: Mein Foto wird nicht angezeigt?**  
A: Prüfen Sie, ob der Dateiname exakt mit dem im Google Sheet übereinstimmt.

**Q: Wie lange dauern Änderungen?**  
A: Meist unter 2 Minuten. Manchmal muss die Website neu geladen werden.

**Q: Kann ich mehrere Fotos hochladen?**  
A: Pro Mitarbeiter immer nur das aktuellste Foto. Alte Fotos werden überschrieben.

---

## 🆘 Hilfe bei Problemen

### Kontakt bei technischen Fragen
- **Website Administrator:** [Ihre Kontaktdaten]
- **Telefon:** [Ihre Telefonnummer]
- **E-Mail:** [Ihre E-Mail]

### Notfall-Lösung
Falls etwas nicht funktioniert:
1. **Website neustarten:** Server neu starten
2. **Google Sheet prüfen:** Sind alle Daten korrekt?
3. **Dateiname prüfen:** Exakte Schreibweise beachten

---

## 📱 Mobile Nutzung

Das Ganze funktioniert auch auf dem Smartphone:
- Google Sheets App installieren
- Fotos direkt vom Handy hochladen
- Änderungen überall vornehmen

---

**Viel Erfolg! Ihre Website ist jetzt so einfach zu pflegen wie möglich.** 🎉
