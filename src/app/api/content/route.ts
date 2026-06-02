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
  'Tipps & Tricks': 'Tipps & Tricks Bilder',
  'Tipps': 'Tipps & Tricks Bilder', // Alternative Schreibweise
  'Tricks': 'Tipps & Tricks Bilder' // Alternative Schreibweise
};

// Google Drive Ordner-ID
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1ABC123XYZ';

// Funktion zum Suchen eines Bildes in Google Drive
async function findImageInDrive(imageName: string, sheetName: string): Promise<string | null> {
  try {
    const targetFolder = folderMapping[sheetName];
    if (!targetFolder) {
      console.error(`Kein Ordner für Sheet: ${sheetName}`);
      return null;
    }

    // Zuerst den Zielordner finden
    const drive = await getDrive();
    const folderResponse = await drive.files.list({
      q: `name='${targetFolder}' and mimeType='application/vnd.google-apps.folder' and parents in '${DRIVE_FOLDER_ID}'`,
      fields: 'files(id, name)',
    });

    const folders = folderResponse.data.files;
    if (!folders || folders.length === 0) {
      console.error(`Ordner nicht gefunden: ${targetFolder}`);
      return null;
    }

    const targetFolderId = folders[0].id;

    // Universelle Bildsuche - alle Bildformate automatisch erkennen
    const baseName = imageName.replace(/\.[^/.]+$/, ""); // Entfernt Dateiendung falls vorhanden
    
    // Alle möglichen Bildformate
    const imageExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'avif', 'svg', 'ico',
      'JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'TIF', 'WEBP', 'AVIF', 'SVG', 'ICO'
    ];

    // Zuerst versuchen: exakter Dateiname mit Endung
    const imageResponse = await drive.files.list({
      q: `name='${imageName}' and parents in '${targetFolderId}'`,
      fields: 'files(id, name, mimeType, webViewLink)',
    });

    const exactMatch = imageResponse.data.files?.find(file => 
      file.mimeType && file.mimeType.startsWith('image/')
    );
    
    if (exactMatch) {
      return `https://drive.google.com/uc?export=view&id=${exactMatch.id}`;
    }

    // Dann versuchen: Basisname mit allen möglichen Endungen
    for (const ext of imageExtensions) {
      const searchName = `${baseName}.${ext}`;
      const searchResponse = await drive.files.list({
        q: `name='${searchName}' and parents in '${targetFolderId}'`,
        fields: 'files(id, name, mimeType, webViewLink)',
      });

      const images = searchResponse.data.files?.filter(file => 
        file.mimeType && file.mimeType.startsWith('image/')
      );
      
      if (images && images.length > 0) {
        const image = images[0];
        return `https://drive.google.com/uc?export=view&id=${image.id}`;
      }
    }

    // Letzter Versuch: Nach Basisnamen suchen
    const baseNameResponse = await drive.files.list({
      q: `name contains '${baseName}' and parents in '${targetFolderId}' and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, webViewLink)',
    });

    const baseMatch = baseNameResponse.data.files?.find(file => 
      file.name && file.name.toLowerCase().includes(baseName.toLowerCase())
    );
    
    if (baseMatch) {
      return `https://drive.google.com/uc?export=view&id=${baseMatch.id}`;
    }

    console.error(`Bild nicht gefunden: ${imageName} in Ordner: ${targetFolder}`);
    return null;
  } catch (error) {
    console.error('Fehler bei der Bildsuche:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sheetName = url.searchParams.get('sheet') || 'Aktuelles'; // Standard: Aktuelles
  
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = `${sheetName}!A:Z`;

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
    
    // Dynamische Datenverarbeitung basierend auf Sheet-Typ
    const content = await Promise.all(rows.slice(1).map(async (row, index) => {
      const item: any = {};
      
      headers.forEach((header, headerIndex) => {
        const value = row[headerIndex] || '';
        
        // Dynamische Feld-Zuordnung basierend auf Header-Namen
        switch(header.toLowerCase()) {
          // Allgemeine Felder
          case 'titel':
          case 'title':
            item.title = value;
            break;
          case 'bildname':
          case 'bild':
          case 'image':
          case 'image name':
            item.imageName = value;
            break;
          case 'beschreibung':
          case 'description':
          case 'text':
          case 'inhalt':
            item.description = value;
            break;
          case 'datum':
          case 'date':
            item.date = value;
            break;
          case 'kategorie':
          case 'category':
            item.category = value;
            break;
          
          // Mitarbeiter-spezifische Felder
          case 'vorname':
          case 'first name':
            item.firstName = value;
            break;
          case 'nachname':
          case 'last name':
            item.lastName = value;
            break;
          case 'tätigkeiten':
          case 'rolle':
          case 'role':
            item.role = value;
            break;
          case 'einzugsgebiet':
          case 'area':
            item.area = value;
            break;
          case 'telefonnummer':
          case 'telefon':
          case 'phone':
            item.phone = value;
            break;
          case 'email-adresse':
          case 'email':
            item.email = value;
            break;
          
          // FAQ-spezifische Felder
          case 'frage':
          case 'question':
            item.question = value;
            break;
          case 'antwort':
          case 'answer':
            item.answer = value;
            break;
          
          // Tipps & Tricks spezifische Felder
          case 'tipp':
          case 'tip':
            item.tip = value;
            break;
          case 'trick':
            item.trick = value;
            break;
          
          // Allgemeiner Fallback
          default:
            item[header.toLowerCase().replace(/\s+/g, '_')] = value;
            break;
        }
      });
      
      // Vollständigen Namen erstellen (falls vorhanden)
      if (item.firstName || item.lastName) {
        item.name = `${item.firstName || ''} ${item.lastName || ''}`.trim();
      }
      
      // Bild automatisch im richtigen Ordner suchen
      if (item.imageName) {
        const imageUrl = await findImageInDrive(item.imageName, sheetName);
        if (imageUrl) {
          item.image = imageUrl;
        } else {
          // Fallback zu lokalem Pfad
          const folderName = folderMapping[sheetName] || 'Hebammen Bilder';
          item.image = `/${folderName}/${item.imageName}`;
        }
      } else {
        item.image = '';
      }
      
      return item;
    }));

    return NextResponse.json({
      success: true,
      data: content,
      sheetName: sheetName,
      folderMapping: folderMapping[sheetName],
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fehler beim Lesen der Google Sheets Daten:', error);
    
    // Fallback zu leeren Daten (status 200 damit Frontend nicht abbricht)
    return NextResponse.json({
      success: true,
      data: [],
      sheetName: url.searchParams.get('sheet') || 'Aktuelles',
      lastUpdated: new Date().toISOString()
    });
  }
}
