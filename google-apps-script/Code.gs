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
    .addSeparator()
    .addItem('Auto-Deploy aktivieren (' + DEPLOY_DELAY_MINUTES_ + '-Min-Fenster)', 'setupAutoDeploy')
    .addItem('Auto-Deploy deaktivieren', 'disableAutoDeploy')
    .addItem('Auto-Deploy Status', 'autoDeployStatus')
    .addToUi();
}

/**
 * Deploy-Button: Löst sofort einen GitHub-Actions-Build aus und zeigt das
 * Ergebnis als Hinweis-Fenster an.
 */
function triggerDeploy() {
  var ui = SpreadsheetApp.getUi();
  var res = deployToGitHub_();
  if (res.ok) {
    ui.alert(
      '✅ Deploy gestartet',
      'Der Build läuft jetzt auf GitHub Actions.\n\nDie Website wird in ~2–3 Minuten aktualisiert.',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert('❌ ' + res.title, res.message, ui.ButtonSet.OK);
  }
}

/**
 * Eigentlicher GitHub-Dispatch – OHNE UI, damit ihn sowohl der Button als auch
 * die automatischen Trigger (ohne Fenster-Kontext) nutzen können.
 * Gibt { ok: true } oder { ok: false, title, message } zurück.
 *
 * Voraussetzung: In den Script-Eigenschaften muss gesetzt sein:
 *   GITHUB_TOKEN  →  Personal Access Token mit "workflow"-Berechtigung
 *                    (GitHub → Settings → Developer settings → Personal access tokens)
 */
function deployToGitHub_() {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    return {
      ok: false,
      title: 'Kein GitHub-Token',
      message: 'Bitte trage in den Script-Eigenschaften einen "GITHUB_TOKEN" ein.\n\n' +
        'Apps Script → Projekteinstellungen → Skripteigenschaften',
    };
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
      Logger.log('Deploy ausgelöst (HTTP 204).');
      return { ok: true };
    }
    Logger.log('Deploy-Fehler ' + code + ': ' + response.getContentText());
    return {
      ok: false,
      title: 'Fehler beim Deploy',
      message: 'GitHub antwortete mit Code ' + code + ':\n' + response.getContentText(),
    };
  } catch (err) {
    Logger.log('Netzwerkfehler beim Deploy: ' + err);
    return { ok: false, title: 'Netzwerkfehler', message: String(err) };
  }
}

// ============================================================================
//  AUTO-DEPLOY — 20-Minuten-Sammelfenster
// ----------------------------------------------------------------------------
//  Ablauf:
//    1. Die ERSTE Änderung am Sheet startet einen Countdown (DEPLOY_DELAY_MINUTES_).
//    2. Während dieses Fensters kannst du beliebig weiter ändern – es wird
//       KEIN zusätzlicher Build gestartet.
//    3. Nach Ablauf des Fensters wird GENAU EIN Deploy mit dem aktuellen Stand
//       ausgelöst. Danach beginnt beim nächsten Edit ein frisches Fenster.
//
//  Einrichtung: einmalig "Auto-Deploy aktivieren" im Menü „🚀 Website"
//  ausführen (legt einen installierbaren onChange-Trigger an und fragt einmalig
//  nach Berechtigungen).
// ============================================================================

// Sammelfenster in Minuten – hier zentral änderbar.
var DEPLOY_DELAY_MINUTES_ = 20;
// Property-Schlüssel: merkt sich, dass bereits ein Deploy ansteht.
var DEPLOY_FLAG_KEY_ = 'DEPLOY_PENDING';

/**
 * EINMALIG ausführen (Menü „🚀 Website" → „Auto-Deploy aktivieren").
 * Legt den installierbaren onChange-Trigger an, der jede Sheet-Änderung bemerkt.
 */
function setupAutoDeploy() {
  removeTriggersByHandler_('onSheetChange'); // keine Duplikate

  var ss = SpreadsheetApp.getActiveSpreadsheet()
    || (CONFIG_().SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG_().SPREADSHEET_ID) : null);
  if (!ss) {
    SpreadsheetApp.getUi().alert('❌ Kein Spreadsheet gefunden. SPREADSHEET_ID prüfen.');
    return;
  }

  ScriptApp.newTrigger('onSheetChange').forSpreadsheet(ss).onChange().create();
  PropertiesService.getScriptProperties().deleteProperty(DEPLOY_FLAG_KEY_);

  SpreadsheetApp.getUi().alert(
    '✅ Auto-Deploy aktiv',
    'Ab jetzt wird nach einer Änderung automatisch in ' + DEPLOY_DELAY_MINUTES_ +
    ' Minuten deployt.\n\nDu hast diese ' + DEPLOY_DELAY_MINUTES_ +
    ' Minuten Zeit, weiter zu ändern – am Ende läuft GENAU EIN Build mit dem ' +
    'dann aktuellen Stand. Der Deploy-Button funktioniert weiterhin jederzeit.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Schaltet die automatische Überwachung wieder ab (entfernt alle zugehörigen
 * Trigger und den Pending-Status). Der Deploy-Button bleibt aktiv.
 */
