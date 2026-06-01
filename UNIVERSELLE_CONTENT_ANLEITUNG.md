# 🚀 Universelle Content-Verwaltung für ALLE Inhalte!

## 🎯 Das Prinzip: EINE API für ALLES!

**Egal ob Mitarbeiter, Aktuelles, FAQ oder Tipps & Tricks - alles funktioniert gleich!**

---

## 📁 Automatische Ordner-Zuordnung

| Sheet-Name | Google Drive Ordner | API-Endpunkt |
|-------------|-------------------|---------------|
| **Mitarbeiter** | `Hebammen Bilder` | `/api/team?sheet=Mitarbeiter` |
| **Aktuelles** | `Aktuelles Bilder` | `/api/content?sheet=Aktuelles` |
| **FAQ** | `FAQ Bilder` | `/api/content?sheet=FAQ` |
| **Tipps & Tricks** | `Tipps & Tricks Bilder` | `/api/content?sheet=Tipps & Tricks` |

---

## 🎨 Beispiele für jeden Content-Typ

### 👥 Mitarbeiter
**Google Sheet Spalten:**
| Vorname | Nachname | Bildname | Tätigkeiten | Telefonnummer |
|---------|----------|----------|-------------|---------------|
| Anna | Schmidt | `Anna Schmidt` | Hebamme | 0228 123456 |

**Google Drive:** `Hebammen → Hebammen Bilder → Anna Schmidt.jpg`

---

### 📰 Aktuelles
**Google Sheet Spalten:**
| Titel | Bildname | Datum | Beschreibung |
|-------|----------|-------|--------------|
| Neuer Kurs | `Kurs_2024` | 01.06.2024 | Schwangerschaftsyoga |

**Google Drive:** `Hebammen → Aktuelles Bilder → Kurs_2024.jpg`

---

### ❓ FAQ
**Google Sheet Spalten:**
| Frage | Antwort | Bildname | Kategorie |
|-------|---------|----------|------------|
| Wann beginnen Geburtsvorbereitung? | Ab der 20. SSW... | `Geburtsvorbereitung` | Vorbereitung |

**Google Drive:** `Hebammen → FAQ Bilder → Geburtsvorbereitung.png`

---

### 💡 Tipps & Tricks
**Google Sheet Spalten:**
| Titel | Tipp | Bildname | Kategorie |
|-------|------|----------|------------|
| Stillen leicht gemacht | Beginnen Sie... | `Stillen_Tipp` | Stillen |

**Google Drive:** `Hebammen → Tipps & Tricks Bilder → Stillen_Tipp.jpg`

---

## 🔥 API-Aufrufe (so einfach!)

### Mitarbeiter laden:
```javascript
fetch('/api/team?sheet=Mitarbeiter')
```

### Aktuelles laden:
```javascript
fetch('/api/content?sheet=Aktuelles')
```

### FAQ laden:
```javascript
fetch('/api/content?sheet=FAQ')
```

### Tipps & Tricks laden:
```javascript
fetch('/api/content?sheet=Tipps & Tricks')
```

---

## 🎯 Die automatische Magie

### Was die API automatisch macht:
1. **Sheet erkennen** → `Mitarbeiter`, `Aktuelles`, `FAQ`, `Tipps & Tricks`
2. **Ordner zuordnen** → `Hebammen Bilder`, `Aktuelles Bilder`, etc.
3. **Spalten erkennen** → `Titel`, `Bildname`, `Beschreibung`, etc.
4. **Bilder suchen** → in allen Formaten (.jpg, .png, .webp, etc.)
5. **Links generieren** → direkte Anzeigelinks

### Universelle Feld-Unterstützung:
- ✅ **Titel/Title** → Automatisch erkannt
- ✅ **Bildname/Bild/Image** → Automatisch gesucht
- ✅ **Beschreibung/Description/Text** → Automatisch zugeordnet
- ✅ **Datum/Date** → Automatisch formatiert
- ✅ **Kategorie/Category** → Automatisch gruppiert

---

## 📱 Für Mitarbeiter: Immer gleich einfach!

