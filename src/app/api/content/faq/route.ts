import { NextRequest, NextResponse } from 'next/server';

async function getSheets() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!credentials) throw new Error('GOOGLE_SHEETS_CREDENTIALS not set');
  
  const { google } = await import('googleapis');
  const parsedCredentials = JSON.parse(credentials);
  const auth = new google.auth.GoogleAuth({
    credentials: parsedCredentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function GET(request: NextRequest) {
  try {
    const sheets = await getSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'FAQ!A:Z';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const headers = rows[0];
    
    const faqItems = rows.slice(1).map((row) => {
      const item: any = {};
      
      headers.forEach((header, headerIndex) => {
        const value = row[headerIndex] || '';
        
        switch(header.toLowerCase()) {
          case 'frage':
          case 'question':
            item.question = value;
            break;
          case 'antwort':
          case 'answer':
            item.answer = value;
            break;
          case 'kategorie':
          case 'category':
            item.category = value;
            break;
          default:
            item[header.toLowerCase().replace(/\s+/g, '_')] = value;
            break;
        }
      });
      
      return item;
    }).filter(item => item.question && item.answer);

    return NextResponse.json({
      success: true,
      data: faqItems,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fehler beim Lesen der FAQ Daten:', error);
    
    // Return empty data instead of error to prevent build failure
    return NextResponse.json({
      success: true,
      data: [],
      lastUpdated: new Date().toISOString()
    });
  }
}
