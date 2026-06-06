/**
 * ============================================================================
 *  HEBAMMEN-WEBSITE – Inhalts-Backend (Google Apps Script)
 * ============================================================================
 *
 *  Dieses Script liest das Google Sheet (Tabs: Mitarbeiter, Aktuelles, FAQ),
 *  löst Bildnamen in zuverlässige Bild-URLs aus Google Drive auf und holt die
 *  Live-Google-Bewertungen. Alles wird als EIN JSON ausgeliefert, das die
 *  statische Website per fetch() abruft.
 *
 *  Vorteile:
 *    - Kein API-Key im Browser sichtbar (Places-Key liegt sicher hier).
 *    - Bilder funktionieren zuverlässig (lh3.googleusercontent.com).
 *    - Funktioniert auf JEDEM statischen Hosting (Netlify, IONOS, Strato …).
 *
 *  >>> EINRICHTUNG: siehe ANLEITUNG_APPS_SCRIPT.md im Projekt <<<
 * ============================================================================
 */

// ============================================================================
//  DEPLOY-BUTTON — Custom Menu im Google Sheet
// ============================================================================

/**
 * Wird beim Öffnen des Sheets automatisch aufgerufen.
 * Erstellt das Menü „🚀 Website" in der Menüleiste.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚀 Website')
    .addItem('Jetzt deployen (Build starten)', 'triggerDeploy')
    .addToUi();
}

/**
 * Löst einen GitHub Actions Workflow-Run aus.
 *
 * Voraussetzung: In den Script-Eigenschaften muss gesetzt sein:
 *   GITHUB_TOKEN  →  Personal Access Token mit "workflow"-Berechtigung
 *                    (GitHub → Settings → Developer settings → Personal access tokens)
 */