function disableAutoDeploy() {
  removeTriggersByHandler_('onSheetChange');
  removeTriggersByHandler_('runScheduledDeploy');
  PropertiesService.getScriptProperties().deleteProperty(DEPLOY_FLAG_KEY_);
  SpreadsheetApp.getUi().alert('🛑 Auto-Deploy deaktiviert.',
    'Es wird nicht mehr automatisch deployt. Nutze bei Bedarf den Deploy-Button.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Zeigt im Menü, ob Auto-Deploy aktiv ist und ob gerade ein Fenster läuft.
 */
function autoDeployStatus() {
  var hasWatcher = false, pendingDeploy = false;
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var h = triggers[i].getHandlerFunction();
    if (h === 'onSheetChange') hasWatcher = true;
    if (h === 'runScheduledDeploy') pendingDeploy = true;
  }
  SpreadsheetApp.getUi().alert(
    'ℹ️ Auto-Deploy Status',
    'Überwachung aktiv: ' + (hasWatcher ? 'JA ✅' : 'NEIN ❌') + '\n' +
    'Deploy steht gerade an: ' + (pendingDeploy ? 'JA (Countdown läuft) ⏳' : 'NEIN') + '\n' +
    'Fenster: ' + DEPLOY_DELAY_MINUTES_ + ' Minuten',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Installierbarer onChange-Handler: läuft bei JEDER Sheet-Änderung.
 * Startet den Countdown nur, wenn nicht schon ein Deploy ansteht – so bleibt
 * es trotz vieler Änderungen bei genau EINEM Build.
 */
function onSheetChange(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(3000); } catch (err) { return; } // anderer Lauf war schneller
  try {
    var props = PropertiesService.getScriptProperties();
    if (props.getProperty(DEPLOY_FLAG_KEY_) === '1') return; // Fenster läuft bereits

    props.setProperty(DEPLOY_FLAG_KEY_, '1');
    ScriptApp.newTrigger('runScheduledDeploy')
      .timeBased()
      .after(DEPLOY_DELAY_MINUTES_ * 60 * 1000)
      .create();
    Logger.log('Auto-Deploy: Countdown gestartet (' + DEPLOY_DELAY_MINUTES_ + ' Min).');
  } finally {
    lock.releaseLock();
  }
}

/**
 * Wird ~DEPLOY_DELAY_MINUTES_ nach der ersten Änderung EINMAL ausgelöst:
 * räumt den abgelaufenen Einmal-Trigger + das Flag auf und deployt den
 * aktuellen Stand.
 */
function runScheduledDeploy() {
  removeTriggersByHandler_('runScheduledDeploy'); // den abgelaufenen Trigger löschen
  PropertiesService.getScriptProperties().deleteProperty(DEPLOY_FLAG_KEY_);
  var res = deployToGitHub_();
  Logger.log('Auto-Deploy ausgeführt: ' + (res.ok ? 'OK' : (res.title + ' – ' + res.message)));
}

/** Hilfsfunktion: alle Projekt-Trigger einer bestimmten Handler-Funktion löschen. */
function removeTriggersByHandler_(handlerName) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === handlerName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
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
    // ID des Google Sheets (aus der URL: /spreadsheets/d/HIER/edit)
    SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID') || '',
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

  try { result.faq = readFAQ_(cfg); }
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
function readSheetRows_(sheetName, cfg) {
  const cfg_ = cfg || CONFIG_();
  const ss = SpreadsheetApp.getActiveSpreadsheet()
    || (cfg_.SPREADSHEET_ID ? SpreadsheetApp.openById(cfg_.SPREADSHEET_ID) : null);
  if (!ss) throw new Error('Kein Spreadsheet gefunden. Bitte SPREADSHEET_ID in den Script-Eigenschaften setzen.');
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
  const rows = readSheetRows_('Mitarbeiter', cfg);
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
      // Bildname UND Personenname werden zur Suche genutzt – so reicht es,
      // wenn nur der Name der Person stimmt (Bildname optional / fehlertolerant).
      image: resolveImage_(imageName, (firstName + ' ' + lastName).trim(), 'Mitarbeiter', cfg),
    };
  });
}

