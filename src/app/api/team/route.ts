import { NextRequest, NextResponse } from 'next/server';

// Google Sheets API Konfiguration (dynamic import to prevent build crash)
async function getAuth() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!credentials) throw new Error('GOOGLE_SHEETS_CREDENTIALS not set');
  const { google } = await import('googleapis');
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.readonly'],
  });
}

async function getSheets() {
  const { google } = await import('googleapis');
  return google.sheets({ version: 'v4', auth: await getAuth() });
}

async function getDrive() {
  const { google } = await import('googleapis');
  return google.drive({ version: 'v3', auth: await getAuth() });
}

// Ordner-Zuordnung basierend auf Sheet-Namen
const folderMapping: { [key: string]: string } = {
  'Mitarbeiter': 'Hebammen Bilder',
  'Aktuelles': 'Aktuelles Bilder', 
  'FAQ': 'FAQ Bilder',
  'Tipps & Tricks': 'Tipps & Tricks Bilder'
};

// Google Drive Ordner-ID (dein Hauptordner)
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1ABC123XYZ'; // Wird später gesetzt

// Cache für Unterordner-IDs (vermeidet wiederholte API-Calls)
const folderIdCache: { [key: string]: string } = {};

// Proxy-URL über eigene API-Route (umgeht alle Google Drive Zugriffsprobleme)
function driveUrl(fileId: string): string {
  return `/api/drive-image/${fileId}`;
}

