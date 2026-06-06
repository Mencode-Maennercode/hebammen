# 📘 Einrichtung & Anleitung — Hebammen-Website (statisch + Google Sheet)

Diese Anleitung beschreibt das **fertige Produkt**: eine statische Website, die ihre
Inhalte (Team, Aktuelles, FAQ, Google-Bewertungen) **live** aus einem Google Sheet
und Google Drive holt — **ohne Server, ohne Node.js**, lauffähig auf jedem billigen
Hoster (IONOS, Strato, Netlify Drop …).

Möglich macht das ein kleines **Google-Apps-Script**, das bei Google läuft und alle
Inhalte als eine JSON-Datei ausliefert.

```
   Mitarbeiter pflegen           Du (einmalig)               Besucher
   ─────────────────────         ──────────────              ────────
   Google Sheet bearbeiten  ─►   Apps-Script-Backend   ─►    Statische Website
   Bild in Drive ablegen          (liest Sheet+Drive,         (1x fetch, zeigt
                                   holt Bewertungen)           alles aktuell an)
```

---

## ⚡ TEIL A — Einmalige Einrichtung (machst DU als Entwickler)

### Warum überhaupt?
Auf dem alten Stand hat die Website versucht, direkt mit einem API-Key auf die
Google-Sheets- und Drive-API zuzugreifen. Dieser Key war aber nur für die
**Places-API** (Bewertungen) freigeschaltet → Sheets/Drive lieferten **403** →
deshalb erschienen nur die Bewertungen, aber **kein Team, FAQ, Aktuelles, keine
Bilder**. Das Apps-Script löst genau dieses Problem.

### Schritt 1 — Apps-Script anlegen
1. Öffne dein Google Sheet (das mit den Tabs **Mitarbeiter**, **Aktuelles**, **FAQ**).
2. Menü **Erweiterungen → Apps Script**.
3. Lösche den vorhandenen Beispielcode im Editor.
4. Öffne im Projekt die Datei [`google-apps-script/Code.gs`](google-apps-script/Code.gs),
   kopiere den **gesamten Inhalt** und füge ihn in den Apps-Script-Editor ein.
5. Oben auf **💾 Speichern**.

### Schritt 2 — Skripteigenschaften setzen (Keys sicher hinterlegen)
1. Im Apps-Script-Editor links auf **⚙️ Projekteinstellungen**.
2. Runterscrollen zu **Skripteigenschaften → Skripteigenschaft hinzufügen**.
3. Lege diese Eigenschaften an:

   | Eigenschaft | Wert |
   |---|---|
   | `DRIVE_FOLDER_ID` | `14rO6u-bOI7R9q8BIXwWgzQ2e7W6U-T9M` *(ID deines Drive-Ober­ordners mit den Bild-Unterordnern)* |
   | `PLACES_API_KEY` | `AIzaSyCPV7s7suE41lZndidVY7xJ4z_wwS1h6tQ` *(dein Places-Key)* |
   | `PLACES_QUERY` | `Hebammen am Marienhospital Bonn` *(optional)* |
   | `CACHE_SECONDS` | `300` *(optional – wie schnell Änderungen erscheinen, in Sekunden)* |

4. **Speichern**.

> 💡 Die Bild-Unterordner im Drive müssen exakt so heißen:
> **`Hebammen Bilder`** (für Mitarbeiter), **`Aktuelles Bilder`**, **`FAQ Bilder`**
> — und im Ober­ordner mit der `DRIVE_FOLDER_ID` liegen.

### Schritt 3 — Drive-Ordner öffentlich lesbar machen (für die Bilder)
Damit Bilder ohne Login angezeigt werden:
1. Öffne in Google Drive den Ober­ordner (die Bilder-Sammlung).
2. **Rechtsklick → Freigeben → Allgemeiner Zugriff → „Jeder, der über den Link verfügt"**, Rolle **Betrachter**.
3. Fertig. (Das Script versucht zusätzlich automatisch, einzelne Bilder freizugeben.)

### Schritt 4 — Test im Editor (bevor wir deployen)
1. Im Apps-Script-Editor oben die Funktion **`testPayload`** auswählen.
2. Auf **▶ Ausführen** klicken.
3. Beim ersten Mal fragt Google nach **Berechtigungen** → **Zulassen**
   (Zugriff auf Tabelle, Drive, externe Aufrufe — das ist normal und nötig).
4. Unten im **Ausführungsprotokoll** sollte etwas stehen wie:
   `Team: 12 | Aktuelles: 3 | FAQ: 8 | Reviews: 10 | Rating: 5`
   → Wenn die Zahlen > 0 sind, funktioniert das Backend. 🎉
   Bei Fehlern wird `FEHLER: …` angezeigt (z. B. falscher Tab-Name).

