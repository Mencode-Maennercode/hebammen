import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function GET(request: NextRequest) {
  try {
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
    
    return NextResponse.json({
      success: false,
      error: 'FAQ API nicht verfügbar',
      data: []
    }, { status: 500 });
  }
}