// Funktion: Unterordner-ID holen (mit Cache)
async function getSubFolderId(subFolderName: string): Promise<string | null> {
  if (folderIdCache[subFolderName]) return folderIdCache[subFolderName];

  try {
    const drive = await getDrive();
    const res = await drive.files.list({
      q: `name='${subFolderName}' and mimeType='application/vnd.google-apps.folder' and '${DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const folder = res.data.files?.[0];
    if (folder?.id) {
      folderIdCache[subFolderName] = folder.id;
      console.log(`Ordner gefunden: "${subFolderName}" -> ${folder.id}`);
      return folder.id;
    }
    console.error(`Unterordner nicht gefunden: "${subFolderName}" in ${DRIVE_FOLDER_ID}`);
    return null;
  } catch (e) {
    console.error('Fehler beim Suchen des Unterordners:', e);
    return null;
  }
}

// Funktion zum Suchen eines Bildes in Google Drive
async function findImageInDrive(rawValue: string, sheetName: string): Promise<string | null> {
  try {
    const targetFolderName = folderMapping[sheetName];
    if (!targetFolderName) {
      console.error(`Kein Ordner für Sheet: ${sheetName}`);
      return null;
    }

    // Dateinamen robust extrahieren: egal ob Pfad oder nur Name übergeben wurde
    // z.B. "/Hebammen Bilder/Amira El Khawaga.avif" -> "Amira El Khawaga.avif"
    // z.B. "Amira El Khawaga.avif" -> "Amira El Khawaga.avif"
    // z.B. "Amira El Khawaga" -> "Amira El Khawaga"
    const parts = rawValue.replace(/\\/g, '/').split('/');
    const fileNameWithExt = parts[parts.length - 1].trim(); // letzter Teil nach "/"

    // Basisname ohne Endung (z.B. "Amira El Khawaga")
    const lastDot = fileNameWithExt.lastIndexOf('.');
    const baseName = lastDot > 0 ? fileNameWithExt.substring(0, lastDot) : fileNameWithExt;
    const originalExt = lastDot > 0 ? fileNameWithExt.substring(lastDot + 1).toLowerCase() : '';

    console.log(`Suche Bild: baseName="${baseName}", ext="${originalExt}", Ordner="${targetFolderName}"`);

    // Unterordner-ID holen
    const subFolderId = await getSubFolderId(targetFolderName);
    if (!subFolderId) return null;

    // Strategie 1: Exakter Dateiname mit originaler Endung (wie im Sheet angegeben)
    const drive = await getDrive();
    if (fileNameWithExt) {
      const exactRes = await drive.files.list({
        q: `name='${fileNameWithExt}' and '${subFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      if (exactRes.data.files?.[0]?.id) {
        console.log(`Exakter Treffer: ${fileNameWithExt}`);
        return driveUrl(exactRes.data.files[0].id!);
      }
    }

    // Strategie 2: Basisname mit allen gängigen Bildformaten durchprobieren
    const extensions = ['avif', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg'];
    const orderedExts = originalExt
      ? [originalExt, ...extensions.filter(e => e !== originalExt)]
      : extensions;

    for (const ext of orderedExts) {
      const searchName = `${baseName}.${ext}`;
      const res = await drive.files.list({
        q: `name='${searchName}' and '${subFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      if (res.data.files?.[0]?.id) {
        console.log(`Format-Treffer: ${searchName}`);
        return driveUrl(res.data.files[0].id!);
      }
    }

    // Strategie 3: Suche nach Basisname (contains) - Fallback
    const fuzzyRes = await drive.files.list({
      q: `name contains '${baseName}' and '${subFolderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const imgFile = fuzzyRes.data.files?.find(f =>
      f.mimeType?.startsWith('image/') || /\.(avif|jpg|jpeg|png|webp|gif)$/i.test(f.name || '')
    );
    if (imgFile?.id) {
      console.log(`Fuzzy-Treffer: ${imgFile.name}`);
      return driveUrl(imgFile.id);
    }

    console.error(`Kein Bild gefunden für: "${rawValue}" in "${targetFolderName}"`);
    return null;
  } catch (error) {
    console.error('Fehler bei der Bildsuche:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const url = new URL(request.url);
    const sheetName = url.searchParams.get('sheet') || 'Mitarbeiter'; // Dynamisch: Mitarbeiter, Aktuelles, FAQ, etc.
    const range = `${sheetName}!A:Z`; // Alle Spalten vom gewählten Sheet

    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Keine Daten gefunden' }, { status: 404 });
    }

    // Header aus erster Zeile
    const headers = rows[0];
    
    // Daten ab zweiter Zeile verarbeiten
    const teamMembers = await Promise.all(rows.slice(1).map(async (row, index) => {
      const member: any = {};
      
      headers.forEach((header, headerIndex) => {
        const value = row[headerIndex] || '';
        
        switch(header.toLowerCase()) {
          case 'vorname':
            member.firstName = value;
            break;
          case 'nachname':
            member.lastName = value;
            break;
          case 'bildname':
          case 'bild':
            // Raw-Wert direkt speichern - findImageInDrive extrahiert den Namen selbst
            member.imageName = value || '';
            break;
          case 'tätigkeiten':
            member.role = value || 'Hebamme';
            break;
          case 'einzugsgebiet':
            member.area = value;
            break;
          case 'telefonnummer':
            member.phone = value;
            break;
          case 'email-adresse':
            member.email = value;
            break;
        }
      });
      
      // Vollständigen Namen für die Anzeige erstellen
      member.name = `${member.firstName || ''} ${member.lastName || ''}`.trim();
      
      // Bild automatisch im richtigen Ordner suchen
      if (member.imageName) {
        const imageUrl = await findImageInDrive(member.imageName, sheetName);
        if (imageUrl) {
          member.image = imageUrl;
        } else {
          // Fallback zu lokalem Pfad falls Drive-Suche fehlschlägt
          const folderName = folderMapping[sheetName] || 'Hebammen Bilder';
          member.image = `/${folderName}/${member.imageName}`;
        }
      } else {
        // Kein Bild angegeben
        member.image = '';
      }
      
      return member;
    }));

    return NextResponse.json({
      success: true,
      data: teamMembers,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fehler beim Lesen der Google Sheets Daten:', error);
    
    // Fallback zu statischen Daten, falls API nicht funktioniert
    const fallbackData = [
      { name: "Rebekka Sanne", role: "Namenspartnerin", image: "/Hebammen Bilder/Rebekka Sanne.avif" },
      { name: "Franziska Wald", role: "Namenspartnerin", image: "/Hebammen Bilder/Franziska Wald.avif" },
      { name: "Amira El Khawaga", role: "Hebamme", image: "/Hebammen Bilder/Amira El Khawaga.avif" },
      { name: "Ana Raes", role: "Hebamme", image: "/Hebammen Bilder/Ana Raes.avif" },
      { name: "Anna Lichtenthal", role: "Hebamme", image: "/Hebammen Bilder/Anna Lichtenthal.avif" },
      { name: "Annika Marc", role: "Hebamme", image: "/Hebammen Bilder/Annika Marc.avif" },
      { name: "Chaymae Al Arroudi", role: "Hebamme", image: "/Hebammen Bilder/Chaymae Al Arroudi.avif" },
      { name: "Christiane Micha", role: "Hebamme", image: "/Hebammen Bilder/Christiane Micha.avif" },
      { name: "Felicitas Stomps", role: "Hebamme", image: "/Hebammen Bilder/Felicitas Stomps.avif" },
      { name: "Heike Zerwas", role: "Hebamme", image: "/Hebammen Bilder/Heike Zerwas.avif" },
      { name: "Jill Hehnke", role: "Hebamme", image: "/Hebammen Bilder/Jill Hehnke.avif" },
      { name: "Jolanta Reis", role: "Hebamme", image: "/Hebammen Bilder/Jolanta Reis.avif" },
      { name: "Julia Sambale", role: "Hebamme", image: "/Hebammen Bilder/Julia Sambale.avif" },
      { name: "Katharina Thielmann", role: "Hebamme", image: "/Hebammen Bilder/Katharina Thielmann.avif" },
      { name: "Laura Werner", role: "Hebamme", image: "/Hebammen Bilder/Laura Werner.avif" },
      { name: "Lea Bijaleh", role: "Hebamme", image: "/Hebammen Bilder/Lea Bijaleh.avif" },
      { name: "Leonie Fenske", role: "Hebamme", image: "/Hebammen Bilder/Leonie Fenske.avif" },
      { name: "Leonie von Johnston", role: "Hebamme", image: "/Hebammen Bilder/Leonie von Johnston.avif" },
      { name: "Manuela Becker", role: "Hebamme", image: "/Hebammen Bilder/Manuela Becker.avif" },
      { name: "Rahel Karkos", role: "Hebamme", image: "/Hebammen Bilder/Rahel Karkos.avif" },
      { name: "Silke Brenner", role: "Hebamme", image: "/Hebammen Bilder/Silke Brenner.avif" },
      { name: "Stefanie Schmellekamp", role: "Hebamme", image: "/Hebammen Bilder/Stefanie Schmellekamp.avif" },
      { name: "Susanne Bauch", role: "Hebamme", image: "/Hebammen Bilder/Susanne Bauch.avif" },
      { name: "Tina Lüpertz", role: "Hebamme", image: "/Hebammen Bilder/Tina Lüpertz.avif" },
      { name: "Tina Wilke", role: "Hebamme", image: "/Hebammen Bilder/Tina Wilke.avif" },
      { name: "Valentina Walter", role: "Hebamme", image: "/Hebammen Bilder/Valentina Walter.avif" },
      { name: "Vivien Leydecker", role: "Hebamme", image: "/Hebammen Bilder/Vivien Leydecker.avif" },
    ];

    return NextResponse.json({
      success: true,
      data: fallbackData,
      lastUpdated: new Date().toISOString()
    });
  }
}