### Schritt 5 — Als Web-App veröffentlichen
1. Oben rechts **Bereitstellen → Neue Bereitstellung**.
2. Zahnrad ⚙ neben „Typ auswählen" → **Web-App**.
3. Einstellungen:
   - **Beschreibung:** z. B. „Inhalts-Backend v1"
   - **Ausführen als:** **Ich** (deine Adresse)
   - **Zugriff:** **Jeder** *(wichtig — sonst kann die Website nicht zugreifen)*
4. **Bereitstellen** → ggf. erneut **Zugriff autorisieren**.
5. Kopiere die **Web-App-URL**. Sie sieht so aus:
   `https://script.google.com/macros/s/AKfyc.../exec`

> 🔁 **Wichtig bei späteren Code-Änderungen:** „Bereitstellung verwalten → Bearbeiten →
> Version: Neu → Bereitstellen". Nur dann wird die neue Version live. Die **URL bleibt gleich**.

### Schritt 6 — URL in die Website eintragen und neu bauen
1. Öffne [`.env.local`](.env.local) im Projekt.
2. Trage die URL ein:
   ```
   NEXT_PUBLIC_CONTENT_API_URL=https://script.google.com/macros/s/AKfyc.../exec
   ```
3. Statisch bauen:
   ```powershell
   npm run build
   ```
   Das erzeugt den Ordner **`out/`** — das ist die fertige statische Website.

### Schritt 7 — Hochladen
- **Netlify Drop:** ganzen Ordner **`out/`** auf https://app.netlify.com/drop ziehen.
- **IONOS / Strato / klassischer Webspace:** Inhalt von **`out/`** per FTP in das
  Web-Verzeichnis (z. B. `htdocs`) laden.

✅ **Fertig.** Die Seite zeigt jetzt Team, Aktuelles, FAQ, Bilder und Live-Bewertungen.

---

## 👩‍⚕️ TEIL B — Anleitung für die Mitarbeiter (kein Technik-Wissen nötig)

> Diese kurze Anleitung kannst du den Kundinnen geben.

### Texte ändern
1. Google Sheet öffnen.
2. Im passenden Tab (**Mitarbeiter**, **Aktuelles** oder **FAQ**) Zeilen
   bearbeiten, hinzufügen oder löschen.
3. **Speichern passiert automatisch.** Die Website aktualisiert sich von selbst
   (spätestens nach ~5 Minuten — einfach Seite neu laden).

### Ein Bild verwenden
1. Bild in den **richtigen Google-Drive-Ordner** hochladen:
   - Mitarbeiter-Fotos → Ordner **`Hebammen Bilder`**
   - Bilder für Aktuelles → Ordner **`Aktuelles Bilder`**
2. In der Spalte **Bildname** im Sheet den **Dateinamen** eintragen,
   z. B. `Rebekka Sanne.avif` (mit oder ohne Endung — beides geht).
3. Speichern. Fertig.

### Spalten im Sheet
- **Mitarbeiter:** `Vorname`, `Nachname`, `Bildname`, `Tätigkeiten`,
  `Einzugsgebiet`, `Telefonnummer`, `Email-Adresse`
  *(Die „Hebammenliste" auf der Seite zeigt alle mit ausgefüllten `Tätigkeiten`.)*
- **Aktuelles:** `Titel`, `Beschreibung`, `Datum`, `Kategorie`, `Bildname`
- **FAQ:** `Frage`, `Antwort`, `Kategorie`

---

## 🛠️ Fehlerbehebung

| Symptom | Ursache / Lösung |
|---|---|
| Team/FAQ/Aktuelles bleiben leer | URL in `.env.local` fehlt/falsch, oder Web-App-Zugriff ≠ „Jeder". Mit `testPayload` (Schritt 4) prüfen. |
| Bilder werden nicht angezeigt | Drive-Ober­ordner nicht öffentlich freigegeben (Teil A, Schritt 3), oder Unterordner-Name/`Bildname` stimmt nicht. |
| Bewertungen sind die alten „Anna M., Lisa K. …" | Das sind die **Fallback**-Bewertungen → das Backend lieferte keine. `PLACES_API_KEY`/`PLACES_QUERY` prüfen. |
| Änderung erscheint nicht sofort | Normal: Cache. Spätestens nach `CACHE_SECONDS` (Standard 5 Min). Zum Sofort-Test: URL mit `?nocache=1` im Browser öffnen. |
| Backend direkt testen | Web-App-URL einfach im Browser öffnen → es muss JSON mit `team`, `aktuelles`, `faq`, `reviews` erscheinen. |

---

## 🔁 Wiederverwendung bei weiteren Kunden
Pro Kunde: eigenes Sheet + eigenes Apps-Script (Code identisch) + eigene
Skripteigenschaften (andere `DRIVE_FOLDER_ID`, ggf. anderer `PLACES_QUERY`).
Dann nur `NEXT_PUBLIC_CONTENT_API_URL` tauschen und neu bauen.