### Egal welchen Content:
1. **Google Drive öffnen** → Richtiger Ordner
2. **Bild hochladen** → Mit passendem Namen
3. **Google Sheet öffnen** → Richtiger Tab
4. **Nur Bildnamen eintragen** → FERTIG!

### Beispiel Workflow:
```
1. Mitarbeiter will neuen Tipp hinzufügen
2. Google Drive → Hebammen → Tipps & Tricks Bilder
3. Bild hochladen: "Schlafen_in_der_Schwangerschaft.jpg"
4. Google Sheet → Tab "Tipps & Tricks"
5. Neue Zeile: Titel="Schlafen", Bildname="Schlafen_in_der_Schwangerschaft"
6. FERTIG! Bild erscheint automatisch auf der Website
```

---

## 🛠️ Integration in der Website

### React Component Beispiel:
```jsx
// Universeller Content Loader
function ContentLoader({ contentType }) {
  const [content, setContent] = useState([]);
  
  useEffect(() => {
    async function loadContent() {
      const response = await fetch(`/api/content?sheet=${contentType}`);
      const data = await response.json();
      setContent(data.data);
    }
    loadContent();
  }, [contentType]);
  
  return (
    <div>
      {content.map((item, index) => (
        <div key={index}>
          <img src={item.image} alt={item.title} />
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}

// Verwendung:
<ContentLoader contentType="Aktuelles" />
<ContentLoader contentType="FAQ" />
<ContentLoader contentType="Tipps & Tricks" />
```

---

## 💡 Pro-Tips für maximale Flexibilität

### 1. Flexible Spaltennamen:
Die API erkennt automatisch:
- `Titel` oder `title`
- `Bildname`, `Bild` oder `image`
- `Beschreibung`, `description` oder `text`
- `Datum` oder `date`

### 2. Flexible Sheet-Namen:
- `Tipps & Tricks` → `Tipps & Tricks Bilder`
- `Tipps` → `Tipps & Tricks Bilder`
- `Tricks` → `Tipps & Tricks Bilder`

### 3. Flexible Bildformate:
- `Schlafen.jpg` ✅
- `Schlafen.png` ✅
- `Schlafen` (ohne Endung) ✅
- `schlafen.JPG` (Groß/Kleinschreibung egal) ✅

---

## 🚨 Fehlerbehebung

### Content wird nicht angezeigt?
1. **Sheet-Name prüfen**: Exakt wie im Google Sheet?
2. **Ordner existiert**: `Hebammen → [richtiger Ordner]`?
3. **Bildname korrekt**: Exakt wie im Sheet?

### API-Endpunkt nicht gefunden?
1. **URL prüfen**: `/api/content?sheet=Name`
2. **Sheet-Name kodieren**: `Tipps%20&%20Tricks`
3. **Groß/Kleinschreibung**: Wie im Google Sheet

---

## 🎉 Das war's schon!

### Dein System ist jetzt:
- 🔧 **Universell**: EINE API für ALLE Inhalte
- 📱 **Einfach**: Immer gleicher Workflow
- 🚀 **Automatisch**: Keine manuellen Links mehr
- 🎯 **Skalierbar**: Für unbegrenzt viele Content-Typen

### Für Mitarbeiter:
- **Egal ob Mitarbeiterfoto, News, FAQ oder Tipp**
- **Immer der gleiche einfache Prozess**
- **Keine technischen Kenntnisse nötig**

**Das ist die einfachste und leistungsstärkste Content-Verwaltung möglich!** 🎊

---

## 📞 Quick-Reference

### API-Endpunkte:
- Mitarbeiter: `/api/team?sheet=Mitarbeiter`
- Aktuelles: `/api/content?sheet=Aktuelles`
- FAQ: `/api/content?sheet=FAQ`
- Tipps: `/api/content?sheet=Tipps & Tricks`

### Ordner-Struktur:
```
📁 Hauptordner
├── 📁 Hebammen
│   ├── 📁 Hebammen Bilder ← Mitarbeiter
│   ├── 📁 Aktuelles Bilder ← News
│   ├── 📁 FAQ Bilder ← FAQ
│   └── 📁 Tipps & Tricks Bilder ← Tipps
```

**Alles funktioniert automatisch!** 🚀