function triggerDeploy() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('GITHUB_TOKEN');

  if (!token) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Kein GitHub-Token',
      'Bitte trage in den Script-Eigenschaften einen "GITHUB_TOKEN" ein.\n\n' +
      'Apps Script → Projekteinstellungen → Skripteigenschaften',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  var url = 'https://api.github.com/repos/Mencode-Maennercode/hebammen/actions/workflows/deploy.yml/dispatches';

  var options = {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ ref: 'master' }),
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();

    if (code === 204) {
      SpreadsheetApp.getUi().alert(
        '✅ Deploy gestartet',
        'Der Build läuft jetzt auf GitHub Actions.\n\nDie Website wird in ~2–3 Minuten aktualisiert.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '❌ Fehler beim Deploy',
        'GitHub antwortete mit Code ' + code + ':\n' + response.getContentText(),
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (err) {
    SpreadsheetApp.getUi().alert(
      '❌ Netzwerkfehler',
      String(err),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

// ----------------------------------------------------------------------------
//  KONFIGURATION
//  Diese Werte werden aus den "Script-Eigenschaften" gelesen (Projekt­einstel-
//  lungen → Skripteigenschaften). Die Defaults dienen nur als Fallback.
// ----------------------------------------------------------------------------
function CONFIG_() {
  const props = PropertiesService.getScriptProperties();
  return {
    // Ober-Ordner in Google Drive, der die Bild-Unterordner enthält.
    DRIVE_FOLDER_ID: props.getProperty('DRIVE_FOLDER_ID') || '14rO6u-bOI7R9q8BIXwWgzQ2e7W6U-T9M',
    // Google-Places-API-Key (für Bewertungen). Wenn leer -> keine Live-Reviews.
    PLACES_API_KEY: props.getProperty('PLACES_API_KEY') || '',
    // Suchbegriff, mit dem der Google-Eintrag gefunden wird.
    PLACES_QUERY: props.getProperty('PLACES_QUERY') || 'Hebammen am Marienhospital Bonn',
    // Wie lange (Sekunden) das fertige JSON zwischengespeichert wird.
    // 300 = Änderungen am Sheet erscheinen spätestens nach ~5 Minuten.
    CACHE_SECONDS: parseInt(props.getProperty('CACHE_SECONDS') || '300', 10),
  };
}

// Zuordnung: Sheet-Tab  ->  Unterordner in Google Drive (für Bilder)
const FOLDER_MAPPING_ = {
  'Mitarbeiter': 'Hebammen Bilder',
  'Aktuelles': 'Aktuelles Bilder',
  'FAQ': 'FAQ Bilder',
};

// ----------------------------------------------------------------------------
//  EINSTIEGSPUNKT – wird aufgerufen, wenn die Website die URL lädt.
// ----------------------------------------------------------------------------
function doGet(e) {
  const cfg = CONFIG_();
  const cache = CacheService.getScriptCache();
  const noCache = e && e.parameter && e.parameter.nocache === '1';

  // 1) Aus dem Cache liefern (schnell, schont das Places-Kontingent)
  if (!noCache) {
    const cached = cache.get('payload_v1');
    if (cached) return jsonOutput_(cached);
  }

  // 2) Frisch aufbauen
  const payload = buildPayload_(cfg);
  const json = JSON.stringify(payload);

  // 3) Zwischenspeichern (max. 6h erlaubt; wir nehmen den konfigurierten Wert)
  try {
    cache.put('payload_v1', json, Math.min(Math.max(cfg.CACHE_SECONDS, 1), 21600));
  } catch (err) {
    // Cache-Fehler ignorieren – Antwort trotzdem ausliefern.
  }

  return jsonOutput_(json);
}

function jsonOutput_(jsonString) {
  return ContentService
    .createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------------
//  HAUPT-LOGIK: alle Inhalte einsammeln
// ----------------------------------------------------------------------------
function buildPayload_(cfg) {
  const result = {
    team: [],
    aktuelles: [],
    faq: [],
    reviews: [],
    overallRating: 0,
    totalReviews: 0,
    generatedAt: new Date().toISOString(),
    errors: [],
  };

  try { result.team = readTeam_(cfg); }
  catch (err) { result.errors.push('Mitarbeiter: ' + err); }

  try { result.aktuelles = readAktuelles_(cfg); }
  catch (err) { result.errors.push('Aktuelles: ' + err); }

  try { result.faq = readFAQ_(); }
  catch (err) { result.errors.push('FAQ: ' + err); }

  try {
    const rev = fetchReviews_(cfg);
    result.reviews = rev.reviews;
    result.overallRating = rev.overallRating;
    result.totalReviews = rev.totalReviews;
  } catch (err) {
    result.errors.push('Reviews: ' + err);
  }

  return result;
}

// ----------------------------------------------------------------------------
//  SHEET-HELFER: Tab als Liste von Objekten (Header = Schlüssel, kleingeschrieben)
// ----------------------------------------------------------------------------
function readSheetRows_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Tab "' + sheetName + '" nicht gefunden');

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(function (h) {
    return String(h).toLowerCase().trim();
  });

  const rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    var hasContent = false;
    for (var c = 0; c < headers.length; c++) {
      var val = values[i][c];
      var str = (val === null || val === undefined) ? '' : String(val).trim();
      obj[headers[c]] = str;
      if (str !== '') hasContent = true;
    }
    if (hasContent) rows.push(obj); // leere Zeilen überspringen
  }
  return rows;
}

function pick_(row, keys) {
  for (var i = 0; i < keys.length; i++) {
    if (row[keys[i]] !== undefined && row[keys[i]] !== '') return row[keys[i]];
  }
  return '';
}

// ----------------------------------------------------------------------------
//  MITARBEITER  ->  { name, role, area, phone, email, image }
// ----------------------------------------------------------------------------
function readTeam_(cfg) {
  const rows = readSheetRows_('Mitarbeiter');
  return rows.map(function (row) {
    var firstName = pick_(row, ['vorname', 'first name']);
    var lastName = pick_(row, ['nachname', 'last name']);
    var imageName = pick_(row, ['bildname', 'bild', 'image', 'image name']);
    return {
      firstName: firstName,
      lastName: lastName,
      name: (firstName + ' ' + lastName).trim(),
      role: pick_(row, ['tätigkeiten', 'taetigkeiten', 'rolle', 'role']) || 'Hebamme',
      area: pick_(row, ['einzugsgebiet', 'area']),
      phone: pick_(row, ['telefonnummer', 'telefon', 'phone']),
      email: pick_(row, ['email-adresse', 'email', 'e-mail']),
      image: resolveImage_(imageName, 'Mitarbeiter', cfg),
    };
  });
}

// ----------------------------------------------------------------------------
//  AKTUELLES  ->  { titel, text, bildname, datum, kategorie }
//  (Feld "bildname" enthält die fertige Bild-URL – so erwartet es das Frontend)
// ----------------------------------------------------------------------------
function readAktuelles_(cfg) {
  const rows = readSheetRows_('Aktuelles');
  return rows.map(function (row) {
    var imageName = pick_(row, ['bildname', 'bild', 'image', 'image name']);
    return {
      titel: pick_(row, ['titel', 'title']),
      text: pick_(row, ['beschreibung', 'text', 'inhalt', 'description']),
      datum: pick_(row, ['datum', 'date']),
      kategorie: pick_(row, ['kategorie', 'category']),
      bildname: resolveImage_(imageName, 'Aktuelles', cfg),
    };
  }).filter(function (e) { return e.titel || e.text; });
}

// ----------------------------------------------------------------------------
//  FAQ  ->  { frage, antwort, kategorie }
// ----------------------------------------------------------------------------
function readFAQ_() {
  const rows = readSheetRows_('FAQ');
  return rows.map(function (row) {
    return {
      frage: pick_(row, ['frage', 'question']),
      antwort: pick_(row, ['antwort', 'answer']),
      kategorie: pick_(row, ['kategorie', 'category']),
    };
  }).filter(function (e) { return e.frage && e.antwort; });
}

// ----------------------------------------------------------------------------
//  BILD-AUFLÖSUNG: Bildname (z.B. "Rebekka Sanne.avif") -> öffentliche Bild-URL
// ----------------------------------------------------------------------------
function resolveImage_(rawValue, sheetName, cfg) {
  if (!rawValue) return '';

  // Falls bereits eine vollständige URL eingetragen wurde -> direkt verwenden.
  if (/^https?:\/\//i.test(rawValue)) return rawValue;

  try {
    // Nur den Dateinamen verwenden (evtl. Pfad-Bestandteile entfernen)
    var parts = String(rawValue).replace(/\\/g, '/').split('/');
    var fileName = parts[parts.length - 1].trim();
    if (!fileName) return '';

    var subFolderName = FOLDER_MAPPING_[sheetName];
    if (!subFolderName) return '';

    var folder = getSubFolder_(cfg.DRIVE_FOLDER_ID, subFolderName);
    if (!folder) return '';

    var lastDot = fileName.lastIndexOf('.');
    var baseName = lastDot > 0 ? fileName.substring(0, lastDot) : fileName;

    var file = findFileInFolder_(folder, fileName, baseName);
    if (!file) return '';

    // Bild öffentlich lesbar machen (damit lh3-URL ohne Login lädt).
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      // Wenn schon freigegeben oder keine Rechte -> ignorieren.
    }

    // Zuverlässige Bild-CDN-URL von Google (funktioniert in <img>):
    return 'https://lh3.googleusercontent.com/d/' + file.getId() + '=w1200';
  } catch (err) {
    return '';
  }
}

// Unterordner finden (mit Cache, damit es schnell bleibt)
var FOLDER_CACHE_ = {};
function getSubFolder_(parentId, subFolderName) {
  if (FOLDER_CACHE_[subFolderName]) return FOLDER_CACHE_[subFolderName];
  try {
    var parent = DriveApp.getFolderById(parentId);
    var it = parent.getFoldersByName(subFolderName);
    if (it.hasNext()) {
      var f = it.next();
      FOLDER_CACHE_[subFolderName] = f;
      return f;
    }
  } catch (err) {}
  return null;
}

// Datei im Ordner suchen: exakt -> Basisname+gängige Endungen -> enthält Basisname
function findFileInFolder_(folder, fileName, baseName) {
  // 1) Exakter Name
  var it = folder.getFilesByName(fileName);
  if (it.hasNext()) return it.next();

  // 2) Basisname + gängige Bildendungen
  var exts = ['avif', 'jpg', 'jpeg', 'png', 'webp', 'gif'];
  for (var i = 0; i < exts.length; i++) {
    var it2 = folder.getFilesByName(baseName + '.' + exts[i]);
    if (it2.hasNext()) return it2.next();
  }

  // 3) Durchsuchen: Datei, deren Name den Basisnamen enthält (Bilddateien)
  var all = folder.getFiles();
  var lower = baseName.toLowerCase();
  while (all.hasNext()) {
    var file = all.next();
    var mt = file.getMimeType() || '';
    if (mt.indexOf('image/') === 0 && file.getName().toLowerCase().indexOf(lower) !== -1) {
      return file;
    }
  }
  return null;
}

// ----------------------------------------------------------------------------
//  GOOGLE-BEWERTUNGEN (Places API New)
// ----------------------------------------------------------------------------
function fetchReviews_(cfg) {
  var empty = { reviews: [], overallRating: 0, totalReviews: 0 };
  if (!cfg.PLACES_API_KEY) return empty;

  var response = UrlFetchApp.fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      'X-Goog-Api-Key': cfg.PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.reviews,places.rating,places.userRatingCount',
    },
    payload: JSON.stringify({
      textQuery: cfg.PLACES_QUERY,
      languageCode: 'de',
    }),
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Places API ' + response.getResponseCode() + ': ' + response.getContentText());
  }

  var data = JSON.parse(response.getContentText());
  if (!data.places || data.places.length === 0) return empty;

  var place = data.places[0];
  var reviews = (place.reviews || []).map(function (r) {
    return {
      name: (r.authorAttribution && r.authorAttribution.displayName) || 'Anonym',
      rating: r.rating || 5,
      text: (r.text && r.text.text) || (r.originalText && r.originalText.text) || '',
      date: r.relativePublishTimeDescription || 'Kürzlich',
    };
  }).filter(function (r) { return r.text; });

  return {
    reviews: reviews,
    overallRating: place.rating || 0,
    totalReviews: place.userRatingCount || reviews.length,
  };
}

// ----------------------------------------------------------------------------
//  TEST-FUNKTION – im Apps-Script-Editor ausführbar, um alles zu prüfen.
//  (Menü: Funktion "testPayload" auswählen -> Ausführen -> Logs ansehen)
// ----------------------------------------------------------------------------
function testPayload() {
  var cfg = CONFIG_();
  var payload = buildPayload_(cfg);
  Logger.log('Team: ' + payload.team.length + ' | Aktuelles: ' + payload.aktuelles.length +
    ' | FAQ: ' + payload.faq.length + ' | Reviews: ' + payload.reviews.length +
    ' | Rating: ' + payload.overallRating);
  if (payload.errors.length) Logger.log('FEHLER: ' + JSON.stringify(payload.errors));
  if (payload.team[0]) Logger.log('Erstes Teammitglied: ' + JSON.stringify(payload.team[0]));
  return payload;
}
