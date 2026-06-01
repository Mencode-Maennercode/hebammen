# 🔥 Schritt-für-Schritt: Super-einfache Bildverwaltung

## 📋 Was du tun musst (nur 2 Schritte!)

---

## 1️⃣ Google Drive Folder ID eintragen

### Schritt 1: Google Drive öffnen
1. Gehe zu [drive.google.com](https://drive.google.com)
2. Klicke auf deinen **Hauptordner** (der mit "Hebammen", "Aktuelles Bilder" etc.)

### Schritt 2: URL kopieren
Die URL in der Adresszeile sieht so aus:
```
https://drive.google.com/drive/folders/1ABC123XYZ456UVW?usp=sharing
```

### Schritt 3: ID extrahieren
Die ID ist der Teil nach `/folders/` und vor `?`:
```
1ABC123XYZ456UVW
```

### Schritt 4: In .env.local eintragen
Öffne die Datei `.env.local` und ersetze:
```env
GOOGLE_DRIVE_FOLDER_ID=DEINE_DRIVE_ORDNER_ID_HIER
```
Mit deiner ID:
```env
GOOGLE_DRIVE_FOLDER_ID=1ABC123XYZ456UVW
```

---

## 2️⃣ Google Sheet anpassen

### Schritt 1: Spaltenname ändern
Im Google Sheet im Tab "Mitarbeiter":
- Ändere Spalte B von **"Bild"** zu **"Bildname"**

### Schritt 2: Nur noch Dateinamen eintragen
Statt langer Links nur noch:
```
Anna Schmidt.jpg
Maria Meier.png
Julia Bauer.webp
```

---

## 🎯 FERTIG! So einfach ist es jetzt:

### Für Mitarbeiter:
1. **Foto hochladen** in Google Drive → `Hebammen → Hebammen Bilder`
2. **Dateiname eintragen** im Google Sheet → z.B. `Anna Schmidt.jpg`
3. **FERTIG!** 🎉

### Was die API automatisch macht:
- ✅ **Erkennt jedes Bildformat** (.jpg, .png, .webp, .avif, .gif, .bmp, .tiff, .svg, etc.)
- ✅ **Sucht im richtigen Ordner** (Mitarbeiter → Hebammen Bilder)
- ✅ **Ignoriert Groß/Kleinschreibung**
- ✅ **Findet Bilder auch ohne Endung**
- ✅ **Generiert automatisch den Anzeigelink**

---

## 💡 Beispiele (alles funktioniert!)

### Im Google Sheet:
| Vorname | Nachname | Bildname | Tätigkeiten |
|---------|----------|----------|------------|
| Anna | Schmidt | `Anna Schmidt` | Hebamme |
| Maria | Meier | `Maria Meier.jpg` | Hebamme |
| Julia | Bauer | `Julia Bauer.WEBP` | Hebamme |
| Sarah | Klein | `sarah klein.png` | Hebamme |

### In Google Drive:
```
📁 Hebammen Bilder/
├── 📄 Anna Schmidt.jpg
├── 📄 Maria Meier.png  
├── 📄 Julia Bauer.WEBP
├── 📄 sarah klein.png
└── 📄 beliebes_format.tiff
```

**Alles wird automatisch gefunden und angezeigt!** 🚀

---

## 🚨 Testen ob alles funktioniert

### Quick-Test:
1. **Test-Bild hochladen**: `Test_Bild.jpg` in `Hebammen Bilder`
2. **Im Sheet eintragen**: `Test_Bild.jpg` in Spalte "Bildname"
3. **Website neu laden**
4. **Ergebnis**: Bild sollte erscheinen!

### Funktioniert nicht?
1. **Google Drive Folder ID** prüfen
2. **Spaltenname** = "Bildname"?
3. **Bild im richtigen Ordner**?

---

## 🎉 Das war's!

**Dein System ist jetzt maximal einfach:**
- 🔧 **2 Schritte für dich** (Setup)
- 📸 **1 Schritt für Mitarbeiter** (Foto hochladen + Name eintragen)
- 🎯 **0 technische Kenntnisse nötig**
- 🚀 **100% automatisch**

**Mitarbeiter müssen nur noch den Dateinamen kennen - egal welches Format!** 🎊
