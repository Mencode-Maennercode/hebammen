// Google Sheets API Client Wrapper
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

interface SheetRow {
  [key: string]: string;
}

/**
 * Initialize Google Sheets API client with service account credentials
 */
export async function getSheetsClient() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  
  if (!credentials) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set');
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: SCOPES,
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
}

/**
 * Fetch data from a specific worksheet
 */
export async function getWorksheetData(worksheetName: string): Promise<SheetRow[]> {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID environment variable is not set');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${worksheetName}!A1:Z`,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }

    // First row contains headers
    const headers = rows[0].map(h => h.toLowerCase().trim());
    
    // Convert remaining rows to objects
    return rows.slice(1).map(row => {
      const obj: SheetRow = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  } catch (error) {
    console.error(`Error fetching data from worksheet "${worksheetName}":`, error);
    throw new Error(`Failed to fetch data from worksheet "${worksheetName}"`);
  }
}

/**
 * Fetch Aktuelles data
 */
export async function getAktuellesData() {
  const data = await getWorksheetData('Aktuelles');
  return data.map(row => ({
    titel: row.titel || '',
    text: row.text || '',
    bildname: row.bildname || '',
    datum: row.datum || '',
    kategorie: row.kategorie || '',
  }));
}

/**
 * Fetch FAQ data
 */
export async function getFAQData() {
  const data = await getWorksheetData('FAQ');
  return data.map(row => ({
    frage: row.frage || '',
    antwort: row.antwort || '',
    kategorie: row.kategorie || '',
  }));
}

/**
 * Fetch Tipps & Tricks data (prepared for future use)
 */
export async function getTippsTricksData() {
  const data = await getWorksheetData('TippsTricks');
  return data.map(row => ({
    titel: row.titel || '',
    inhalt: row.inhalt || '',
    kategorie: row.kategorie || '',
    bildname: row.bildname || '',
  }));
}