// ----------------------------------------------------------------------------
//  AKTUELLES  ->  { titel, text, bildname, datum, kategorie }
//  (Feld "bildname" enthält die fertige Bild-URL – so erwartet es das Frontend)
// ----------------------------------------------------------------------------
function readAktuelles_(cfg) {
  const rows = readSheetRows_('Aktuelles', cfg);
  return rows.map(function (row) {
    var imageName = pick_(row, ['bildname', 'bild', 'image', 'image name']);
    return {
      titel: pick_(row, ['titel', 'title']),
      text: pick_(row, ['beschreibung', 'text', 'inhalt', 'description']),
      datum: pick_(row, ['datum', 'date']),
      kategorie: pick_(row, ['kategorie', 'category']),
      bildname: resolveImage_(imageName, pick_(row, ['titel', 'title']), 'Aktuelles', cfg),
    };
  }).filter(function (e) { return e.titel || e.text; });
}

// ----------------------------------------------------------------------------
//  FAQ  ->  { frage, antwort, kategorie }
// ----------------------------------------------------------------------------
function readFAQ_(cfg) {
  const rows = readSheetRows_('FAQ', cfg);
  return rows.map(function (row) {
    return {
      frage: pick_(row, ['frage', 'question']),
      antwort: pick_(row, ['antwort', 'answer']),
      kategorie: pick_(row, ['kategorie', 'category']),
    };
  }).filter(function (e) { return e.frage && e.antwort; });
}

