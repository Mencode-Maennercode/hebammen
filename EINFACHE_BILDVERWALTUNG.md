# 🎯 Super-einfache Bildverwaltung!

## 🚀 Die neue Methode: Nur noch Bildnamen eingeben!

**Keine Links mehr kopieren!** Nur noch den Dateinamen eintragen - der Rest passiert automatisch.

---

## 📁 Wie es funktioniert

### Automatische Ordner-Zuordnung:
- **Sheet "Mitarbeiter"** → sucht automatisch in `Hebammen Bilder`
- **Sheet "Aktuelles"** → sucht automatisch in `Aktuelles Bilder`  
- **Sheet "FAQ"** → sucht automatisch in `FAQ Bilder`
- **Sheet "Tipps & Tricks"** → sucht automatisch in `Tipps & Tricks Bilder`

### Format-Unterstützung:
Die API sucht automatisch nach allen gängigen Formaten:
- ✅ `Anna Schmidt.jpg`
- ✅ `Anna Schmidt.jpeg` 
- ✅ `Anna Schmidt.png`
- ✅ `Anna Schmidt.webp`
- ✅ `Anna Schmidt.avif`
- ✅ `Anna Schmidt.gif`

---

## 📝 Schritt 1: Google Sheet vorbereiten

### Spalten-Struktur:
| Vorname | Nachname | **Bildname** | Tätigkeiten | Einzugsgebiet | Telefonnummer | Email-Adresse |
|---------|----------|--------------|-------------|---------------|---------------|---------------|

### Wichtig:
- **Spaltenname**: `Bildname` (nicht mehr "Bild")
- **Inhalt**: Nur der Dateiname, z.B. `Anna Schmidt.jpg`

---

## 📸 Schritt 2: Bilder in Google Drive hochladen

### Für Mitarbeiter:
1. **Google Drive öffnen** → `Hebammen → Hebammen Bilder`
2. **Foto hochladen** mit Dateiname: `Vorname Nachname.jpg`
3. **Fertig!** (kein Link kopieren nötig)

### Für Aktuelles:
1. **Google Drive** → `Hebammen → Aktuelles Bilder`
2. **Bild hochladen** mit beliebigem Namen
3. **Nur den Dateinamen** im Google Sheet eintragen

---

## 🎯 Beispiele für das Google Sheet

### Mitarbeiter-Tabelle:
| Vorname | Nachname | Bildname | Tätigkeiten |
|---------|----------|----------|------------|
| Anna | Schmidt | `Anna Schmidt.jpg` | Hebamme |
| Maria | Meier | `Maria Meier.png` | Hebamme |
| Julia | Bauer | `Julia Bauer.avif` | Namenspartnerin |

### Aktuelles-Tabelle:
| Titel | Bildname | Datum |
|-------|----------|-------|
| Neuer Kurs | `Kurs_2024.jpg` | 01.06.2024 |
| Team-Event | `Team_Event.png` | 15.05.2024 |

---

## 🔧 Technischer Hintergrund (für Admins)

### Was passiert automatisch:
1. **Sheet wird gelesen** → Bildname extrahiert
2. **Ordner wird zugeordnet** → basierend auf Sheet-Namen
3. **Bild wird gesucht** → in allen Formaten (.jpg, .png, etc.)
4. **Link wird generiert** → direkter Anzeigelink
5. **Bild wird angezeigt** → auf der Website

### API-Logik:
```javascript
// Beispiel: "Anna Schmidt.jpg" im Sheet "Mitarbeiter"
1. Sheet: "Mitarbeiter" → Ordner: "Hebammen Bilder"
2. Suche: "Anna Schmidt.jpg" in "Hebammen Bilder"
3. Gefunden: https://drive.google.com/uc?export=view&id=ABC123
4. Ergebnis: Bild wird auf Website angezeigt
```

---

## 💡 Pro-Tips für Mitarbeiter

### Dateibenennung:
- ✅ `Vorname Nachname.jpg` (z.B. `Anna Schmidt.jpg`)
- ✅ `Vorname Nachname_Kurs.jpg` (z.B. `Anna Schmidt_Kurs.jpg`)
- ❌ `IMG_1234.jpg` (nicht zuordenbar)
- ❌ `Foto von mir.jpg` (nicht spezifisch)

### Mobile App:
1. **Google Drive App** → richtigen Ordner
2. **Upload** → Foto auswählen
3. **Umbenennen** → `Vorname Nachname.jpg`
4. **Fertig!**

---

## 🚨 Fehlerbehebung

### Bild wird nicht angezeigt?
1. **Dateiname prüfen**: Steht er exakt so im Google Sheet?
2. **Ordner prüfen**: Ist das Bild im richtigen Ordner?
3. **Format prüfen**: Eines der unterstützten Formate?

### API-Fehler?
1. **Google Drive Folder ID** prüfen (in .env.local)
2. **API-Rechte** prüfen (Drive API aktiviert?)
3. **Ordnerstruktur** prüfen (existieren die Unterordner?)

---

## 🎉 Vorteile der neuen Methode

### Für Mitarbeiter:
- ✅ **Einfacher**: Nur Dateiname eingeben
- ✅ **Sicherer**: Keine Links kopieren
- ✅ **Flexibler**: Jedes Bildformat funktioniert
- ✅ **Mobile**: Per App super einfach

### Für Admins:
- ✅ **Automatisch**: Kein manueller Link-Import
- ✅ **Skalierbar**: Für beliebig viele Kunden
- ✅ **Strukturiert**: Klare Ordner-Zuordnung
- ✅ **Fehler-resistent**: Automatische Fallbacks

---

## 📞 Quick-Check für Admins

### Setup prüfen:
1. **Google Drive Folder ID** in `.env.local` eingetragen?
2. **Ordnerstruktur** korrekt (`Hebammen Bilder`, etc.)?
3. **API-Rechte** für Drive aktiviert?
4. **Spaltenname** im Sheet: `Bildname`?

### Testen:
1. **Test-Bild** hochladen: `Test_Bild.jpg`
2. **Im Sheet eintragen**: `Test_Bild.jpg`
3. **API aufrufen**: `/api/team`
4. **Ergebnis prüfen**: Bild-Link vorhanden?

---

## 🚀 Fertig!

**Dein System ist jetzt maximal einfach und sicher!**

Mitarbeiter müssen nur noch:
1. **Foto hochladen** mit richtigem Namen
2. **Dateiname eintragen** im Google Sheet

**Alles andere passiert automatisch!** 🎊