// ----------------------------------------------------------------------------
//  BILD-AUFLÖSUNG
//  Idee: Es reicht der NAME (entweder die Spalte "Bildname" ODER der
//  Personen-/Titelname). Das Tool durchsucht den Drive-Ordner selbst und nimmt
//  die best passende Datei – egal ob mit/ohne Pfad, mit/ohne Endung, und auch
//  bei kleinen Tippfehlern oder abweichender Schreibweise (Fuzzy-Matching).
// ----------------------------------------------------------------------------
function resolveImage_(rawValue, fallbackName, sheetName, cfg) {
  // Falls bereits eine vollständige URL eingetragen wurde -> direkt verwenden.
  if (rawValue && /^https?:\/\//i.test(rawValue)) return rawValue;

  try {
    var subFolderName = FOLDER_MAPPING_[sheetName];
    if (!subFolderName) return '';

    var folder = getSubFolder_(cfg.DRIVE_FOLDER_ID, subFolderName);
    if (!folder) return '';

    var files = listImageFiles_(folder, subFolderName);
    if (!files.length) return '';

    // Suchbegriffe in Reihenfolge der Priorität: erst der eingetragene
    // Bildname, dann der Personen-/Titelname als Rückfallebene.
    var queries = [];
    if (rawValue) queries.push(normalizeName_(rawValue));
    if (fallbackName) queries.push(normalizeName_(fallbackName));

    var best = null;
    var bestScore = 0;
    for (var q = 0; q < queries.length; q++) {
      if (!queries[q]) continue;
      for (var i = 0; i < files.length; i++) {
        var score = matchScore_(queries[q], files[i].norm);
        if (score > bestScore) {
          bestScore = score;
          best = files[i].file;
        }
      }
      // Perfekter Treffer mit dem ersten (genaueren) Begriff -> fertig.
      if (bestScore >= 0.999) break;
    }

    // Schwelle: unter 0.6 zu unsicher -> lieber nichts als ein falsches Bild.
    if (!best || bestScore < 0.6) return '';

    // Bild öffentlich lesbar machen (damit lh3-URL ohne Login lädt).
    try {
      best.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      // Wenn schon freigegeben oder keine Rechte -> ignorieren.
    }

    // Zuverlässige Bild-CDN-URL von Google (funktioniert in <img>):
    return 'https://lh3.googleusercontent.com/d/' + best.getId() + '=w1200';
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

// Alle Bilddateien eines Ordners EINMAL einlesen (inkl. normalisiertem Namen).
// WICHTIG: nicht nur nach MIME-Typ filtern – Google Drive meldet .avif (und
// manche andere) oft als "application/octet-stream", nicht als "image/...".
// Darum zählt auch die Datei-Endung als gültiges Bild.
var IMAGE_EXT_RE_ = /\.(avif|jpe?g|png|webp|gif|bmp|tiff?|svg|heic|heif)$/i;
var FILE_LIST_CACHE_ = {};
function listImageFiles_(folder, key) {
  if (FILE_LIST_CACHE_[key]) return FILE_LIST_CACHE_[key];
  var list = [];
  var it = folder.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    var name = f.getName();
    var mt = f.getMimeType() || '';
    if (mt.indexOf('image/') === 0 || IMAGE_EXT_RE_.test(name)) {
      list.push({ file: f, norm: normalizeName_(name) });
    }
  }
  FILE_LIST_CACHE_[key] = list;
  return list;
}

// Name vereinheitlichen: Pfad + Endung weg, Umlaute/Akzente entfernen,
// alles klein, nur Buchstaben/Ziffern als durch Leerzeichen getrennte Tokens.
function normalizeName_(s) {
  s = String(s || '').replace(/\\/g, '/');
  s = s.substring(s.lastIndexOf('/') + 1);        // Pfad abschneiden
  var dot = s.lastIndexOf('.');
  if (dot > 0) s = s.substring(0, dot);           // Endung abschneiden
  s = s.toLowerCase();
  s = s.replace(/ß/g, 'ss').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
  if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); // Akzente
  s = s.replace(/[^a-z0-9]+/g, ' ').trim();        // Sonderzeichen -> Leerzeichen
  return s;
}

// Ähnlichkeit zweier normalisierter Namen: 0 (verschieden) .. 1 (identisch).
// Jeder Such-Token wird mit dem ähnlichsten Datei-Token verglichen; der
// Durchschnitt ergibt die Abdeckung. So zählt jeder Namensteil.
function matchScore_(query, candidate) {
  if (!query || !candidate) return 0;
  if (query === candidate) return 1;

  var qt = query.split(' ');
  var ct = candidate.split(' ');
  var sum = 0;
  var count = 0;
  for (var i = 0; i < qt.length; i++) {
    if (!qt[i]) continue;
    var bestTok = 0;
    for (var j = 0; j < ct.length; j++) {
      if (!ct[j]) continue;
      var r = ratio_(qt[i], ct[j]);
      if (r > bestTok) bestTok = r;
    }
    sum += bestTok;
    count++;
  }
  return count ? sum / count : 0;
}

// Ähnlichkeit zweier Wörter über die Levenshtein-Distanz (0..1).
function ratio_(a, b) {
  if (a === b) return 1;
  var max = Math.max(a.length, b.length);
  if (max === 0) return 0;
  return 1 - levenshtein_(a, b) / max;
}

// Levenshtein-Distanz (Anzahl Änderungen, um a in b zu überführen).
function levenshtein_(a, b) {
  var m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  var prev = [], cur = [];
  for (var j = 0; j <= n; j++) prev[j] = j;
  for (var i = 1; i <= m; i++) {
    cur[0] = i;
    for (var k = 1; k <= n; k++) {
      var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
      cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
    }
    for (var p = 0; p <= n; p++) prev[p] = cur[p];
  }
  return prev[n];
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

// ----------------------------------------------------------------------------
//  DEBUG: zeigt pro Mitarbeiter, welche Datei mit welchem Score gematcht wurde.
//  Im Apps-Script-Editor "debugTeamImages" auswählen -> Ausführen -> Logs.
// ----------------------------------------------------------------------------
function debugTeamImages() {
  var cfg = CONFIG_();
  var subFolderName = FOLDER_MAPPING_['Mitarbeiter'];
  var folder = getSubFolder_(cfg.DRIVE_FOLDER_ID, subFolderName);
  if (!folder) {
    Logger.log('❌ Unterordner "' + subFolderName + '" nicht gefunden. DRIVE_FOLDER_ID prüfen!');
    return;
  }

  var files = listImageFiles_(folder, subFolderName);
  Logger.log('📁 Ordner "' + subFolderName + '" – ' + files.length + ' Bilddateien gefunden:');
  for (var f = 0; f < files.length; f++) {
    Logger.log('   • ' + files[f].file.getName() + '   [norm: ' + files[f].norm + ']');
  }

  var rows = readSheetRows_('Mitarbeiter', cfg);
  Logger.log('\n👥 ' + rows.length + ' Mitarbeiter aus dem Sheet:\n');

  for (var r = 0; r < rows.length; r++) {
    var firstName = pick_(rows[r], ['vorname', 'first name']);
    var lastName = pick_(rows[r], ['nachname', 'last name']);
    var personName = (firstName + ' ' + lastName).trim();
    var rawValue = pick_(rows[r], ['bildname', 'bild', 'image', 'image name']);

    var queries = [];
    if (rawValue) queries.push(normalizeName_(rawValue));
    if (personName) queries.push(normalizeName_(personName));

    var best = null, bestScore = 0;
    for (var q = 0; q < queries.length; q++) {
      if (!queries[q]) continue;
      for (var i = 0; i < files.length; i++) {
        var score = matchScore_(queries[q], files[i].norm);
        if (score > bestScore) { bestScore = score; best = files[i]; }
      }
      if (bestScore >= 0.999) break;
    }

    var status = (best && bestScore >= 0.6) ? '✅' : '❌ KEIN BILD';
    Logger.log(status + ' "' + personName + '"  (Bildname-Spalte: "' + rawValue + '")  ->  ' +
      (best ? best.file.getName() : '—') + '  [Score: ' + bestScore.toFixed(2) + ']');
  }
}
  